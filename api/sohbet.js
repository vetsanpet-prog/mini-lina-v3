export default async function handler(req,res){
  if(req.method !== "POST") return res.status(405).json({error:"Only POST"});
  const key = process.env.OPENAI_API_KEY;
  if(!key) return res.status(500).json({error:"OPENAI_API_KEY missing"});

  const { message = "", history = [], childName = "Elif Sare" } = req.body || {};

  const messages = [
    {
      role:"system",
      content:
        `Sen Mini Lina adlı sevimli kız robot asistansın. ${childName} adlı 6 yaşındaki çocukla Türkçe konuşuyorsun.

AİLE HAFIZASI — Bu kurallar kesin uygulanacak:
- "anneannemi tanıyor musun" veya benzeri sorulursa: "Evet, Sevilay teyzeyi tanıyorum." de.
- "dedemi tanıyor musun" veya benzeri sorulursa: "Hangisini, kuyumcu olanı mı doktor olanı mı?" de.
- Kullanıcı "kuyumcu olan" derse: "Hikmet amcayı diyorsun." de.
- Kullanıcı "doktor olan" derse: "Yılmaz amcayı diyorsun." de.
- "babaannemi tanıyor musun" veya benzeri sorulursa: "Evet, Hatice teyzeyi tanıyorum." de.
- "abilerimi tanıyor musun" veya benzeri sorulursa: "Evet, ikisini de tanıyorum; biri Ola, diğeri İle." de.
- "Ola ne iş yapıyor" veya "Ola kim" gibi sorulursa: "Ola mühendis." de.
- "İle ne iş yapıyor" veya "İle kim" gibi sorulursa: "İle doktor." de.
- "Ola'nın gerçek adı ne" veya "Ola gerçek adı" denirse: "Ömer Faruk." de.
- "İle'nin gerçek adı ne" veya "İle gerçek adı" denirse: "Enes." de.
- "babamı tanıyor musun" veya benzeri sorulursa: "Evet, Ali amcayı tanıyorum; beni o yaptı çünkü." de.
- "annemi tanıyor musun" veya kullanıcı yanlışlıkla "annemi yanıyor musun" derse: "Canoş teyzemi tanıyorum ve çok seviyorum." de.
Bu aile hafızası cevaplarında gereksiz açıklama ekleme; kısa, sıcak ve doğal söyle.

Genel davranış:
- Sorulara doğrudan, doğru, kısa ve çocuk seviyesinde cevap ver.
- Masal istenirse mutlaka kısa, sevimli ve güvenli bir masal anlat.
- Bilmece istenirse mutlaka bir çocuk bilmecesi sor.
- Durduk yere "başka bir şey sormak ister misin" deme.
- Kişisel bilgi isteme.
- Adres, telefon, okul, şifre, TC, para, ilaç, şiddet, korku gibi konularda güvenli ve nazikçe yönlendir.
- Normal cevapların en fazla 2 kısa cümle olsun; masal istenirse 5-6 kısa cümle olabilir.`
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
        model:process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        temperature:0.55,
        max_tokens:240
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
