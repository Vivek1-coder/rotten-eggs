"use client";

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Tooltip,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StarIcon from "@mui/icons-material/Star";
import type { Movie } from "@/types/movie";

type MovieCardProps = {
  movie: Movie;
  sentiment: string | null;
  trailerUrl: string | null;
  videoId: string | null;
  onTrailerOpen: () => void;
  onShare: () => void;
};

export default function MovieCard({
  movie,
  sentiment,
  trailerUrl,
  videoId,
  onTrailerOpen,
  onShare,
}: MovieCardProps) {
  return (
    <Card className="movie-card neon-card">
      <Box className="movie-poster-wrap">
        <img
          src={movie.Poster}
          alt={movie.Title}
          className="movie-poster"
        />
      </Box>
      <CardContent className="movie-content">
        {/* Title & year */}
        <Typography variant="h5" className="movie-title">
          {movie.Title}{" "}
          <Typography component="span" className="movie-year">
            ({movie.Year})
          </Typography>
        </Typography>

        {/* Sentiment badge */}
        {sentiment && (
          <Box className="sentiment-badge">
            <AutoAwesomeIcon className="sentiment-icon" />
            <Typography variant="body2" className="sentiment-text">
              &ldquo;{sentiment}&rdquo;
            </Typography>
          </Box>
        )}

        {/* Meta chips */}
        <Box className="meta-chips">
          <Chip
            icon={<StarIcon className="rating-star-icon" />}
            label={`IMDb ${movie.imdbRating}`}
            size="small"
            className="chip-rating"
          />
          {movie.Genre && (
            <Chip label={movie.Genre} size="small" className="chip-genre" />
          )}
          {movie.Runtime && (
            <Chip label={movie.Runtime} size="small" className="chip-runtime" />
          )}
        </Box>

        {/* Director */}
        {movie.Director && (
          <Typography variant="body2" className="movie-meta-text">
            <Box component="span" className="meta-label">Director:</Box>{" "}
            {movie.Director}
          </Typography>
        )}

        {/* Cast */}
        <Typography variant="body2" className="movie-meta-text movie-cast">
          <Box component="span" className="meta-label">Cast:</Box>{" "}
          {movie.Actors}
        </Typography>

        {/* Plot */}
        <Typography variant="body2" className="movie-plot">
          {movie.Plot}
        </Typography>

        {/* Action buttons */}
        <Box className="movie-actions">
          {trailerUrl && (
            <Button
              variant="outlined"
              startIcon={<PlayArrowIcon />}
              onClick={() => {
                if (videoId) {
                  onTrailerOpen();
                } else {
                  window.open(trailerUrl, "_blank", "noopener,noreferrer");
                }
              }}
              size="small"
              className="btn-trailer"
            >
              Watch Trailer
            </Button>
          )}

          <Tooltip title="Share movie details">
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={onShare}
              size="small"
              className="btn-share"
            >
              Share
            </Button>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
