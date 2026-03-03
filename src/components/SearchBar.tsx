"use client";

import { Button, Box } from "@mui/material";

type SearchBarProps = {
  imdbId: string;
  setImdbId: (id: string) => void;
  onSearch: () => void;
  loading: boolean;
};

export default function SearchBar({ imdbId, setImdbId, onSearch, loading }: SearchBarProps) {
  return (
    <Box className="search-bar">
      <input
        className="search-input"
        placeholder="Enter IMDb ID (e.g. tt0133093)"
        value={imdbId}
        onChange={(e) => setImdbId(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
      <Button
        variant="contained"
        onClick={onSearch}
        disabled={loading}
        className="search-button"
        sx={{
          background: "linear-gradient(135deg, #0ff 0%, #00bcd4 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #39ff14 0%, #0ff 100%)",
          },
        }}
      >
        Search
      </Button>
    </Box>
  );
}
