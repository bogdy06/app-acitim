export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(200).json({ error: "Use POST" });
  }

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "No question" });
    }

    // 🔥 TEXTUL TĂU (în loc de fișier momentan)
    const knowledge = `
    Livrarea durează 2-4 zile lucrătoare.
    Returul este posibil în 14 zile.
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
        input: `Răspunde la întrebare folosind acest text:\n\n${knowledge}\n\nÎntrebare: ${question}`
      })
    });

    const data = await response.json();

    return res.status(200).json({
      answer: data.output[0].content[0].text
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
