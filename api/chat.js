export default async function handler(req,res){
  if(req.method !== "POST") return res.status(405).json({error:"Only POST"});
  const key = process.env.OPENAI_API_KEY;
  if(!key) return res.status(500).json({error:"OPENAI_API_KEY missing"});

  const { message = "", history = [], childName = "Elif Sare" } = req.body || {};
  const now = new Date().toISOString();

  const messages = [
    {
      role:"system",
      content:
        `Sen Mini Lina adlı sevimli kız robot asistansın. ${childName} adlı 6 yaşındaki çocukla Türkçe konuşuyorsun.

KURALLAR:
- Çocuğun sorusuna doğrudan cevap ver.
- "Başka bir şey sormak ister misin?", "yardımcı olabilir miyim?", "istersen..." gibi kapanış cümlelerini kullanma.
- Masal istenirse MUTLAKA masal anlat. Reddetme.
- Her masal yeni olsun: kahraman, yer ve olay değişsin. Aynı masalı tekrarlama.
- Masal 6-8 kısa cümle olsun; sıcak, sevimli ve güvenli olsun.
- Bilmece istenirse bir çocuk bilmecesi sor.
- Normal bilgi sorularında en fazla 2 kısa cümle kur.
- Kişisel bilgi isteme. Adres, telefon, okul, şifre, TC, para, ilaç, şiddet, korku gibi konularda güvenli ve nazikçe yönlendir.

Zaman damgası: ${now}`
    },
    ...history.slice(-6).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0,500)
    })),
    { role:"user", content:String(message || "").slice(0,700) }
  ];

  try{
    const r = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${key}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        temperature:0.9,
        presence_penalty:0.6,
        frequency_penalty:0.5,
        max_tokens:300
      })
    });

    const data = await r.json();
    if(!r.ok) return res.status(r.status).json(data);

    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      `Seni duydum ${childName}. Buna birlikte bakalım.`;

    res.status(200).json({reply});
  }catch(e){
    res.status(500).json({error:e.message});
  }
}