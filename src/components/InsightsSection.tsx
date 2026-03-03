"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

type InsightsSectionProps = {
  insights: string | null;
  loading: boolean;
  reviewCount: number;
  onGenerate: () => void;
};

export default function InsightsSection({
  insights,
  loading,
  reviewCount,
  onGenerate,
}: InsightsSectionProps) {
  return (
    <Card className="insights-card neon-card">
      <CardContent className="section-content">
        <Box className="section-header">
          <AutoAwesomeIcon className="icon-magenta" />
          <Typography variant="h6" className="section-title-magenta">
            AI-Powered Insights
          </Typography>
        </Box>

        {!insights && !loading && (
          <Box className="insights-prompt">
            <Typography variant="body2" className="text-muted">
              {reviewCount > 0
                ? "Generate an AI analysis of audience reviews using Groq."
                : "Waiting for reviews to load before generating insights..."}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={onGenerate}
              disabled={reviewCount === 0}
              className="btn-generate"
              sx={{
                background: "linear-gradient(135deg, #ff00ff 0%, #7b2ff7 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #ff44ff 0%, #9b4ff7 100%)",
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

        {loading && (
          <Box className="insights-loading">
            <CircularProgress className="spinner-magenta" />
            <Typography variant="body2" className="text-subtle">
              Analyzing reviews with AI...
            </Typography>
          </Box>
        )}

        {insights && !loading && (
          <Paper className="insights-paper">
            {renderInsights(insights)}
          </Paper>
        )}
      </CardContent>
    </Card>
  );
}

function renderInsights(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) return <Box key={i} className="insights-spacer" />;

    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      return (
        <Typography key={i} variant="subtitle1" className="insights-heading">
          {trimmed.replace(/\*\*/g, "")}
        </Typography>
      );
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      return (
        <Typography key={i} variant="body2" className="insights-bullet">
          • {trimmed.substring(2)}
        </Typography>
      );
    }

    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Typography key={i} variant="body2" className="insights-line">
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <Box key={j} component="span" className="insights-bold">
              {part.replace(/\*\*/g, "")}
            </Box>
          ) : (
            <span key={j}>{part}</span>
          ),
        )}
      </Typography>
    );
  });
}
