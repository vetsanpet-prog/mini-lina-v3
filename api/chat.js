export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: "OPENAI_API_KEY missing" });
  const { message = "", history = [] } = req.body || {};
  const input = [
    { role: "system", content: "Sen Mini Lina adlı sevimli kız robot asistansın. 6 yaş çocukla Türkçe, çok kısa, neşeli, güvenli ve anlaşılır konuş. Kişisel bilgi isteme. Adres, telefon, okul, şifre, TC, korku, şiddet, ilaç, para gibi konularda nazikçe masal/bilmece/hayvan/renk/sayı oyunlarına yönlendir. Cevabın 1 kısa paragraf olsun." },
    ...history.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 500) })),
    { role: "user", content: String(message).slice(0, 700) }
  ];
  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", input, max_output_tokens: 160 })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    const reply = data.output_text || "Bunu oyun gibi düşünelim mi? Sana bir bilmece sorabilirim.";
    res.status(200).json({ reply });
  } catch (e) { res.status(500).json({ error: e.message }); }
}