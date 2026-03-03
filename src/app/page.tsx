"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import type { Movie, Review } from "@/types/movie";
import NeonGridBackground from "@/components/NeonGridBackground";
import SearchBar from "@/components/SearchBar";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import MovieCard from "@/components/MovieCard";
import ReviewsSection from "@/components/ReviewsSection";
import InsightsSection from "@/components/InsightsSection";
import TrailerDialog from "@/components/TrailerDialog";
import ShareSnackbar from "@/components/ShareSnackbar";

export default function MoviePage() {
  const [imdbId, setImdbId] = useState("");
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [insights, setInsights] = useState<string | null>(null);
  const [sentiment, setSentiment] = useState<string | null>(null);

  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  // ── Fetch movie + trailer + sentiment ───────────────
  const fetchMovie = async () => {
    if (!imdbId) return;
    setLoading(true);
    setMovie(null);
    setTrailerUrl(null);
    setVideoId(null);
    setTrailerOpen(false);
    setReviews([]);
    setInsights(null);
    setSentiment(null);

    try {
      const res = await fetch(`/api/movie?id=${imdbId}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        setLoading(false);
        return;
      }

      setMovie(data);

      fetch(`/api/trailer?title=${encodeURIComponent(data.Title)}&year=${data.Year}`)
        .then((r) => r.json())
        .then((t) => {
          setTrailerUrl(t.trailer);
          if (t.videoId) setVideoId(t.videoId);
        })
        .catch(() => {});

      fetch(`/api/sentiment?title=${encodeURIComponent(data.Title)}&year=${data.Year}&rating=${data.imdbRating}`)
        .then((r) => r.json())
        .then((s) => {
          if (s.sentiment) setSentiment(s.sentiment);
        })
        .catch(() => {});

      fetchReviews(data.imdbID || imdbId);
    } catch {
      alert("Failed to fetch movie");
    }

    setLoading(false);
  };

  // ── Fetch reviews ───────────────────────────────────
  const fetchReviews = async (id: string) => {
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/reviews?id=${id}`);
      const data = await res.json();
      if (data.reviews?.length > 0) setReviews(data.reviews);
    } catch {
      console.error("Failed to fetch reviews");
    }
    setReviewsLoading(false);
  };

  // ── Generate AI insights ────────────────────────────
  const generateInsights = async () => {
    if (!movie || reviews.length === 0) return;
    setInsightsLoading(true);

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieTitle: movie.Title, reviews }),
      });
      const data = await res.json();
      setInsights(
        data.insights || "Could not generate insights. Make sure GROQ_API_KEY is set in .env",
      );
    } catch {
      setInsights("Failed to generate insights.");
    }

    setInsightsLoading(false);
  };

  // ── Share ───────────────────────────────────────────
  const handleShare = async () => {
    const shareData = {
      title: `${movie?.Title} (${movie?.Year})`,
      text: `Check out "${movie?.Title}" — IMDb rating: ${movie?.imdbRating}/10\n${movie?.Plot}`,
      url: `https://www.imdb.com/title/${movie?.imdbID || imdbId}/`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* fall through to clipboard */
      }
    }

    try {
      await navigator.clipboard.writeText(
        `${shareData.title}\n${shareData.text}\n${shareData.url}`,
      );
      setSnackMsg("Copied to clipboard!");
      setSnackOpen(true);
    } catch {
      setSnackMsg("Could not share.");
      setSnackOpen(true);
    }
  };

  // ── Render ──────────────────────────────────────────
  return (
    <>
      <NeonGridBackground />
    <Box className="page-container ">
      <Typography variant="h3" className="page-header mb-3">
       Movie Insider
      </Typography>

      <SearchBar
        imdbId={imdbId}
        setImdbId={setImdbId}
        onSearch={fetchMovie}
        loading={loading}
      />

      {loading && <LoadingSkeleton />}

      {movie && (
        <Box className="movie-results-wrapper">
          <MovieCard
            movie={movie}
            sentiment={sentiment}
            trailerUrl={trailerUrl}
            videoId={videoId}
            onTrailerOpen={() => setTrailerOpen(true)}
            onShare={handleShare}
          />

          <ReviewsSection reviews={reviews} loading={reviewsLoading} />

          <InsightsSection
            insights={insights}
            loading={insightsLoading}
            reviewCount={reviews.length}
            onGenerate={generateInsights}
          />
        </Box>
      )}

      <TrailerDialog
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        videoId={videoId}
        movieTitle={movie?.Title}
      />

      <ShareSnackbar
        open={snackOpen}
        message={snackMsg}
        onClose={() => setSnackOpen(false)}
      />
    </Box>
    </>
  );
}
