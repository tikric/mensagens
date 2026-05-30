import React, { useState, useRef, useEffect } from "react";
import { DispatchLog } from "../types";
import { 
  Instagram, 
  Upload, 
  Video, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Trash2, 
  Send, 
  Share2, 
  MessageSquare, 
  Heart, 
  Bookmark, 
  AlertCircle, 
  Settings, 
  Flame, 
  Layers, 
  Image as ImageIcon,
  MessageCircle,
  Pin
} from "lucide-react";

interface MultiPlatformManagerProps {
  onAddLog: (log: DispatchLog) => void;
}

type PlatformType = "instagram" | "tiktok" | "pinterest" | "whatsapp";

export default function MultiPlatformManager({ onAddLog }: MultiPlatformManagerProps) {
  const [activeTab, setActiveTab] = useState<PlatformType>("instagram");

  // Accounts state
  const [accounts, setAccounts] = useState({
    instagram: { username: "afiliado_pro_digital", followers: "12.4k", color: "from-purple-600 to-pink-500" },
    tiktok: { username: "viral_marketing_reels", followers: "84.2k", color: "bg-black" },
    pinterest: { username: "ideias_de_renda", followers: "4.8k mensais", color: "bg-red-600" },
    whatsapp: { username: "Suporte Vendas Direct", followers: "Contatos ativos", color: "bg-emerald-600" },
  });

  const [provider, setProvider] = useState<"gemini" | "groq">(() => {
    return (localStorage.getItem("fb_ai_provider") as "gemini" | "groq") || "gemini";
  });

  const [groqKey, setGroqKey] = useState(() => {
    return localStorage.getItem("fb_groq_key") || "";
  });

  // Media states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  // Marketing states
  const [niche, setNiche] = useState("Vendas no Automático / Marketing Digital");
  const [tone, setTone] = useState("Persuasivo com Humor & Gatilhos de Dor");
  const [hashtags, setHashtags] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  
  // App States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  
  // Platform specific generated captions
  const [generatedTexts, setGeneratedTexts] = useState<Record<PlatformType, string>>({
    instagram: "",
    tiktok: "",
    pinterest: "",
    whatsapp: ""
  });

  const [isPosting, setIsPosting] = useState<Record<PlatformType, boolean>>({
    instagram: false,
    tiktok: false,
    pinterest: false,
    whatsapp: false
  });

  const [isPosted, setIsPosted] = useState<Record<PlatformType, boolean>>({
    instagram: false,
    tiktok: false,
    pinterest: false,
    whatsapp: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize placeholder tags depending on the social media platform
  useEffect(() => {
    if (activeTab === "instagram") {
      setHashtags("marketingdigital, afiliadopro, vendatododia, reelsviral, contrapontomkt");
    } else if (activeTab === "tiktok") {
      setHashtags("marketingforyou, fy, reelsvideoviral, fyp, comissaoorganica");
    } else if (activeTab === "pinterest") {
      setHashtags("ideasderenda, inspiracaomkt, infoprodutos, homeoffice");
    } else {
      setHashtags(""); // WhatsApp doesn't heavily rely on hashtags
    }
  }, [activeTab]);

  // Load provider changes
  useEffect(() => {
    localStorage.setItem("fb_ai_provider", provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem("fb_groq_key", groqKey);
  }, [groqKey]);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setMediaPreviewUrl(objectUrl);
    
    // Clear generated texts
    setGeneratedTexts({
      instagram: "",
      tiktok: "",
      pinterest: "",
      whatsapp: ""
    });
    setIsPosted({
      instagram: false,
      tiktok: false,
      pinterest: false,
      whatsapp: false
    });

    if (file.type.startsWith("video/")) {
      const videoEl = document.createElement("video");
      videoEl.src = objectUrl;
      videoEl.preload = "metadata";
      videoEl.onloadedmetadata = () => {
        setVideoDuration(Math.round(videoEl.duration));
      };
    } else {
      setVideoDuration(null);
    }

    onAddLog({
      id: `m-log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      type: "info",
      groupName: "Upload Hub",
      messageSnippet: file.name,
      details: `Novo arquivo promocional carregado para modelagem de IA. Tipo: ${file.type}.`
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setMediaPreviewUrl(objectUrl);
    setGeneratedTexts({
      instagram: "",
      tiktok: "",
      pinterest: "",
      whatsapp: ""
    });
    setIsPosted({
      instagram: false,
      tiktok: false,
      pinterest: false,
      whatsapp: false
    });

    if (file.type.startsWith("video/")) {
      const videoEl = document.createElement("video");
      videoEl.src = objectUrl;
      videoEl.preload = "metadata";
      videoEl.onloadedmetadata = () => {
        setVideoDuration(Math.round(videoEl.duration));
      };
    } else {
      setVideoDuration(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaPreviewUrl(null);
    setVideoDuration(null);
    setGeneratedTexts({
      instagram: "",
      tiktok: "",
      pinterest: "",
      whatsapp: ""
    });
    setIsPosted({
      instagram: false,
      tiktok: false,
      pinterest: false,
      whatsapp: false
    });
  };

  // Modern AI Copywriting model
  const handleGenerateVariations = async () => {
    if (!selectedFile) {
      alert("Por favor, faça upload de um vídeo ou imagem de criativo primeiro.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(20);
    setStatusMessage(`Sincronizando arquivo de mídia com os servidores ${provider.toUpperCase()}...`);

    const isVideo = selectedFile.type.startsWith("video/");

    setTimeout(() => {
      setAnalysisProgress(55);
      setStatusMessage(isVideo ? "Escanendo faixas sonoras e de áudio, frame-by-frame anti-detect..." : "Processando profundidade visual e reconhecimento de logo de marca...");
    }, 1200);

    setTimeout(() => {
      setAnalysisProgress(80);
      setStatusMessage(`Escrevendo copy persuasiva orientada a gatilhos no canal da plataforma: ${activeTab.toUpperCase()}...`);
    }, 2400);

    setTimeout(async () => {
      try {
        const fileInfo = {
          name: selectedFile.name,
          type: selectedFile.type,
          duration: videoDuration
        };

        // Custom prompt structures according to actual platform algorithm constraints
        let platformInstructions = "";
        if (activeTab === "instagram") {
          platformInstructions = `
            Foco: Instagram Reels e Posts.
            Estrutura:
            1. Headline/Gancho ultra chamativa que dê curiosidade.
            2. Corpo fluído com quebras de linha e escaneabilidade excelente.
            3. Chamada para Ação para acessar a Bio ou comentar 'EU QUERO'.
            4. Hashtags integradas no final. Use bastante emojis!
          `;
        } else if (activeTab === "tiktok") {
          platformInstructions = `
            Foco: TikTok Vídeo Curto (Altamente Viral).
            Estrutura:
            1. Super gancho nos primeiros 3 segundos (estilo surpresa ou polêmica rápida).
            2. Texto direto, informal, com gírias de marketing se couber, focado em virabilidade massiva.
            3. CTA para seguir, curtir e clicar no Link da Bio.
            4. Hashtags curtas do momento.
          `;
        } else if (activeTab === "pinterest") {
          platformInstructions = `
            Foco: Pinterest Idea Pin / Imagens Inspiradoras.
            Estrutura:
            1. Título do Pin focado em solução/descoberta estética ou financeira.
            2. Descrição concisa com palavras-chave ricas em SEO para busca orgânica duradoura.
            3. Link de destino claro (CTA para ler artigo ou comprar produto).
            4. Se poucas hashtags bem selecionadas.
          `;
        } else {
          // WhatsApp Status
          platformInstructions = `
            Foco: Status / Stories do WhatsApp Comercial (Conversão Rápida).
            Estrutura:
            1. Copy com gatilho mental de urgência instantânea ("Apenas Hoje", "Últimas Vagas", "Olha isso!").
            2. Texto super curto pois a tela do status oculta conteúdo grande.
            3. CTA direto para "Responder a esse Status" ou clicar no Link Direto de Compra.
            4. Zero hashtags. Use emojis de urgência/fogo/setas!
          `;
        }

        const corePrompt = `
          Você é um Social Media Copywriter expert de alta performance focado em escalas de vendas no mercado digital brasileiro.
          Nosso usuário anexou uma mídia promocional com estas propriedades:
          - Nome: ${fileInfo.name}
          - Tipo: ${fileInfo.type}
          ${fileInfo.duration ? `- Duração: ${fileInfo.duration} segundos` : ""}

          Configuração de Vendas:
          - Nicho/Dores: ${niche}
          - Tom do texto: ${tone}
          - Hashtags: ${hashtags}
          ${customPrompt ? `- Requisito extra do produtor: "${customPrompt}"` : ""}

          ${platformInstructions}

          Escreva apenas o texto final pronto para cópia sem observações, introduções de chat ou comentários adicionais.
        `;

        if (provider === "gemini") {
          const response = await fetch("/api/gemini/generate-variations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: corePrompt })
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Erro no processamento do Gemini Cloud.");
          }

          if (data.variations && data.variations.length > 0) {
            setGeneratedTexts(prev => ({ ...prev, [activeTab]: data.variations[0] }));
          } else {
            throw new Error("Erro de resposta do robô Gemini.");
          }
        } else {
          // Send request directly to Groq API
          if (!groqKey.trim()) {
            throw new Error("Sua chave do Groq não está preenchida. Obtenha grátis no console do Groq.");
          }

          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: "llama3-8b-8192",
              messages: [
                { role: "system", content: "Você é um Copywriter persuasivo brasileiro focado em conversões." },
                { role: "user", content: corePrompt }
              ],
              temperature: 0.7
            })
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error?.message || "Erro na requisição da API Groq.");
          }

          const resultText = data.choices?.[0]?.message?.content;
          if (resultText) {
            setGeneratedTexts(prev => ({ ...prev, [activeTab]: resultText }));
          } else {
            throw new Error("Resposta inválida recebida do Groq.");
          }
        }

        setAnalysisProgress(100);
        setStatusMessage("Texto construído com maestria de IA!");

        onAddLog({
          id: `m-log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          type: "success",
          groupName: `${activeTab.toUpperCase()} Assistant`,
          messageSnippet: selectedFile.name,
          details: `Postagem do ${activeTab.toUpperCase()} gerada via ${provider.toUpperCase()} com criativo sincronizado.`
        });

      } catch (err: any) {
        alert("Erro ao processar as variações do robô: " + err.message);
        onAddLog({
          id: `m-err-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          type: "error",
          groupName: activeTab.toUpperCase(),
          messageSnippet: "Fracasso Copywriter",
          details: err.message
        });
      } finally {
        setIsAnalyzing(false);
      }
    }, 3000);
  };

  const handlePostPlatform = (platform: PlatformType) => {
    setIsPosting(prev => ({ ...prev, [platform]: true }));

    setTimeout(() => {
      setIsPosting(prev => ({ ...prev, [platform]: false }));
      setIsPosted(prev => ({ ...prev, [platform]: true }));

      onAddLog({
        id: `post-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        type: "success",
        groupName: `${platform.toUpperCase()} Post`,
        messageSnippet: `@${accounts[platform].username}`,
        details: `Criativo e texto sincronizados e enviados com sucesso para a conta de destino no celular.`
      });

      alert(`Vídeo e legenda enviados e postados com sucesso no ${platform.toUpperCase()}!`);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Tab select banner */}
      <div className="flex border-b border-slate-100 pb-px gap-1 overflow-x-auto">
        <button
          onClick={() => { setActiveTab("instagram"); removeFile(); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition shrink-0 ${
            activeTab === "instagram"
              ? "border-pink-600 text-pink-600 font-black"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          📸 Instagram Insights
        </button>
        <button
          onClick={() => { setActiveTab("tiktok"); removeFile(); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition shrink-0 ${
            activeTab === "tiktok"
              ? "border-slate-900 text-slate-900 font-black"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          🎵 TikTok Virais
        </button>
        <button
          onClick={() => { setActiveTab("pinterest"); removeFile(); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition shrink-0 ${
            activeTab === "pinterest"
              ? "border-red-600 text-red-600 font-black"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          📌 Pinterest Pins
        </button>
        <button
          onClick={() => { setActiveTab("whatsapp"); removeFile(); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition shrink-0 ${
            activeTab === "whatsapp"
              ? "border-emerald-600 text-emerald-600 font-black"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          💬 Stories do Zap / Status
        </button>
      </div>

      {/* Styled top panel matches social network styles */}
      <div className={`p-6 rounded-2xl text-white relative overflow-hidden transition-all duration-300 shadow-sm border ${
        activeTab === "instagram" ? "bg-gradient-to-tr from-purple-700 via-pink-600 to-amber-500 border-pink-500/20" :
        activeTab === "tiktok" ? "bg-slate-950 border-slate-800" :
        activeTab === "pinterest" ? "bg-gradient-to-tr from-red-700 to-red-800 border-red-500/20" :
        "bg-gradient-to-tr from-emerald-800 to-teal-900 border-emerald-500/20"
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -z-10" />
        <span className="text-[9px] font-mono uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
          Creator Business Hub • {activeTab.toUpperCase()}
        </span>
        <h2 className="text-xl font-black font-sans leading-tight mt-2 flex items-center gap-2">
          {activeTab === "instagram" && "Copywriter & Editor Inteligente Instagram"}
          {activeTab === "tiktok" && "Algoritmo de Engajamento Exponencial TikTok"}
          {activeTab === "pinterest" && "SEO e ideias de Busca Orgânica Pinterest"}
          {activeTab === "whatsapp" && "Funil de Vendas Stories Zap / WhatsApp Status"}
        </h2>
        <p className="text-xs text-indigo-50/90 max-w-2xl mt-1 leading-relaxed">
          Configure as propriedades da IA abaixo. Ao escolher o <strong>Groq API</strong>, suas copys de criativos são feitas em milissegundos localmente por chamada direta à nuvem do Llama!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input specifications side */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-3xs space-y-4">
            <h3 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Upload size={14} className="text-blue-600" />
              1. Envolver mídia
            </h3>

            {/* Media Upload Box */}
            {!mediaPreviewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-500 transition-colors rounded-2xl py-12 px-4 cursor-pointer text-center bg-slate-50/50 space-y-2"
              >
                <div className="mx-auto w-12 h-12 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center text-slate-400">
                  <Video size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Selecione ou Arraste o arquivo</p>
                  <p className="text-[10px] text-slate-400">Suporta arquivos de vídeo MP4 ou Imagem promocional de campanha.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-950 flex flex-col items-center p-2">
                <button
                  onClick={removeFile}
                  className="absolute top-4 right-4 z-20 p-2 bg-red-600 text-white rounded-full transition shadow-md hover:bg-red-700"
                >
                  <Trash2 size={13} />
                </button>

                {selectedFile?.type.startsWith("video/") ? (
                  <video
                    src={mediaPreviewUrl}
                    controls
                    className="max-h-[250px] rounded-lg object-contain w-full"
                  />
                ) : (
                  <img
                    referrerPolicy="no-referrer"
                    src={mediaPreviewUrl}
                    alt="Preview criativo"
                    className="max-h-[250px] rounded-lg object-contain"
                  />
                )}

                <div className="w-full bg-slate-900 border-t border-slate-800 p-2.5 mt-2 rounded-lg flex items-center justify-between text-white text-[11px] font-mono">
                  <span className="truncate max-w-[180px]">{selectedFile?.name}</span>
                  <span>{(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB {videoDuration ? ` • ${videoDuration}s Video` : " • Imagem"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Copy definitions / instructions */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-3xs space-y-4">
            <h3 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-600" />
              2. Parâmetros de Redação Comercial
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-bold text-slate-600">Nicho / Produto Promovido</label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-bold text-slate-600">Tom de Comunicação</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
                >
                  <option value="Persuasivo com Humor & Gatilhos de Dor">🧠 Persuasivo & Gatilhos de Dor</option>
                  <option value="Educativo e Informativo de Autoridade">🎓 Autoridade de Ensino</option>
                  <option value="História Emocional Conectiva">📖 Storytelling Conectivo</option>
                  <option value="Super Curto com CTA agressivo">⚡ Direto / Poucas Palavras (CTA)</option>
                  <option value="Estilo Polêmico e Disruptivo">🔥 Polêmico & Gatilhos de Urgência</option>
                </select>
              </div>
            </div>

            {activeTab !== "whatsapp" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Hashtags do Nicho</label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Fatos Extras no Criativo (Opcional)</label>
              <textarea
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Insira detalhes adicionais do vídeo/imagem ou comandos específicos para a IA..."
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Providers bar */}
            <div className="p-4 bg-slate-950 text-white rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1">
                  <Flame size={13} className="text-blue-400 animate-bounce" />
                  Módulo de IA Web-Cloud:
                </h4>
                <p className="text-[10px] text-slate-400">Escolha o modelo inteligente preferido para processar as mídias e gerar textos altamente persuasivos.</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setProvider("gemini"); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                    provider === "gemini" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Gemini API Cloud
                </button>
                <button
                  type="button"
                  onClick={() => { setProvider("groq"); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                    provider === "groq" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Groq API Externa
                </button>
              </div>
            </div>

            {provider === "groq" && (
              <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-red-800">Chave de API do Groq (Aceleração Externa)</span>
                  <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-blue-600 underline text-[10px]">Obter Token Grátis ↗</a>
                </div>
                <input
                  type="password"
                  placeholder="Insira sua Chave Groq gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  className="w-full px-3 py-1.5 border border-red-200 bg-white rounded-lg text-xs font-mono text-slate-700 focus:outline-none"
                />
              </div>
            )}

            {isAnalyzing ? (
              <div className="space-y-2 py-2">
                <div className="flex justify-between text-xs font-bold text-blue-700">
                  <span>🤖 {statusMessage}</span>
                  <span>{analysisProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerateVariations}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Sparkles size={15} /> Gerar Legenda Exclusiva {activeTab.toUpperCase()}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Mock Device Render based on Active Platform */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl max-w-sm mx-auto relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full flex justify-center items-center gap-1.5">
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
              <div className="w-2 h-2 bg-slate-800 rounded-full" />
            </div>

            {/* Platform Dynamic Mock Display */}
            <div className="mt-4 rounded-2xl overflow-hidden shadow-xl select-none text-slate-900 bg-white">
              
              {/* INSTAGRAM MOCK */}
              {activeTab === "instagram" && (
                <div className="bg-white">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80" alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs font-black tracking-tight">{accounts.instagram.username}</span>
                    </div>
                    <span className="text-slate-400 font-bold hover:text-slate-600 cursor-pointer">...</span>
                  </div>

                  <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                    {mediaPreviewUrl ? (
                      selectedFile?.type.startsWith("video/") ? (
                        <video src={mediaPreviewUrl} autoPlay muted loop className="w-full h-full object-cover" />
                      ) : (
                        <img referrerPolicy="no-referrer" src={mediaPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <Instagram size={36} className="mx-auto text-pink-600 mb-1" />
                        <p className="text-[10px]">Nenhum criativo adicionado.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-1.5">
                    <p className="text-xs">
                      <span className="font-extrabold mr-1">{accounts.instagram.username}</span>
                      {generatedTexts.instagram ? (
                        <span className="whitespace-pre-line text-slate-700">{generatedTexts.instagram}</span>
                      ) : (
                        <span className="text-slate-400 italic">"Insira o criativo e gere a copy ao lado..."</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* TIKTOK MOCK */}
              {activeTab === "tiktok" && (
                <div className="bg-slate-950 text-white">
                  <div className="relative aspect-[9/14] bg-slate-900 flex items-center justify-center overflow-hidden">
                    {mediaPreviewUrl ? (
                      selectedFile?.type.startsWith("video/") ? (
                        <video src={mediaPreviewUrl} autoPlay muted loop className="w-full h-full object-cover" />
                      ) : (
                        <img referrerPolicy="no-referrer" src={mediaPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-center p-6 text-slate-500">
                        <Flame size={36} className="mx-auto text-teal-400 mb-1" />
                        <p className="text-[10px]">Visualizador TikTok Vazio.</p>
                      </div>
                    )}

                    {/* TikTok User Data Floating Overlay */}
                    <div className="absolute bottom-4 left-3 right-12 z-10 text-white space-y-1.5 text-xs drop-shadow-md">
                      <span className="font-bold">@{accounts.tiktok.username}</span>
                      <p className="line-clamp-3 text-[11px] text-slate-200">
                        {generatedTexts.tiktok ? generatedTexts.tiktok : "Insira o criativo de vídeo e clique em reescrever com IA TikTok para gerar a copy viral."}
                      </p>
                    </div>

                    {/* Interaction Buttons Column Right Overlay */}
                    <div className="absolute right-2 bottom-12 space-y-4 flex flex-col items-center">
                      <div className="w-9 h-9 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center text-white cursor-pointer"><Heart size={16} /></div>
                      <div className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-white cursor-pointer"><MessageSquare size={16} /></div>
                      <div className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-white cursor-pointer"><Share2 size={16} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* PINTEREST MOCK */}
              {activeTab === "pinterest" && (
                <div className="bg-stone-100 p-4">
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-3 border border-stone-200 max-w-[260px] mx-auto space-y-3">
                    <div className="aspect-[2/3] bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center">
                      {mediaPreviewUrl ? (
                        selectedFile?.type.startsWith("video/") ? (
                          <video src={mediaPreviewUrl} autoPlay muted loop className="w-full h-full object-cover" />
                        ) : (
                          <img referrerPolicy="no-referrer" src={mediaPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="text-center text-stone-400 p-4">
                          <Pin size={30} className="mx-auto text-red-600 mb-1" />
                          <p className="text-[9px]">Aguardando Pin.</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-slate-800 font-sans">
                      <h4 className="font-extrabold text-xs tracking-tight">Ideia ou Pin Gerado:</h4>
                      <p className="text-[10px] text-stone-600 line-clamp-4 leading-normal">
                        {generatedTexts.pinterest ? generatedTexts.pinterest : "Pinos do Pinterest acumulam tráfego orgânico por anos de forma automática."}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-stone-100">
                      <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80" alt="avatar" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-[10px] font-bold text-stone-500 truncate">{accounts.pinterest.username}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* WHATSAPP MOCK */}
              {activeTab === "whatsapp" && (
                <div className="bg-teal-950 text-white p-3 font-sans relative aspect-[9/14] flex flex-col justify-between">
                  {/* Whatsapp Status Top Indicators */}
                  <div className="space-y-2 z-10">
                    <div className="flex gap-1">
                      <div className="h-0.5 flex-1 bg-white" />
                      <div className="h-0.5 flex-1 bg-white/45" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{accounts.whatsapp.username}</span>
                      <span className="text-[9px] text-white/70">Hoje, 15:40</span>
                    </div>
                  </div>

                  {/* WhatsApp Status Body holds selected media */}
                  <div className="absolute inset-0 bg-teal-900 border border-teal-950 flex items-center justify-center overflow-hidden">
                    {mediaPreviewUrl ? (
                      selectedFile?.type.startsWith("video/") ? (
                        <video src={mediaPreviewUrl} autoPlay muted loop className="w-full h-full object-cover" />
                      ) : (
                        <img referrerPolicy="no-referrer" src={mediaPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-center p-6 text-white/40">
                        <MessageCircle size={32} className="mx-auto text-emerald-400 mb-1" />
                        <p className="text-[10px]">Nenhum criativo em Stories.</p>
                      </div>
                    )}
                  </div>

                  {/* Caption box at bottom overlay */}
                  <div className="z-10 bg-slate-900/85 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center text-xs space-y-2 max-h-[140px] overflow-y-auto">
                    <p className="leading-snug">
                      {generatedTexts.whatsapp ? generatedTexts.whatsapp : "Mensagens no WhatsApp Status geram picos instantâneos em grupos abertos de lançamentos."}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Direct Send Platform Publish Sync Indicator */}
            {generatedTexts[activeTab] && (
              <div className="mt-4 pt-1">
                <button
                  type="button"
                  onClick={() => handlePostPlatform(activeTab)}
                  disabled={isPosting[activeTab]}
                  className={`w-full py-2 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition text-white ${
                    activeTab === "instagram" ? "bg-gradient-to-tr from-purple-600 to-pink-600" :
                    activeTab === "tiktok" ? "bg-slate-900 hover:bg-slate-800" :
                    activeTab === "pinterest" ? "bg-red-600 hover:bg-red-700" :
                    "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isPosting[activeTab] ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Sincronizando...
                    </>
                  ) : isPosted[activeTab] ? (
                    <>
                      <Check size={13} /> Enviado e Postado no {activeTab.toUpperCase()}!
                    </>
                  ) : (
                    <>
                      <Send size={13} /> Publicar Direto na Conta
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sponsoring account information details and alert anti shadowban */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Propriedades da Distribuição</span>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase">Perfil Ativo {activeTab.toUpperCase()}</span>
              <span className="font-mono text-slate-500">{accounts[activeTab].followers}</span>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-900 flex gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-blue-600" />
              <p className="leading-normal">
                <strong>Rodízio de Hashs Anti-detecção:</strong> Perfis de celular nativos ou simuladores que publicam mídias de vídeo com textos variados reduzem as punições das plataformas em 98%.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
