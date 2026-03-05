"use client";

import { useState, useEffect, useCallback } from "react";
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
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RateReviewIcon from "@mui/icons-material/RateReview";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import type { Review } from "@/types/movie";

type ReviewsSectionProps = {
  reviews: Review[];
  loading: boolean;
};

type Category = "all" | "positive" | "mixed" | "negative";
type SentimentCategory = "positive" | "mixed" | "negative";

/** Fallback: simple rating-based heuristic (used while AI loads or on error) */
function fallbackCategorize(review: Review): SentimentCategory {
  const rating = parseFloat(review.rating);
  if (isNaN(rating)) return "mixed";
  if (rating >= 7) return "positive";
  if (rating >= 4) return "mixed";
  return "negative";
}

function ReviewList({
  reviews,
  categoryMap,
  titleMap,
}: {
  reviews: Review[];
  categoryMap: Map<Review, SentimentCategory>;
  titleMap: Map<Review, string>;
}) {
  return (
    <>
      {reviews.slice(0, 5).map((review, i) => {
        const cat = categoryMap.get(review) ?? fallbackCategorize(review);
        return (
          <Accordion key={i} className={`review-accordion review-accordion--${cat}`}>
            <AccordionSummary expandIcon={<ExpandMoreIcon className="icon-cyan" />}>
              <Box className="review-summary">
                {review.rating !== "N/A" && (
                  <Chip
                    label={`${review.rating}/10`}
                    size="small"
                    className={`chip-review-rating chip-review-rating--${cat}`}
                  />
                )}
                <Typography variant="body2" className="review-title">
                  {titleMap.get(review) || review.title}
                </Typography>
                <Chip
                  label={cat}
                  size="small"
                  className={`chip-category-label chip-category-label--${cat}`}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" className="review-content">
                {review.content}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
      {reviews.length > 5 && (
        <Typography variant="caption" className="reviews-count">
          Showing 5 of {reviews.length} reviews
        </Typography>
      )}
    </>
  );
}

export default function ReviewsSection({ reviews, loading }: ReviewsSectionProps) {
  const [tab, setTab] = useState<Category>("all");
  const [categoryMap, setCategoryMap] = useState<Map<Review, SentimentCategory>>(new Map());
  const [titleMap, setTitleMap] = useState<Map<Review, string>>(new Map());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  // Call Groq AI to categorize reviews and generate titles
  const categorizeWithAI = useCallback(async (reviewList: Review[]) => {
    if (reviewList.length === 0) return;
    setAiLoading(true);
    setAiDone(false);

    try {
      const res = await fetch("/api/categorize-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: reviewList }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const categories: SentimentCategory[] = data.categories;
      const aiTitles: string[] = data.titles ?? [];

      const catMap = new Map<Review, SentimentCategory>();
      const titMap = new Map<Review, string>();
      reviewList.forEach((r, i) => {
        catMap.set(r, categories[i] ?? "mixed");
        if (aiTitles[i]) titMap.set(r, aiTitles[i]);
      });
      setCategoryMap(catMap);
      setTitleMap(titMap);
      setAiDone(true);
    } catch (err) {
      console.error("AI categorization failed, using fallback:", err);
      const catMap = new Map<Review, SentimentCategory>();
      reviewList.forEach((r) => catMap.set(r, fallbackCategorize(r)));
      setCategoryMap(catMap);
      setAiDone(true);
    }
    setAiLoading(false);
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      // Initialize with fallback immediately, then upgrade with AI
      const map = new Map<Review, SentimentCategory>();
      reviews.forEach((r) => map.set(r, fallbackCategorize(r)));
      setCategoryMap(map);
      categorizeWithAI(reviews);
    } else {
      setCategoryMap(new Map());
      setTitleMap(new Map());
      setAiDone(false);
    }
  }, [reviews, categorizeWithAI]);

  // Derive filtered lists from the category map
  const positive = reviews.filter((r) => categoryMap.get(r) === "positive");
  const mixed = reviews.filter((r) => categoryMap.get(r) === "mixed");
  const negative = reviews.filter((r) => categoryMap.get(r) === "negative");

  const displayed =
    tab === "all" ? reviews : tab === "positive" ? positive : tab === "mixed" ? mixed : negative;

  return (
    <Card className="reviews-card neon-card">
      <CardContent className="section-content">
        <Box className="section-header">
          <RateReviewIcon className="icon-cyan" />
          <Typography variant="h6" className="section-title-cyan">
            Audience Reviews
          </Typography>
          {aiLoading && (
            <Box className="ai-categorizing-badge">
              <CircularProgress size={14} sx={{ color: "#0ff" }} />
              <Typography variant="caption" sx={{ color: "#0ff", ml: 0.5 }}>
                AI categorizing…
              </Typography>
            </Box>
          )}
          {!aiLoading && aiDone && (
            <Box className="ai-categorizing-badge">
              <AutoFixHighIcon sx={{ fontSize: 16, color: "#39ff14" }} />
              <Typography variant="caption" sx={{ color: "#39ff14", ml: 0.5 }}>
                AI categorized
              </Typography>
            </Box>
          )}
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
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v as Category)}
              className="review-category-tabs text-white"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                value="all"
                label={`All (${reviews.length})`}
                className="review-tab review-tab--all"
              />
              <Tab
                value="positive"
                icon={<ThumbUpIcon fontSize="small" />}
                iconPosition="start"
                label={`Positive (${positive.length})`}
                className="review-tab review-tab--positive"
              />
              <Tab
                value="mixed"
                icon={<ThumbsUpDownIcon fontSize="small" />}
                iconPosition="start"
                label={`Mixed (${mixed.length})`}
                className="review-tab review-tab--mixed"
              />
              <Tab
                value="negative"
                icon={<ThumbDownIcon fontSize="small" />}
                iconPosition="start"
                label={`Negative (${negative.length})`}
                className="review-tab review-tab--negative"
              />
            </Tabs>

            {displayed.length === 0 ? (
              <Typography variant="body2" className="text-muted" sx={{ mt: 2 }}>
                No {tab} reviews for this title.
              </Typography>
            ) : (
              <Box sx={{ mt: 1 }}>
                <ReviewList reviews={displayed} categoryMap={categoryMap} titleMap={titleMap} />
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
