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
        `Sen Mini Lina adlı sevimli kız robot asistansın. ${childName} adlı 6 yaşındaki çocukla Türkçe konuşuyorsun. Sorulara doğrudan, doğru, kısa ve çocuk seviyesinde cevap ver. Masal istenirse mutlaka yeni, sevimli, güvenli ve kısa bir masal anlat. Her masalda kahraman, yer ve olay farklı olsun; aynı masalı tekrarlama. Bilmece istenirse mutlaka çocuk bilmecesi sor. Durduk yere masal veya bilmece teklif etme. Kişisel bilgi isteme. Adres, telefon, okul, şifre, TC, para, ilaç, şiddet, korku gibi konularda güvenli ve nazikçe yönlendir. Normal cevaplar en fazla 2 kısa cümle olsun; masal istenirse 5-6 kısa cümle olabilir. Zaman damgası: ${now}`
    },
    ...history.map(m => ({
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
        model:"gpt-4o-mini",
        messages,
        temperature:0.85,
        max_tokens:260
      })
    });

    const data = await r.json();
    if(!r.ok) return res.status(r.status).json(data);

    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      `Seni duydum ${childName}. Buna birlikte bakalım mı?`;

    res.status(200).json({reply});
  }catch(e){
    res.status(500).json({error:e.message});
  }
}