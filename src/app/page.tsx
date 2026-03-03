"use client";

import { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Skeleton,
  Box,
  Button,
  Tooltip,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StarIcon from "@mui/icons-material/Star";
import RateReviewIcon from "@mui/icons-material/RateReview";

// ─── Types ──────────────────────────────────────────────
type Movie = {
  Title: string;
  Year: string;
  Poster: string;
  Actors: string;
  Plot: string;
  imdbRating: string;
  Genre?: string;
  Director?: string;
  Runtime?: string;
  imdbID?: string;
};

type Review = {
  title: string;
  content: string;
  rating: string;
  author: string;
};

// ─── Neon style helpers ─────────────────────────────────
const neonCard = {
  background: "linear-gradient(145deg, #0a0a0a 0%, #1a1a2e 100%)",
  border: "1px solid #0ff",
  borderRadius: 3,
  boxShadow: "0 0 15px #0ff, 0 0 30px rgba(0,255,255,0.15)",
  overflow: "hidden" as const,
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0 0 25px #0ff, 0 0 50px rgba(0,255,255,0.25)",
  },
};

const neonCardMuted = {
  background: "linear-gradient(145deg, #0a0a0a 0%, #1a1a2e 100%)",
  border: "1px solid rgba(0,255,255,0.2)",
  borderRadius: 3,
  overflow: "hidden" as const,
};

// ─── Component ──────────────────────────────────────────
export default function MoviePage() {
  const [imdbId, setImdbId] = useState("");
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

  const [trailerUrl, setTrailerUrl] = useState<string | null>("https://youtu.be/TmQOFWX9D3o?si=nM9-jgErLMi2rS56");
  const [videoId, setVideoId] = useState<string | null>("TmQOFWX9D3o");
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [insights, setInsights] = useState<string | null>(null);

  const [sentiment, setSentiment] = useState<string | null>(null);

  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  // ── Fetch movie + trailer ───────────────────────────
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

      // Fetch trailer in parallel
      fetch(
        `/api/trailer?title=${encodeURIComponent(data.Title)}&year=${data.Year}`,
      )
        .then((r) => r.json())
        .then((t) => {
          setTrailerUrl(t.trailer);
          if (t.videoId) setVideoId(t.videoId);
        })
        .catch(() => {});

      // Fetch AI sentiment in parallel
      fetch(
        `/api/sentiment?title=${encodeURIComponent(data.Title)}&year=${data.Year}&rating=${data.imdbRating}`,
      )
        .then((r) => r.json())
        .then((s) => {
          if (s.sentiment) setSentiment(s.sentiment);
        })
        .catch(() => {});

      // Fetch reviews automatically
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
      if (data.reviews && data.reviews.length > 0) {
        setReviews(data.reviews);
      }
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
      if (data.insights) {
        setInsights(data.insights);
      } else {
        setInsights(
          "Could not generate insights. Make sure GROQ_API_KEY is set in .env",
        );
      }
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
        // User cancelled or share failed – fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
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

  // ── Render markdown-ish insights ────────────────────
  const renderInsights = (text: string) => {
    return text.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <Box key={i} sx={{ height: 8 }} />;
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return (
          <Typography
            key={i}
            variant="subtitle1"
            sx={{
              color: "#0ff",
              fontWeight: 700,
              textShadow: "0 0 8px rgba(0,255,255,0.4)",
              mt: 1.5,
              mb: 0.5,
            }}
          >
            {trimmed.replace(/\*\*/g, "")}
          </Typography>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        return (
          <Typography
            key={i}
            variant="body2"
            sx={{ color: "#d0d0d0", pl: 2, mb: 0.3 }}
          >
            • {trimmed.substring(2)}
          </Typography>
        );
      }
      // Bold sections inline
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      return (
        <Typography key={i} variant="body2" sx={{ color: "#d0d0d0", mb: 0.3 }}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <Box
                key={j}
                component="span"
                sx={{
                  color: "#ff00ff",
                  fontWeight: 700,
                  textShadow: "0 0 6px rgba(255,0,255,0.3)",
                }}
              >
                {part.replace(/\*\*/g, "")}
              </Box>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
        </Typography>
      );
    });
  };

  // ─────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: { xs: 2, md: 4 },

      }}
    >
      {/* Header */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          mb: 4,
          mt: 2,
          textAlign: "center",
          background: "linear-gradient(90deg, #0ff, #ff00ff, #39ff14)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "none",
          fontSize: { xs: "1.8rem", md: "2.6rem" },
        }}
      >
        AI Movie Insight Builder
      </Typography>

  {/* <div className="video-background">
  <iframe
    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&showinfo=0&rel=0`}
    allow="autoplay"
    frameBorder="0"
  ></iframe>
</div> */}

      {/* Search */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mb: 4,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
      
        <input
          style={{
            border: "1px solid #0ff",
            background: "rgba(0,255,255,0.04)",
            color: "#e0e0e0",
            padding: "10px 16px",
            borderRadius: 8,
            outline: "none",
            fontSize: 15,
            width: 280,
          }}
          placeholder="Enter IMDb ID (e.g. tt0133093)"
          value={imdbId}
          onChange={(e) => setImdbId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchMovie()}
        />
        <Button
          variant="contained"
          onClick={fetchMovie}
          disabled={loading}
          sx={{
            background: "linear-gradient(135deg, #0ff 0%, #00bcd4 100%)",
            color: "#000",
            fontWeight: 700,
            px: 3,
            textTransform: "none",
            boxShadow: "0 0 12px rgba(0,255,255,0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #39ff14 0%, #0ff 100%)",
              boxShadow: "0 0 20px rgba(0,255,255,0.6)",
            },
          }}
        >
          Search
        </Button>
      </Box>

      {/* ── Loading Skeleton ─────────────────────────── */}
      {loading && (
        <Card
          sx={{
            maxWidth: { xs: 420, lg: 800 },
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            ...neonCardMuted,
          }}
        >
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{
              bgcolor: "rgba(0,255,255,0.06)",
              height: { xs: 500, lg: "auto" },
              width: { xs: "100%", lg: 300 },
              minHeight: { lg: 420 },
              flexShrink: 0,
            }}
          />
          <CardContent sx={{ p: 3, flex: 1 }}>
            <Skeleton
              variant="text"
              width="75%"
              height={36}
              sx={{ bgcolor: "rgba(0,255,255,0.08)", mb: 1 }}
              animation="wave"
            />
            <Skeleton
              variant="rounded"
              width={120}
              height={32}
              sx={{
                bgcolor: "rgba(57,255,20,0.08)",
                mt: 1,
                mb: 2,
                borderRadius: 4,
              }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="30%"
              height={20}
              sx={{ bgcolor: "rgba(255,0,255,0.08)", mb: 0.5 }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="90%"
              height={20}
              sx={{ bgcolor: "rgba(255,255,255,0.06)", mb: 2 }}
              animation="wave"
            />
            <Box sx={{ borderTop: "1px solid rgba(0,255,255,0.15)", pt: 2 }}>
              <Skeleton
                variant="text"
                width="100%"
                height={18}
                sx={{ bgcolor: "rgba(255,255,255,0.06)" }}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width="100%"
                height={18}
                sx={{ bgcolor: "rgba(255,255,255,0.06)" }}
                animation="wave"
              />
              <Skeleton
                variant="text"
                width="60%"
                height={18}
                sx={{ bgcolor: "rgba(255,255,255,0.06)" }}
                animation="wave"
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── Movie Card ───────────────────────────────── */}
      {movie && (
        <Box sx={{ maxWidth: { xs: 420, lg: 850 }, width: "100%" }}>
          <Card
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              ...neonCard,
              mb: 3,
            }}
          >
            <CardMedia
              component="img"
              image={movie.Poster}
              alt={movie.Title}
              sx={{
                height: { xs: 500, lg: "auto" },
                width: { xs: "100%", lg: 300 },
                minHeight: { lg: 420 },
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <CardContent
              sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}
            >
              {/* Title & year */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#0ff",
                  textShadow: "0 0 10px rgba(0,255,255,0.6)",
                  mb: 0.5,
                }}
              >
                {movie.Title}{" "}
                <Typography
                  component="span"
                  sx={{ color: "#b0b0b0", fontSize: "0.85rem" }}
                >
                  ({movie.Year})
                </Typography>
              </Typography>

              {/* Sentiment badge */}
              {sentiment && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.8,
                    mt: 1,
                    mb: 1,
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 2,
                    background: "rgba(255,0,255,0.06)",
                    border: "1px solid rgba(255,0,255,0.3)",
                    boxShadow: "0 0 12px rgba(255,0,255,0.15)",
                  }}
                >
                  <AutoAwesomeIcon sx={{ color: "#ff00ff", fontSize: 16 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#ff00ff",
                      fontWeight: 600,
                      fontStyle: "italic",
                      textShadow: "0 0 8px rgba(255,0,255,0.4)",
                      fontSize: "0.8rem",
                    }}
                  >
                    &ldquo;{sentiment}&rdquo;
                  </Typography>
                </Box>
              )}

              {/* Meta chips */}
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1, mb: 2 }}
              >
                <Chip
                  icon={
                    <StarIcon
                      sx={{ color: "#39ff14 !important", fontSize: 16 }}
                    />
                  }
                  label={`IMDb ${movie.imdbRating}`}
                  size="small"
                  sx={{
                    background: "transparent",
                    border: "1px solid #39ff14",
                    color: "#39ff14",
                    fontWeight: 600,
                    textShadow: "0 0 6px rgba(57,255,20,0.5)",
                    boxShadow: "0 0 8px rgba(57,255,20,0.25)",
                  }}
                />
                {movie.Genre && (
                  <Chip
                    label={movie.Genre}
                    size="small"
                    sx={{
                      background: "transparent",
                      border: "1px solid rgba(0,255,255,0.3)",
                      color: "#0ff",
                      fontSize: "0.75rem",
                    }}
                  />
                )}
                {movie.Runtime && (
                  <Chip
                    label={movie.Runtime}
                    size="small"
                    sx={{
                      background: "transparent",
                      border: "1px solid rgba(255,0,255,0.3)",
                      color: "#ff00ff",
                      fontSize: "0.75rem",
                    }}
                  />
                )}
              </Box>

              {/* Director */}
              {movie.Director && (
                <Typography variant="body2" sx={{ color: "#b0b0b0", mb: 1 }}>
                  <Box
                    component="span"
                    sx={{
                      color: "#ff00ff",
                      fontWeight: 600,
                      textShadow: "0 0 5px rgba(255,0,255,0.3)",
                    }}
                  >
                    Director:
                  </Box>{" "}
                  {movie.Director}
                </Typography>
              )}

              {/* Cast */}
              <Typography variant="body2" sx={{ color: "#b0b0b0", mb: 2 }}>
                <Box
                  component="span"
                  sx={{
                    color: "#ff00ff",
                    fontWeight: 600,
                    textShadow: "0 0 5px rgba(255,0,255,0.3)",
                  }}
                >
                  Cast:
                </Box>{" "}
                {movie.Actors}
              </Typography>

              {/* Plot */}
              <Typography
                variant="body2"
                sx={{
                  color: "#d0d0d0",
                  lineHeight: 1.7,
                  borderTop: "1px solid rgba(0,255,255,0.15)",
                  pt: 2,
                  mb: 2,
                  flex: 1,
                }}
              >
                {movie.Plot}
              </Typography>

              {/* Action buttons */}
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: "auto" }}
              >
                {trailerUrl && (
                  <Button
                    variant="outlined"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => {
                      if (videoId) {
                        setTrailerOpen(true);
                      } else {
                        window.open(
                          trailerUrl,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }
                    }}
                    size="small"
                    sx={{
                      borderColor: "#ff0044",
                      color: "#ff0044",
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "0 0 8px rgba(255,0,68,0.25)",
                      "&:hover": {
                        borderColor: "#ff0044",
                        background: "rgba(255,0,68,0.1)",
                        boxShadow: "0 0 16px rgba(255,0,68,0.4)",
                      },
                    }}
                  >
                    Watch Trailer
                  </Button>
                )}

                <Tooltip title="Share movie details">
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={handleShare}
                    size="small"
                    sx={{
                      borderColor: "#39ff14",
                      color: "#39ff14",
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "0 0 8px rgba(57,255,20,0.2)",
                      "&:hover": {
                        borderColor: "#39ff14",
                        background: "rgba(57,255,20,0.1)",
                        boxShadow: "0 0 16px rgba(57,255,20,0.35)",
                      },
                    }}
                  >
                    Share
                  </Button>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>

          {/* ── Reviews Section ─────────────────────────── */}
          <Card sx={{ width: "100%", ...neonCard, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <RateReviewIcon sx={{ color: "#0ff" }} />
                <Typography
                  variant="h6"
                  sx={{
                    color: "#0ff",
                    fontWeight: 700,
                    textShadow: "0 0 8px rgba(0,255,255,0.5)",
                  }}
                >
                  Audience Reviews
                </Typography>
              </Box>

              {reviewsLoading && (
                <Box sx={{ py: 2 }}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Skeleton
                        variant="text"
                        width="40%"
                        height={24}
                        sx={{ bgcolor: "rgba(0,255,255,0.08)" }}
                        animation="wave"
                      />
                      <Skeleton
                        variant="text"
                        width="100%"
                        height={16}
                        sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
                        animation="wave"
                      />
                      <Skeleton
                        variant="text"
                        width="85%"
                        height={16}
                        sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
                        animation="wave"
                      />
                    </Box>
                  ))}
                </Box>
              )}

              {!reviewsLoading && reviews.length === 0 && (
                <Typography variant="body2" sx={{ color: "#888" }}>
                  No audience reviews found for this title.
                </Typography>
              )}

              {!reviewsLoading && reviews.length > 0 && (
                <>
                  {reviews.slice(0, 5).map((review, i) => (
                    <Accordion
                      key={i}
                      sx={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(0,255,255,0.1)",
                        mb: 1,
                        "&:before": { display: "none" },
                        borderRadius: "8px !important",
                        overflow: "hidden",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "#0ff" }} />}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {review.rating !== "N/A" && (
                            <Chip
                              label={`${review.rating}/10`}
                              size="small"
                              sx={{
                                background: "transparent",
                                border: "1px solid #39ff14",
                                color: "#39ff14",
                                fontSize: "0.7rem",
                                height: 22,
                              }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            sx={{ color: "#e0e0e0", fontWeight: 600 }}
                          >
                            {review.title}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography
                          variant="body2"
                          sx={{ color: "#c0c0c0", lineHeight: 1.7 }}
                        >
                          {review.content}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  {reviews.length > 5 && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#888", mt: 1, display: "block" }}
                    >
                      Showing 5 of {reviews.length} reviews
                    </Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* ── AI Insights Section ───────────────────── */}
          <Card sx={{ width: "100%", ...neonCard, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <AutoAwesomeIcon sx={{ color: "#ff00ff" }} />
                <Typography
                  variant="h6"
                  sx={{
                    color: "#ff00ff",
                    fontWeight: 700,
                    textShadow: "0 0 8px rgba(255,0,255,0.5)",
                  }}
                >
                  AI-Powered Insights
                </Typography>
              </Box>

              {!insights && !insightsLoading && (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="body2" sx={{ color: "#888", mb: 2 }}>
                    {reviews.length > 0
                      ? "Generate an AI analysis of audience reviews using Groq."
                      : "Waiting for reviews to load before generating insights..."}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={generateInsights}
                    disabled={reviews.length === 0}
                    sx={{
                      background:
                        "linear-gradient(135deg, #ff00ff 0%, #7b2ff7 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      textTransform: "none",
                      boxShadow: "0 0 15px rgba(255,0,255,0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #ff44ff 0%, #9b4ff7 100%)",
                        boxShadow: "0 0 25px rgba(255,0,255,0.5)",
                      },
                      "&.Mui-disabled": {
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.3)",
                      },
                    }}
                  >
                    Generate Insights
                  </Button>
                </Box>
              )}

              {insightsLoading && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress
                    sx={{
                      color: "#ff00ff",
                      filter: "drop-shadow(0 0 8px rgba(255,0,255,0.5))",
                      mb: 2,
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
                    Analyzing reviews with AI...
                  </Typography>
                </Box>
              )}

              {insights && !insightsLoading && (
                <Paper
                  sx={{
                    p: 2.5,
                    background: "rgba(255,0,255,0.03)",
                    border: "1px solid rgba(255,0,255,0.15)",
                    borderRadius: 2,
                  }}
                >
                  {renderInsights(insights)}
                </Paper>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ── Trailer Player Dialog ──────────────── */}
      <Dialog
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "#000",
            border: "1px solid #ff0044",
            boxShadow: "0 0 30px rgba(255,0,68,0.4)",
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1,
            borderBottom: "1px solid rgba(255,0,68,0.2)",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: "#ff0044",
              fontWeight: 700,
              textShadow: "0 0 8px rgba(255,0,68,0.5)",
            }}
          >
            {movie?.Title} — Trailer
          </Typography>
          <IconButton
            onClick={() => setTrailerOpen(false)}
            sx={{ color: "#ff0044" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 0 }}>
          {videoId && (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                paddingTop: "56.25%", // 16:9 aspect ratio
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={`${movie?.Title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for share notification */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity="success"
          sx={{
            background: "#1a1a2e",
            border: "1px solid #39ff14",
            color: "#39ff14",
          }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
