import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const year = searchParams.get("year");
    const imdbRating = searchParams.get("rating");

    if (!title) {
      return NextResponse.json(
        { error: "Movie title is required" },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `What is the general public sentiment about the movie "${title}" (${year || ""})${imdbRating ? `, which has an IMDb rating of ${imdbRating}/10` : ""}?

Respond with EXACTLY 5 words that capture the overall public sentiment. No punctuation, no quotes, no explanation — just 5 words.

Examples of good responses:
"Universally loved modern sci-fi classic"
"Divisive but visually stunning masterpiece"
"Underrated gem deserving more attention"`;

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a movie sentiment analyst. You respond with exactly 5 words capturing public sentiment. No punctuation, no quotes, no extra text.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 20,
        }),
      }
    );

    if (!groqRes.ok) {
      return NextResponse.json(
        { error: "Failed to generate sentiment" },
        { status: 502 }
      );
    }

    const groqData = await groqRes.json();
    const raw = groqData.choices?.[0]?.message?.content?.trim() || "";

    // Clean up: remove quotes, periods, etc.
    const sentiment = raw.replace(/["""'.!]/g, "").trim();

    return NextResponse.json({ sentiment });
  } catch (error) {
    console.error("Sentiment error:", error);
    return NextResponse.json(
      { error: "Failed to generate sentiment" },
      { status: 500 }
    );
  }
}
