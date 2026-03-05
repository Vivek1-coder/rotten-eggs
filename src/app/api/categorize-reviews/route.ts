import { NextResponse } from "next/server";

type ReviewInput = {
  title: string;
  content: string;
  rating: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reviews } = body as { reviews: ReviewInput[] };

    if (!reviews || reviews.length === 0) {
      return NextResponse.json(
        { error: "No reviews provided" },
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

    // Identify which reviews need AI-generated titles
    const needsTitle = reviews.map(
      (r) => !r.title || r.title === "Untitled Review" || r.title.trim() === ""
    );
    const anyNeedsTitle = needsTitle.some(Boolean);

    const reviewTexts = reviews
      .map(
        (r, i) =>
          `Review ${i + 1}${r.rating !== "N/A" ? ` (Rating: ${r.rating}/10)` : ""}${needsTitle[i] ? " [NEEDS TITLE]" : ` Title: \"${r.title}\"`}: ${r.content.substring(0, 300)}`
      )
      .join("\n");

    const prompt = `Analyze each of the following movie reviews. For each review:
1. Categorize it as "positive", "mixed", or "negative" based on its tone and content.
2. Generate a short, catchy title (3-8 words) that captures the essence of the review.${anyNeedsTitle ? " Reviews marked [NEEDS TITLE] are missing titles — generate one. For reviews that already have a title, you may improve it or keep it." : ""}

${reviewTexts}

Respond with ONLY a valid JSON array of objects. Each object must have:
- "category": exactly one of "positive", "mixed", or "negative"
- "title": a short, descriptive title for the review (3-8 words)

Example for 2 reviews: [{"category":"positive","title":"A Masterpiece of Modern Cinema"},{"category":"negative","title":"Falls Short of Expectations"}]

Do NOT include any explanation, markdown formatting, or extra text — ONLY the JSON array.`;

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
                "You are a movie review analyst. You respond with ONLY a JSON array of objects containing category and title. No markdown, no explanation.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 512,
        }),
      }
    );

    if (!groqRes.ok) {
      const errData = await groqRes.json();
      console.error("Groq API error:", errData);
      return NextResponse.json(
        { error: "Failed to categorize reviews" },
        { status: 502 }
      );
    }

    const groqData = await groqRes.json();
    const raw = groqData.choices?.[0]?.message?.content?.trim() || "[]";

    // Extract JSON array from response (handle potential markdown wrapping)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Groq returned non-JSON:", raw);
      return NextResponse.json(
        { error: "Invalid AI response" },
        { status: 502 }
      );
    }

    const parsed: { category?: string; title?: string }[] = JSON.parse(jsonMatch[0]);

    // Validate & normalize
    const validCats = ["positive", "mixed", "negative"];
    const categories: string[] = [];
    const titles: string[] = [];

    for (let i = 0; i < reviews.length; i++) {
      const entry = parsed[i];
      const cat = entry?.category?.toLowerCase().trim() || "mixed";
      categories.push(validCats.includes(cat) ? cat : "mixed");

      // Use AI title if valid, otherwise keep the original (unless it was untitled)
      const aiTitle = entry?.title?.trim();
      if (aiTitle && aiTitle.length > 0) {
        titles.push(aiTitle);
      } else {
        titles.push(reviews[i].title || "Untitled Review");
      }
    }

    return NextResponse.json({ categories, titles });
  } catch (error) {
    console.error("Categorize reviews error:", error);
    return NextResponse.json(
      { error: "Failed to categorize reviews" },
      { status: 500 }
    );
  }
}
