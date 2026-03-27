export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { question } = req.body || {};

    if (!question) {
      return res.status(400).json({ error: "No question" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const knowledge = `
Livrarea durează 2-4 zile lucrătoare.
Returul este posibil în 14 zile de la primire.
Programul de suport este de luni până vineri între 09:00 și 18:00.
Pentru comenzi peste 300 lei livrarea este gratuită.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Răspunde în română, folosind doar informațiile din textul de mai jos.

Text:
${knowledge}

Întrebare: ${question}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed",
        debug: data
      });
    }

    return res.status(200).json({
      answer: data.output_text || "Nu am putut genera răspunsul.",
      sources: [knowledge.trim()]
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
