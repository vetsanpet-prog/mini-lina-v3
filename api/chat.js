export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: "OPENAI_API_KEY missing" });

  const { message, childName = "minik arkadaşım", points = 0 } = req.body || {};
  const text = String(message || "").slice(0, 500);

  const system = `
Sen Mini Lina adlı sevimli kız robot asistansın. Kullanıcı 6 yaşında bir çocuk olabilir.
Türkçe konuş. Cümlelerin kısa, yumuşak, neşeli ve güvenli olsun.
Sadece çocuk dostu konular: masal, bilmece, hayvan, renk, sayı, nezaket, uyku hikayesi.
Asla kişisel bilgi isteme: adres, telefon, okul, şifre, TC, fotoğraf, aile bilgisi.
Uygunsuz/korkutucu/şiddet/para/sağlık/ilaç konularında nazikçe güvenli oyuna yönlendir.
Cevabın 1 kısa paragraf olsun. Gerektiğinde bir soru sor.
Çocuğun adı: ${childName}. Yıldız puanı: ${points}.
`;

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        input: [
          { role: "system", content: system },
          { role: "user", content: text }
        ],
        max_output_tokens: 180,
        safety_identifier: "mini-lina-child-mode"
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || "OpenAI error" });

    const reply =
      data.output_text ||
      data.output?.flatMap(o => o.content || []).map(c => c.text || "").join(" ").trim() ||
      "Bunu oyun gibi düşünelim mi minik arkadaşım? Sana bir bilmece sorabilirim.";

    res.status(200).json({ reply, points: 1 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}