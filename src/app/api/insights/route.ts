import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { movieTitle, reviews } = body;

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

    // Combine review texts for the prompt
    const reviewTexts = reviews
      .map(
        (r: { title: string; content: string; rating: string }, i: number) =>
          `Review ${i + 1}${r.rating !== "N/A" ? ` (${r.rating}/10)` : ""}: ${r.title}\n${r.content}`
      )
      .join("\n\n");

    const prompt = `You are a movie analyst. Analyze the following audience reviews for "${movieTitle}" and provide:

1. **Overall Sentiment**: A short summary of the general audience sentiment (positive, mixed, or negative) with reasoning.
2. **Key Themes**: 3-5 recurring themes or talking points from the reviews.
3. **Strengths**: What do audiences love most?
4. **Weaknesses**: What are the common criticisms?
5. **Verdict**: A 2-3 sentence final audience verdict.

Reviews:
${reviewTexts}

Provide the analysis in a clear, structured format using the headings above. Keep it concise but insightful.`;

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
                "You are a helpful movie review analyst. Provide clear, structured analysis with markdown formatting.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    if (!groqRes.ok) {
      const errData = await groqRes.json();
      console.error("Groq API error:", errData);
      return NextResponse.json(
        { error: "Failed to generate insights" },
        { status: 502 }
      );
    }

    const groqData = await groqRes.json();
    const insights = groqData.choices?.[0]?.message?.content || "";

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
