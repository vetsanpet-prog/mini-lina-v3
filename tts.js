export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: "OPENAI_API_KEY missing" });

  const text = String((req.body || {}).text || "").slice(0, 900);
  try {
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: process.env.OPENAI_TTS_VOICE || "coral",
        input: text,
        instructions: "Speak Turkish with a warm, cheerful, gentle child-friendly cartoon robot voice. Do not sound scary.",
        response_format: "mp3"
      })
    });
    if (!r.ok) {
      const err = await r.text();
      return res.status(r.status).send(err);
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(buf);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}