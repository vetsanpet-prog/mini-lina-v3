# Mini Lina Robot V3 Voice

V3 farkı:
- iPhone Safari Web Speech yerine ses kaydı alır.
- `/api/transcribe` ile OpenAI konuşma-yazı dönüşümü yapar.
- `/api/chat` ile ChatGPT güvenli çocuk modu cevabı üretir.
- `/api/tts` ile OpenAI TTS ses üretir.

## Kurulum
1. ZIP’i aç.
2. Klasörü GitHub’a yükle veya Vercel’e import et.
3. Vercel Project > Settings > Environment Variables:
   - OPENAI_API_KEY = kendi anahtarın
   - OPENAI_MODEL = gpt-4o-mini
   - OPENAI_TRANSCRIBE_MODEL = gpt-4o-mini-transcribe
   - OPENAI_TTS_VOICE = coral
4. Deploy.
5. iPhone Safari’de linki aç.
6. Paylaş > Ana Ekrana Ekle.

## Kullanım
Mikrofona bas → konuş → tekrar mikrofona bas.
Lina sesi yazıya çevirir, cevap verir ve konuşur.
