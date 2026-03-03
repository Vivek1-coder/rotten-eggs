"use client";

import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type TrailerDialogProps = {
  open: boolean;
  onClose: () => void;
  videoId: string | null;
  movieTitle?: string;
};

export default function TrailerDialog({ open, onClose, videoId, movieTitle }: TrailerDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ className: "trailer-dialog-paper" }}
    >
      <Box className="trailer-header">
        <Typography variant="subtitle1" className="trailer-title">
          {movieTitle} — Trailer
        </Typography>
        <IconButton onClick={onClose} className="trailer-close-btn">
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent className="trailer-content">
        {videoId && (
          <Box className="trailer-aspect-ratio">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={`${movieTitle} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="trailer-iframe"
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
