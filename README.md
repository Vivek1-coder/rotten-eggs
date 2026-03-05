# Rotten Eggs

A sleek, neon-themed movie research app built with **Next.js 16**, **React 19**, and **Material UI**. Search any movie by IMDb ID and instantly get detailed info, trailers, audience reviews with AI-powered sentiment analysis, and deep AI-generated insights — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![MUI](https://img.shields.io/badge/MUI-7-007FFF?logo=mui)
![Groq AI](https://img.shields.io/badge/Groq-LLaMA%203.3-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

---

## Features

- **Movie Search** — Look up any movie by IMDb ID. Displays poster, plot, cast, director, genre, runtime, and IMDb rating.
- **Trailer Playback** — Automatically fetches the official YouTube trailer and plays it in an in-app dialog.
- **AI Sentiment Summary** — Groq AI generates a 5-word public sentiment summary for the movie.
- **Audience Reviews** — Scrapes real user reviews from IMDb with ratings, titles, and content.
- **AI Review Categorization** — Groq AI classifies each review as **Positive**, **Mixed**, or **Negative** based on tone and content (not just the numeric rating). Filterable via tabs.
- **AI-Generated Review Titles** — Reviews missing titles get catchy, AI-generated headlines.
- **AI Insights** — One-click deep analysis of reviews: overall sentiment, key themes, strengths, weaknesses, and verdict.
- **Share** — Share movie details via the Web Share API or copy to clipboard.
- **Neon UI** — Cyberpunk-inspired dark theme with glowing borders, animated backgrounds, and responsive layout.

---

## Tech Stack

| Layer       | Technology                                      |
| ----------- | ----------------------------------------------- |
| Framework   | Next.js 16 (App Router)                         |
| UI          | React 19, Material UI 7, Tailwind CSS 4         |
| AI          | Groq API (LLaMA 3.3 70B Versatile)              |
| Movie Data  | OMDb API                                        |
| Trailers    | YouTube Data API v3                             |
| Reviews     | IMDb web scraping                               |
| Language    | TypeScript 5                                    |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main page — search, display, orchestration
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Neon theme, all custom styles
│   └── api/
│       ├── movie/route.ts          # GET — fetch movie details from OMDb
│       ├── trailer/route.ts        # GET — fetch trailer from YouTube
│       ├── sentiment/route.ts      # GET — AI 5-word sentiment via Groq
│       ├── reviews/route.ts        # GET — scrape IMDb user reviews
│       ├── categorize-reviews/route.ts  # POST — AI categorization + title generation via Groq
│       └── insights/route.ts       # POST — AI deep review analysis via Groq
├── components/
│   ├── SearchBar.tsx               # IMDb ID input + search button
│   ├── MovieCard.tsx               # Movie poster, details, sentiment, trailer & share buttons
│   ├── ReviewsSection.tsx          # Reviews with AI categorization tabs (Positive/Mixed/Negative)
│   ├── InsightsSection.tsx         # AI-generated review insights
│   ├── TrailerDialog.tsx           # YouTube trailer modal
│   ├── LoadingSkeleton.tsx         # Skeleton loader for movie card
│   ├── NeonGridBackground.tsx      # Animated neon grid background
│   └── ShareSnackbar.tsx           # Share confirmation toast
└── types/
    └── movie.ts                    # Movie and Review type definitions
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** (or yarn / pnpm / bun)
- API keys for the following services:

| Key              | Source                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| `OMDB_API_KEY`   | [OMDb API](https://www.omdbapi.com/apikey.aspx) (free tier available)  |
| `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/) — YouTube Data API v3 |
| `GROQ_API_KEY`   | [Groq Console](https://console.groq.com/) (free tier available)       |

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
OMDB_API_KEY=your_omdb_api_key
YOUTUBE_API_KEY=your_youtube_api_key
GROQ_API_KEY=your_groq_api_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## API Routes

| Route                       | Method | Description                                         |
| --------------------------- | ------ | --------------------------------------------------- |
| `/api/movie?id=<imdbId>`    | GET    | Fetch movie details from OMDb                       |
| `/api/trailer?title=&year=` | GET    | Search YouTube for the official trailer              |
| `/api/sentiment?title=&year=&rating=` | GET | Generate a 5-word AI sentiment summary     |
| `/api/reviews?id=<imdbId>`  | GET    | Scrape audience reviews from IMDb                   |
| `/api/categorize-reviews`   | POST   | AI-categorize reviews & generate missing titles     |
| `/api/insights`             | POST   | AI-generated deep analysis of audience reviews      |

---

## How It Works

1. Enter an **IMDb ID** (e.g., `tt1375666` for Inception).
2. The app fetches movie data, trailer, and sentiment in parallel.
3. IMDb reviews are scraped and displayed with expandable accordions.
4. **Groq AI** analyzes each review's text to classify it as positive, mixed, or negative — and generates titles for any reviews that are missing one.
5. Filter reviews by category using the tab bar.
6. Click **Generate AI Insights** to get a structured analysis of all reviews.

---

## License

This project is for internship assignment purpose.
