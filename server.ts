import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load local environment variables if available
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support reading JSON bodies up to 10MB
  app.use(express.json({ limit: "10mb" }));

  // API Route to generate message variations using Gemini API
  app.post("/api/gemini/generate-variations", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string" || message.trim() === "") {
        return res.status(400).json({ error: "O texto da mensagem é obrigatório." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "API Key do Gemini não configurada. Por favor, adicione GEMINI_API_KEY nos Secrets nas configurações do AI Studio (ícone de engrenagem no canto superior direito)."
        });
      }

      // Lazy initialization of GoogleGenAI using the secret key
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Call Gemini 3.5-flash to rewrite client message to prevent bulk detection issues
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Você é um especialista em Marketing e Copywriting para mídias sociais.
Recebemos uma mensagem base para postagem em múltiplos grupos do Facebook. Para evitar que os sistemas de prevenção a spam do Facebook detectem postagens idênticas, gere 5 variações naturais da mensagem a seguir.
Importante:
1. Mantenha os mesmos links, números de telefone se houver, de modo que fiquem clicáveis/acessíveis.
2. Cada variação deve focar em um tom ou estrutura diferente (exemplo: Persuasivo, Informativo/Profissional, Espontâneo/Amigável, Curto e chamativo com Emoji, Curiosidade).
3. Certifique-se de que cada mensagem comece diferente e mude sinônimos de modo inteligente.
4. Mantenha chaves ou marcadores de placeholders como {grupo} intocados se eles existirem.
5. Retorne as variações como uma lista de textos limpos em português do Brasil.

Mensagem Base Original:
"${message}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "Lista com exatamente 5 variações de mensagens persuasivas e reescritas.",
          },
        },
      });

      const generatedText = response.text || "[]";
      let variations: string[] = [];
      try {
        variations = JSON.parse(generatedText.trim());
      } catch (parseErr) {
        // Fallback split in case of parsing discrepancies
        variations = [generatedText];
      }

      if (!Array.isArray(variations) || variations.length === 0) {
        variations = [message, `${message} \n\n🔹 Novidade!`, `${message} \n\n📍 Confira!`, `${message} \n\n✨ Saiba mais!`];
      }

      // Keep up to 5 variations
      res.json({ variations: variations.slice(0, 5) });
    } catch (err: any) {
      console.error("Erro na API de variações Gemini:", err);
      res.status(500).json({
        error: `Falha ao processar IA: ${err.message || "Erro desconhecido."}`
      });
    }
  });

  // Wire Vite Developer Middleware or Production Static Handler
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite express server running in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production files from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[READY] Server running and accepting requests on http://0.0.0.0:${PORT}`);
  });
}

startServer();
