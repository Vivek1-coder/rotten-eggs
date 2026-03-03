"use client";

import { Card, CardContent, Skeleton, Box } from "@mui/material";

export default function LoadingSkeleton() {
  return (
    <Card className="skeleton-card neon-card-muted">
      <Skeleton
        variant="rectangular"
        animation="wave"
        className="skeleton-poster"
        sx={{ bgcolor: "rgba(0,255,255,0.06)" }}
      />
      <CardContent className="skeleton-content">
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
          sx={{ bgcolor: "rgba(57,255,20,0.08)", mt: 1, mb: 2, borderRadius: 4 }}
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
        <Box className="skeleton-divider">
          <Skeleton variant="text" width="100%" height={18} sx={{ bgcolor: "rgba(255,255,255,0.06)" }} animation="wave" />
          <Skeleton variant="text" width="100%" height={18} sx={{ bgcolor: "rgba(255,255,255,0.06)" }} animation="wave" />
          <Skeleton variant="text" width="60%" height={18} sx={{ bgcolor: "rgba(255,255,255,0.06)" }} animation="wave" />
        </Box>
      </CardContent>
    </Card>
  );
}
