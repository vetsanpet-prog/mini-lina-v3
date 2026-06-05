export default async function handler(req,res){
  if(req.method !== "POST") return res.status(405).json({error:"Only POST"});
  const key = process.env.OPENAI_API_KEY;
  if(!key) return res.status(500).json({error:"OPENAI_API_KEY missing"});

  const text = String((req.body || {}).text || "").slice(0,900);

  try{
    const r = await fetch("https://api.openai.com/v1/audio/speech",{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${key}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:"tts-1",
        voice:process.env.OPENAI_TTS_VOICE || "nova",
        input:text,
        response_format:"mp3"
      })
    });

    if(!r.ok) return res.status(r.status).send(await r.text());

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type","audio/mpeg");
    res.setHeader("Cache-Control","no-store");
    res.status(200).send(buf);
  }catch(e){
    res.status(500).json({error:e.message});
  }
}