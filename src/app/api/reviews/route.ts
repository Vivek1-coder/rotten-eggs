import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imdbId = searchParams.get("id");

    if (!imdbId) {
      return NextResponse.json(
        { error: "IMDb ID is required" },
        { status: 400 }
      );
    }

    // Scrape IMDb user reviews page
    const reviewsUrl = `https://www.imdb.com/title/${imdbId}/reviews?sort=curated&dir=desc&ratingFilter=0`;
    const res = await fetch(reviewsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch reviews from IMDb" },
        { status: 502 }
      );
    }

    const html = await res.text();

    // Extract reviews using regex patterns from the IMDb reviews page
    const reviews: { title: string; content: string; rating: string; author: string }[] = [];

    // Pattern 1: Try to extract from JSON-LD or script data
    const reviewContentMatches = html.matchAll(
      /<div class="text show-more__control">([\s\S]*?)<\/div>/g
    );
    const reviewTitleMatches = html.matchAll(
      /<a class="title"[^>]*>\s*([\s\S]*?)\s*<\/a>/g
    );
    const ratingMatches = html.matchAll(
      /<span class="rating-other-user-rating">\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<span>([\d]+)<\/span>/g
    );

    const titles: string[] = [];
    const contents: string[] = [];
    const ratings: string[] = [];

    for (const match of reviewTitleMatches) {
      titles.push(match[1].trim().replace(/<[^>]*>/g, ""));
    }
    for (const match of reviewContentMatches) {
      contents.push(match[1].trim().replace(/<[^>]*>/g, "").substring(0, 500));
    }
    for (const match of ratingMatches) {
      ratings.push(match[1]);
    }

    // If regex approach didn't capture well, try alternate patterns
    if (contents.length === 0) {
      // Try alternate pattern for newer IMDb layout
      const altContentMatches = html.matchAll(
        /<div[^>]*class="[^"]*ipc-html-content-inner-div[^"]*"[^>]*>([\s\S]*?)<\/div>/g
      );
      for (const match of altContentMatches) {
        const text = match[1].trim().replace(/<[^>]*>/g, "").substring(0, 500);
        if (text.length > 50) {
          contents.push(text);
        }
      }
    }

    // Try to also get review titles from alternate layout
    if (titles.length === 0) {
      const altTitleMatches = html.matchAll(
        /<span[^>]*data-testid="review-summary"[^>]*>([\s\S]*?)<\/span>/g
      );
      for (const match of altTitleMatches) {
        titles.push(match[1].trim().replace(/<[^>]*>/g, ""));
      }
    }

    const count = Math.max(contents.length, titles.length);
    for (let i = 0; i < Math.min(count, 10); i++) {
      reviews.push({
        title: titles[i] || "Untitled Review",
        content: contents[i] || "",
        rating: ratings[i] || "N/A",
        author: "",
      });
    }

    // Filter out empty reviews
    const validReviews = reviews.filter((r) => r.content.length > 20);

    return NextResponse.json({ reviews: validReviews });
  } catch (error) {
    console.error("Review scraping error:", error);
    return NextResponse.json(
      { error: "Failed to scrape reviews" },
      { status: 500 }
    );
  }
}
