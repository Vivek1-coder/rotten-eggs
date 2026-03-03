"use client";

import { Snackbar, Alert } from "@mui/material";

type ShareSnackbarProps = {
  open: boolean;
  message: string;
  onClose: () => void;
};

export default function ShareSnackbar({ open, message, onClose }: ShareSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity="success" className="share-alert">
        {message}
      </Alert>
    </Snackbar>
  );
}
