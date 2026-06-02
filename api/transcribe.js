import formidable from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

export default async function handler(req,res){
  if(req.method !== "POST") return res.status(405).json({error:"Only POST"});
  const key = process.env.OPENAI_API_KEY;
  if(!key) return res.status(500).json({error:"OPENAI_API_KEY missing"});

  try{
    const form = formidable({multiples:false, maxFileSize:15*1024*1024});
    const { files } = await new Promise((resolve,reject)=>{
      form.parse(req,(err,fields,files)=> err ? reject(err) : resolve({fields,files}));
    });

    const f = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    if(!f) return res.status(400).json({error:"No audio file"});

    const bytes = fs.readFileSync(f.filepath);
    const blob = new Blob([bytes], {type:f.mimetype || "audio/mp4"});

    const fd = new FormData();
    fd.append("file", blob, f.originalFilename || "recording.mp4");
    fd.append("model", "whisper-1");
    fd.append("language", "tr");
    fd.append("prompt", "Bu ses Türkçe konuşan 6 yaşındaki Elif Sare adlı bir çocuğun kısa sorusudur. Yalnızca Türkçe metne çevir.");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions",{
      method:"POST",
      headers:{ "Authorization":`Bearer ${key}` },
      body:fd
    });

    const data = await r.json();
    if(!r.ok) return res.status(r.status).json(data);

    res.status(200).json({text:data.text || ""});
  }catch(e){
    res.status(500).json({error:e.message});
  }
}