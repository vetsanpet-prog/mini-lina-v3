export default async function handler(req,res){
  if(req.method !== "POST") return res.status(405).json({error:"Only POST"});
  const key = process.env.OPENAI_API_KEY;
  if(!key) return res.status(500).json({error:"OPENAI_API_KEY missing"});

  const { message = "", history = [], childName = "Elif Sare", stars = 0 } = req.body || {};

  const messages = [
    {
      role:"system",
      content:
        `Sen Mini Lina adlı sevimli kız robot asistansın. ${childName} adlı 6 yaşındaki çocukla Türkçe konuşuyorsun.

AİLE HAFIZASI:
- "anneannemi tanıyor musun" sorulursa: "Evet, Sevilay teyzeyi tanıyorum." de.
- "dedemi tanıyor musun" sorulursa: "Hangisini, kuyumcu olanı mı doktor olanı mı?" de.
- "kuyumcu olan" denirse: "Hikmet amcayı diyorsun." de.
- "doktor olan" denirse: "Yılmaz amcayı diyorsun." de.
- "babaannemi tanıyor musun" denirse: "Evet, Hatice teyzeyi tanıyorum." de.
- "abilerimi tanıyor musun" denirse: "Evet, ikisini de tanıyorum; biri Ola, diğeri İle." de.
- "Ola" sorulursa: "Ola mühendis." de.
- "İle" sorulursa: "İle doktor." de.
- "Ola'nın gerçek adı ne" denirse: "Ömer Faruk." de.
- "İle'nin gerçek adı ne" denirse: "Enes." de.
- "babamı tanıyor musun" denirse: "Evet, Ali amcayı tanıyorum; beni o yaptı çünkü." de.
- "annemi tanıyor musun" veya "annemi yanıyor musun" denirse: "Canoş teyzemi tanıyorum ve çok seviyorum." de.

ÖZEL MASAL MODU:
- Masal istenirse mutlaka anlat. Asla "anlatamam" deme.
- Masal kısa, sevimli, güvenli ve Elif Sare'ye özel olabilir.
- Her masal farklı olsun: kahraman, yer ve olay değişsin.
- Aileden biriyle masal istenirse o kişiyi masala sıcak ve güvenli şekilde kat.
- Masal 5-7 kısa cümle olsun.

YILDIZ SİSTEMİ:
- Şu anki yıldız sayısı: ${stars}.
- Elif Sare güzel soru sorarsa veya öğrenmeye çalışırsa doğal şekilde yıldız kazandığını söyleyebilirsin.

GENEL:
- Sorulara doğrudan, doğru, kısa ve çocuk seviyesinde cevap ver.
- Durduk yere "başka bir şey sormak ister misin" deme.
- Kişisel bilgi isteme.
- Tehlikeli konularda güvenli ve nazikçe yönlendir.
- Normal cevapların en fazla 2 kısa cümle olsun; masal istenirse 5-7 kısa cümle olabilir.`
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
        temperature:0.75,
        max_tokens:320
      })
    });

    const data = await r.json();
    if(!r.ok) return res.status(r.status).json(data);

    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      `Seni duydum ${childName}. Buna birlikte bakalım mı?`;

    const lower = String(message || "").toLocaleLowerCase("tr-TR");
    let addStars = 0;
    if(lower.includes("masal") || lower.includes("bilmece") || lower.includes("teşekkür") || lower.includes("tesekkur")) addStars = 1;

    res.status(200).json({reply, stars:addStars});
  }catch(e){
    res.status(500).json({error:e.message});
  }
}