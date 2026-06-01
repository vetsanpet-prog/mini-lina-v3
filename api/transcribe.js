import formidable from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: "OPENAI_API_KEY missing" });

  try {
    const form = formidable({ multiples: false, maxFileSize: 10 * 1024 * 1024 });
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
    });
    const uploaded = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    if (!uploaded) return res.status(400).json({ error: "No audio file" });

    const blob = new Blob([fs.readFileSync(uploaded.filepath)], { type: uploaded.mimetype || "audio/webm" });
    const fd = new FormData();
    fd.append("file", blob, uploaded.originalFilename || "recording.webm");
    fd.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
    fd.append("language", "tr");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}` },
      body: fd
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || "Transcription error" });
    res.status(200).json({ text: data.text || "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
