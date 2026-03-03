import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get("title");
    const year = searchParams.get("year");

    if (!title) {
      return NextResponse.json(
        { error: "Movie title is required" },
        { status: 400 }
      );
    }

    const query = `${title} ${year ?? ""} official trailer`;

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
      query
    )}&key=${YOUTUBE_API_KEY}`;

    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from YouTube API" },
        { status: 500 }
      );
    }

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Trailer not found" }, { status: 404 });
    }

    const video = data.items[0];
    const videoId = video.id.videoId;

    const trailerUrl = `https://www.youtube.com/watch?v=${videoId}`;

    return NextResponse.json({
      title: video.snippet.title,
      trailer: trailerUrl,
      videoId:videoId,
      thumbnail: video.snippet.thumbnails.high.url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: error },
      { status: 500 }
    );
  }
}