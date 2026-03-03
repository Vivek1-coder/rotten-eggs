"use client";

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Skeleton,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RateReviewIcon from "@mui/icons-material/RateReview";
import type { Review } from "@/types/movie";

type ReviewsSectionProps = {
  reviews: Review[];
  loading: boolean;
};

export default function ReviewsSection({ reviews, loading }: ReviewsSectionProps) {
  return (
    <Card className="reviews-card neon-card">
      <CardContent className="section-content">
        <Box className="section-header">
          <RateReviewIcon className="icon-cyan" />
          <Typography variant="h6" className="section-title-cyan">
            Audience Reviews
          </Typography>
        </Box>

        {loading && (
          <Box className="reviews-skeleton">
            {[1, 2, 3].map((i) => (
              <Box key={i} className="review-skeleton-item">
                <Skeleton variant="text" width="40%" height={24} sx={{ bgcolor: "rgba(0,255,255,0.08)" }} animation="wave" />
                <Skeleton variant="text" width="100%" height={16} sx={{ bgcolor: "rgba(255,255,255,0.05)" }} animation="wave" />
                <Skeleton variant="text" width="85%" height={16} sx={{ bgcolor: "rgba(255,255,255,0.05)" }} animation="wave" />
              </Box>
            ))}
          </Box>
        )}

        {!loading && reviews.length === 0 && (
          <Typography variant="body2" className="text-muted">
            No audience reviews found for this title.
          </Typography>
        )}

        {!loading && reviews.length > 0 && (
          <>
            {reviews.slice(0, 5).map((review, i) => (
              <Accordion key={i} className="review-accordion">
                <AccordionSummary expandIcon={<ExpandMoreIcon className="icon-cyan" />}>
                  <Box className="review-summary">
                    {review.rating !== "N/A" && (
                      <Chip
                        label={`${review.rating}/10`}
                        size="small"
                        className="chip-review-rating"
                      />
                    )}
                    <Typography variant="body2" className="review-title">
                      {review.title}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" className="review-content">
                    {review.content}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}

            {reviews.length > 5 && (
              <Typography variant="caption" className="reviews-count">
                Showing 5 of {reviews.length} reviews
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
