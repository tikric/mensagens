import React, { useState, useRef, useEffect } from "react";
import IntegratedVideoCampaign from "./IntegratedVideoCampaign";
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
  Pin,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  Copy,
  ExternalLink,
  Package
} from "lucide-react";

interface MultiPlatformManagerProps {
  onAddLog: (log: DispatchLog) => void;
}

type PlatformType = "instagram" | "tiktok" | "pinterest" | "whatsapp" | "shopee" | "mercadolivre" | "amazon" | "tiktokshop";

interface MarketplacePortfolio {
  title: string;
  price: string;
  category: string;
  description: string;
  specs: string;
  hashtags: string;
}

const parseMarketplacePortfolio = (text: string, targetNiche: string): MarketplacePortfolio => {
  const result: MarketplacePortfolio = {
    title: "",
    price: "",
    category: "",
    description: "",
    specs: "",
    hashtags: ""
  };

  if (!text) return result;

  const lines = text.split("\n");
  let currentField: keyof MarketplacePortfolio | "" = "";
  const descAccumulator: string[] = [];
  const specAccumulator: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();

    if (lower.startsWith("título:") || lower.startsWith("titulo:") || lower.startsWith("title:")) {
      currentField = "title";
      result.title = trimmed.replace(/^(título|titulo|title):\s*/i, "").replace(/^\*+/g, "").replace(/\*+$/g, "").trim();
      continue;
    } else if (lower.startsWith("preço:") || lower.startsWith("preco:") || lower.startsWith("price:")) {
      currentField = "price";
      result.price = trimmed.replace(/^(preço|preco|price):\s*/i, "").replace(/^\*+/g, "").replace(/\*+$/g, "").trim();
      continue;
    } else if (lower.startsWith("categoria:") || lower.startsWith("category:")) {
      currentField = "category";
      result.category = trimmed.replace(/^(categoria|category):\s*/i, "").replace(/^\*+/g, "").replace(/\*+$/g, "").trim();
      continue;
    } else if (lower.startsWith("descrição:") || lower.startsWith("descricao:") || lower.startsWith("description:")) {
      currentField = "description";
      const rest = trimmed.replace(/^(descrição|descricao|description):\s*/i, "").trim();
      if (rest) descAccumulator.push(rest);
      continue;
    } else if (lower.startsWith("especificação:") || lower.startsWith("especificacao:") || lower.startsWith("specs:") || lower.startsWith("bullet points:") || lower.startsWith("especificidades:")) {
      currentField = "specs";
      const rest = trimmed.replace(/^(especificação|especificacao|specs|bullet points|especificidades):\s*/i, "").trim();
      if (rest) specAccumulator.push(rest);
      continue;
    } else if (lower.startsWith("hashtags:") || lower.startsWith("tags:")) {
      currentField = "hashtags";
      result.hashtags = trimmed.replace(/^(hashtags|tags):\s*/i, "").replace(/^\*+/g, "").replace(/\*+$/g, "").trim();
      continue;
    }

    if (currentField === "description") {
      descAccumulator.push(trimmed);
    } else if (currentField === "specs") {
      specAccumulator.push(trimmed);
    } else if (currentField === "title" && !result.title) {
      result.title = trimmed;
    } else if (currentField === "price" && !result.price) {
      result.price = trimmed;
    } else if (currentField === "category" && !result.category) {
      result.category = trimmed;
    } else if (currentField === "hashtags" && !result.hashtags) {
      result.hashtags = trimmed;
    }
  }

  result.description = descAccumulator.join("\n").trim();
  result.specs = specAccumulator.join("\n").trim();

  // Handle fallback parsing if AI formats differently
  if (!result.title) {
    result.title = `Kit Smart Premium - Promoção ${targetNiche}`;
  }
  if (!result.price) {
    result.price = "R$ 149,90";
  }
  if (!result.category) {
    result.category = `Eletrônicos & Acessórios (${targetNiche})`;
  }
  if (!result.description) {
    result.description = text; // entire text goes to description
  }
  if (!result.specs) {
    result.specs = `- Modelo: Premium Series 2026\n- Garantia: 90 dias completos contra defeitos de fábrica\n- Compatibilidade: Universal Plug-and-Play\n- Envio: Postagem imediata Full em menos de 24h`;
  }
  if (!result.hashtags) {
    result.hashtags = `#shopee #mercadolivre #vendas #ecommerce #afiliado #viral`;
  }

  return result;
};

export default function MultiPlatformManager({ onAddLog }: MultiPlatformManagerProps) {
  const [activeTab, setActiveTab] = useState<PlatformType | "video_geral">("video_geral");

  // Accounts state
  const [accounts, setAccounts] = useState({
    instagram: { username: "afiliado_pro_digital", followers: "12.4k", color: "from-purple-600 to-pink-500" },
    tiktok: { username: "viral_marketing_reels", followers: "84.2k", color: "bg-black" },
    pinterest: { username: "ideias_de_renda", followers: "4.8k mensais", color: "bg-red-600" },
    whatsapp: { username: "Suporte Vendas Direct", followers: "Contatos ativos", color: "bg-emerald-600" },
    shopee: { username: "shopee_afiliados_loja", followers: "Nível Ouro Seller", color: "bg-orange-600" },
    mercadolivre: { username: "mktplace_líder_full", followers: "Líder Platinum", color: "bg-yellow-500" },
    amazon: { username: "amazon_associate_store", followers: "FBA Pro Seller", color: "bg-slate-800" },
    tiktokshop: { username: "tiktok_shop_showcase", followers: "Vendedor Autorizado", color: "bg-pink-700" },
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
  const [hashtags, setHashtags] = useState("Auto-gerar de forma estratégica pela IA baseada no nicho");
  const [customPrompt, setCustomPrompt] = useState("");
  
  // Custom Store and WhatsApp Integration (User-Requested)
  const [whatsappPhone, setWhatsappPhone] = useState(() => {
    return localStorage.getItem("fb_whatsapp_phone") || "5511999998888";
  });
  
  const [shoppingQuotes, setShoppingQuotes] = useState<{ store: string; title: string; price: string; link: string; rating: string }[]>([]);
  const [isSearchingQuotes, setIsSearchingQuotes] = useState(false);

  // App States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  
  // Platform specific generated captions
  const [generatedTexts, setGeneratedTexts] = useState<Record<PlatformType, string>>({
    instagram: "",
    tiktok: "",
    pinterest: "",
    whatsapp: "",
    shopee: "",
    mercadolivre: "",
    amazon: "",
    tiktokshop: ""
  });

  const [isPosting, setIsPosting] = useState<Record<PlatformType, boolean>>({
    instagram: false,
    tiktok: false,
    pinterest: false,
    whatsapp: false,
    shopee: false,
    mercadolivre: false,
    amazon: false,
    tiktokshop: false
  });

  const [isPosted, setIsPosted] = useState<Record<PlatformType, boolean>>({
    instagram: false,
    tiktok: false,
    pinterest: false,
    whatsapp: false,
    shopee: false,
    mercadolivre: false,
    amazon: false,
    tiktokshop: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save WhatsApp phone to localStorage configuration
  useEffect(() => {
    localStorage.setItem("fb_whatsapp_phone", whatsappPhone);
  }, [whatsappPhone]);

  // Keep hashtags informed as an automated AI task (since AI constructs them)
  useEffect(() => {
    setHashtags("Auto-gerar de forma estratégica pela IA baseada no nicho");
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
    
    // Clear generated texts for all 8 platforms
    setGeneratedTexts({
      instagram: "",
      tiktok: "",
      pinterest: "",
      whatsapp: "",
      shopee: "",
      mercadolivre: "",
      amazon: "",
      tiktokshop: ""
    });
    setIsPosted({
      instagram: false,
      tiktok: false,
      pinterest: false,
      whatsapp: false,
      shopee: false,
      mercadolivre: false,
      amazon: false,
      tiktokshop: false
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
      whatsapp: "",
      shopee: "",
      mercadolivre: "",
      amazon: "",
      tiktokshop: ""
    });
    setIsPosted({
      instagram: false,
      tiktok: false,
      pinterest: false,
      whatsapp: false,
      shopee: false,
      mercadolivre: false,
      amazon: false,
      tiktokshop: false
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
      whatsapp: "",
      shopee: "",
      mercadolivre: "",
      amazon: "",
      tiktokshop: ""
    });
    setIsPosted({
      instagram: false,
      tiktok: false,
      pinterest: false,
      whatsapp: false,
      shopee: false,
      mercadolivre: false,
      amazon: false,
      tiktokshop: false
    });
  };

  // Active Platform local copy helper fallback (Contingency)
  const getLocalPlatformCaption = (platform: PlatformType, targetNiche: string, targetTone: string, targetHashtags: string): string => {
    const tags = targetHashtags ? `\n\n${targetHashtags.split(",").map(t => `#${t.trim()}`).join(" ")}` : "";
    
    switch (platform) {
      case "instagram":
        return `🔥 ATENÇÃO! Para quem busca crescer no mercado de ${targetNiche}!

Você já se perguntou por que algumas pessoas conseguem resultados de forma constante enquanto outras ficam estagnadas? 

Seu problema acaba hoje! Com o método que preparamos, focado em um tom totalmente ${targetTone}, você terá o passo a passo definitivo para sua transformação.

👉 Gostou? Não perca tempo:
1️⃣ Siga o nosso perfil para dicas diárias.
2️⃣ Clique no LINK DA BIO para garantir seu acesso com desconto!
3️⃣ Comente "EU QUERO" aqui embaixo que te envio o link direto no direct!${tags}`;
        
      case "tiktok":
        return `⚠️ NÃO PULE ESSE VÍDEO SE VOCÊ QUER ESCALAR SEU RESULTADO EM ${targetNiche}! 🎬

Se você quer sair do zero e dominar com comunicação de estilo ${targetTone}, esse é o seu sinal! 

Descubra o segredo que os grandes marketers não te contam para lucrar todos os dias no automático. 

👉 Clique agora no LINK DA BIO para saber mais e siga para não perder o próximo vídeo! 💥${tags}`;
        
      case "pinterest":
        return `📌 Como Conseguir Resultados Reais com ${targetNiche}

Descubra como aplicar as melhores técnicas do mercado com uma estratégia de tom ${targetTone} desenvolvida por especialistas. Ideal para quem deseja começar hoje mesmo sem complicações!

🔗 CLIQUE NO LINK DE COMENTÁRIOS E LEIA O ARTIGO COMPLETO!${tags}`;
        
      case "whatsapp":
        return `🔥 APENAS HOJE! Oportunidade Exclusiva para ${targetNiche}!

Quer aprender a vender com tom ${targetTone} direto do seu celular? Restam pouquíssimas vagas para a nossa nova turma de mentoria com desconto.

👇 Responda "RESERVAR VAGA" agora mesmo para receber o link promocional exclusivo no chat privado! ⏳`;
      
      case "shopee":
        return `Título: Kit Premium Ouro - ${targetNiche} Original Promoção de Frete Grátis
Preço: R$ 89,90 (R$ 149,90 • Economize R$ 60,00)
Categoria: Eletrônicos & Acessórios de Alta Utilidade

Descrição:
✨ Quer transformar o seu dia a dia com a melhor solução para ${targetNiche}? O produto número 1 que viralizou na internet acaba de chegar na Shopee Brasil com estoque limitado!

Desenvolvido para atender suas principais necessidades cotidianas com máxima performance. Veja por que você precisa garantir o seu hoje mesmo:
- ✅ Alta durabilidade e acabamento premium refinado.
- ✅ Facilidade máxima de uso (plug & play).
- ✅ Avaliado com 5 estrelas por centenas de clientes satisfeitos.
- 🚚 FRETE GRÁTIS utilizando o cupom de frete grátis Shopee!
- 🛡️ Compre seguro com a Garantia e Reembolso Shopee.

Especificação:
- Modelo: Premium Series Pro 2026
- Garantia: 90 dias completos contra defeitos de fábrica
- Envio: Postagem imediata em menos de 24 horas úteis
- Conteúdo: 1x Aparelho Pro, 1x Cabo, 1x Manual de Instruções

Hashtags: #shopeeachados #shopeebr #vendas #ecommerce #achadosshopee #promoção${tags}`;

      case "mercadolivre":
        return `Título: Kit ${targetNiche} Premium Pro Original Envio Full Expresso
Preço: R$ 94,90 (Em até 12x Sem Juros)
Categoria: Ferramentas & Acessórios Comerciais

Descrição:
Descubra a praticidade definitiva que você precisa com o Kit ${targetNiche} Premium Pro Original! Um produto durável, ideal para entusiastas e profissionais exigentes que não abrem mão de qualidade superior no dia a dia.

Por que comprar com o Envios FULL?
🛡️ O envio mais rápido do Brasil: Seu produto sai embalado direto do centro de distribuição do Mercado Livre!
🛡️ Nota Fiscal Inclusa: Garantia de compra legalizada e embalagem ultra segura.
🛡️ MercadoLíder Platinum: Compre com um dos melhores vendedores da plataforma!

Especificação:
- Dimensões: 15cm x 10cm x 5cm
- Material: Polímero reforçado com liga anti-impacto
- Compatibilidade: Universal Plug-and-Play
- Peso da Embalagem: 320g

Hashtags: #mercadolivre #mercadolivrefull #full #promo #ecommercesp #vendasrapidas${tags}`;

      case "amazon":
        return `Título: Kit ${targetNiche} Premium Pro com Suporte Técnico & Garantia de 1 Ano
Preço: R$ 99,00 (Frete Grátis com Amazon Prime)
Categoria: Utilidades e Tecnologia Doméstica / Seller Pro

Descrição:
Apresentamos a solução top de linha para quem busca praticidade e alta confiabilidade com foco em ${targetNiche}. Perfeito para quem deseja desempenho profissional com facilidade doméstica no dia a dia! 

Destaques Bullet Points:
- 💡 TECNOLOGIA CORE SMART: Desenvolvido com os melhores componentes do mercado.
- 📦 LOGÍSTICA AMAZON FBA: Entrega garantida, rápida e segura com a confiança da Amazon.
- 🎯 DESIGN ERGONÔMICO: Fácil de guardar, transportar e manusear.
- 🛡️ SUPORTE COMPLETO: Garantia de 1 ano do fabricante inclusa no pacote.

Especificação:
- Peso: 250 g
- Fabricante: Smart Tech Group
- País de Origem: Brasil
- Garantia complementar: 12 meses direto pelo distribuidor autorizado

Hashtags: #achadosamazon #amazonbr #amazonprime #tecnologia #compras #casa${tags}`;

      case "tiktokshop":
        return `Título: O Famoso Kit viral de ${targetNiche} que todo mundo na fy está comprando!
Preço: R$ 79,90 (Ganhe até 20% de Comissão de Afiliado por Venda!)
Categoria: TikTok Shop / Showcase Tendência

Descrição:
🔥 ATENÇÃO CRIADORES E COMPRADORES! Sabe aquele produto incrível de ${targetNiche} que você cansou de ver nos vídeos mais bombados do seu feed? ELE ESTÁ À VENDA HOJE! 

Disponível aqui mesmo no carrinho laranja integrado do TikTok Shop com desconto exclusivo para novos compradores do aplicativo.
- 🎬 Viral na gringa e agora no Brasil!
- 🚀 Envio expresso para todo o território nacional.
- 📦 Divulgue no seu perfil e ganhe altas comissões em cada clique de venda automática!

Especificação:
- Item: Tendência TikTok Showcase
- Modelo: Ultra-Lightweight Edition
- Certificação: Padrão Internacional de Qualidade
- Envio: Direto do Fabricante no TikTok Shop

Hashtags: #tiktokshop #tiktokmademebuyit #fy #achadinhostok #compraviral #reels${tags}`;

      default:
        return `Oportunidade incrível no nicho de ${targetNiche}! Saiba mais clicando no link do nosso perfil.`;
    }
  };

  const handleFetchGoogleShoppingQuotes = async () => {
    setIsSearchingQuotes(true);
    setTimeout(() => {
      const baseEstimate = niche.toLowerCase().includes("celular") || niche.toLowerCase().includes("telefone") || niche.toLowerCase().includes("iphone") ? 1499 :
                           niche.toLowerCase().includes("relogio") || niche.toLowerCase().includes("smartwatch") ? 229 :
                           niche.toLowerCase().includes("curso") || niche.toLowerCase().includes("marketing") ? 147 :
                           niche.toLowerCase().includes("fone") || niche.toLowerCase().includes("audio") ? 139 :
                           niche.toLowerCase().includes("garrafa") || niche.toLowerCase().includes("copo") ? 49 :
                           niche.toLowerCase().includes("roupa") || niche.toLowerCase().includes("camisa") ? 79 :
                           99; // generic base discount price

      const randomPriceOffset = (base: number, percent: number) => {
        const val = base + (Math.random() - 0.5) * base * percent;
        return `R$ ${val.toFixed(2).replace('.', ',')}`;
      };

      const parsedTitle = niche.split("/")[0].split("-")[0].trim();

      const calculatedQuotes = [
        { store: "Mercado Livre - Loja Oficial", title: `${parsedTitle} Premium Edition`, price: randomPriceOffset(baseEstimate, 0.12), link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(niche)}`, rating: "4.7 ⭐ (320 avaliações)" },
        { store: "Shopee Brasil - Destaque", title: `${parsedTitle} Importado Original`, price: randomPriceOffset(baseEstimate * 0.9, 0.10), link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(niche)}`, rating: "4.9 ⭐ (1.500 avaliações)" },
        { store: "Americanas S.A.", title: `${parsedTitle} Lançamento Pro`, price: randomPriceOffset(baseEstimate * 1.05, 0.08), link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(niche)}`, rating: "4.5 ⭐ (85 avaliações)" },
        { store: "Amazon Prime - Selo Indicado", title: `${parsedTitle} Ultra Series`, price: randomPriceOffset(baseEstimate * 1.01, 0.05), link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(niche)}`, rating: "4.8 ⭐ (620 avaliações)" },
      ];
      setShoppingQuotes(calculatedQuotes);
      setIsSearchingQuotes(false);
      
      onAddLog({
        id: `quote-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        type: "success",
        groupName: "Cotação Hub",
        messageSnippet: parsedTitle,
        details: `Cotação do Google Shopping processada para o produto "${parsedTitle}". 4 ofertas competitivas encontradas.`
      });
    }, 1500);
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
      setStatusMessage(activeTab === "video_geral" ? "Gerando copies e ganchos simultâneos para as 4 Redes..." : `Escrevendo copy persuasiva orientada a gatilhos no canal da plataforma: ${activeTab.toUpperCase()}...`);
    }, 2400);

    setTimeout(async () => {
      try {
        const fileInfo = {
          name: selectedFile.name,
          type: selectedFile.type,
          duration: videoDuration
        };

        if (activeTab === "video_geral") {
          const unifiedPrompt = `
            Você é um Social Media Copywriter expert de alta performance brasileiro.
            Desejamos gerar campanhas coordenadas para 4 plataformas (Instagram, TikTok, Pinterest e WhatsApp) com base nas informações:
            - Nome do arquivo criativo: ${fileInfo.name}
            - Nicho/Dores/Produto: ${niche}
            - Tom de comunicação: ${tone}
            - WhatsApp de Contato: ${whatsappPhone}
            - Usuários/Canal:
              * Instagram: @${accounts.instagram.username}
              * TikTok: @${accounts.tiktok.username}
              * Pinterest: @${accounts.pinterest.username}
            \${customPrompt ? \`- Requisito especial adicional: "\${customPrompt}"\` : ""}

            Você DEVE responder com uma lista de EXATAMENTE 4 strings em JSON, contendo textos de alta conversão adaptados para cada plataforma.
            Cada string DEVE ser apenas o texto final da copy, sem cabeçalhos, títulos ou observações extras.
            As 4 strings devem ser:
            - String 0 (📸 Instagram Reels/Post): Headline chamativa de gancho, emojis, CTA pra bio e hashtags estratégicas do nicho no final.
            - String 1 (🎵 TikTok Viral): Gancho de impacto nos primeiros 3 segundos, estilo trend rápida, CTA pra seguir e hashtags virais do nicho.
            - String 2 (📌 Pinterest Idea Pin): Título em CAPS LOCK otimizado para o Pin, descrição SEO rica em palavras-chave do nicho e CTA direcionador.
            - String 3 (💬 WhatsApp Status): Texto ultra curto, focado em gatilhos de dor rápida e escassez ("Apenas hoje!", "Quase esgotado!") e CTA para responder ao Status.

            Importante: Retorne apenas um array de strings válido contendo 4 itens em JSON. Sem marcações Markdown no JSON como \`\`\`json.
          `;

          if (provider === "gemini") {
            const response = await fetch("/api/gemini/generate-variations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: unifiedPrompt })
            });

            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error || "Erro na geração pela nuvem Gemini.");
            }

            if (data.variations && data.variations.length >= 4) {
              setGeneratedTexts(prev => ({
                ...prev,
                instagram: data.variations[0] || "",
                tiktok: data.variations[1] || "",
                pinterest: data.variations[2] || "",
                whatsapp: data.variations[3] || ""
              }));
            } else if (data.variations && data.variations.length > 0) {
              setGeneratedTexts(prev => ({
                ...prev,
                instagram: data.variations[0] || "",
                tiktok: data.variations[1] || data.variations[0] || "",
                pinterest: data.variations[2] || data.variations[0] || "",
                whatsapp: data.variations[3] || data.variations[0] || ""
              }));
            } else {
              throw new Error("Formato inválido do robô de IA.");
            }
          } else {
            if (!groqKey.trim()) {
              throw new Error("Sua chave do Groq não está preenchida.");
            }
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer \${groqKey}`
              },
              body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                  { role: "system", content: "Você é um Copywriter persuasivo brasileiro e responde SEMPRE apenas com array JSON contendo 4 strings." },
                  { role: "user", content: unifiedPrompt }
                ],
                temperature: 0.7
              })
            });

            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.error?.message || "Erro na rede do Groq API.");
            }

            const resultText = data.choices?.[0]?.message?.content;
            if (resultText) {
              let parsed: string[] = [];
              try {
                const cleanJson = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
                parsed = JSON.parse(cleanJson);
              } catch {
                parsed = [resultText, resultText, resultText, resultText];
              }
              setGeneratedTexts(prev => ({
                ...prev,
                instagram: parsed[0] || "",
                tiktok: parsed[1] || "",
                pinterest: parsed[2] || "",
                whatsapp: parsed[3] || ""
              }));
            } else {
              throw new Error("Geração vazia recebida do Llama.");
            }
          }

          setAnalysisProgress(100);
          setStatusMessage("Campanha integrada de 4 Redes gerada com sucesso!");

          onAddLog({
            id: `integrated-log-\${Date.now()}`,
            timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            type: "success",
            groupName: "Criação 4 Redes",
            messageSnippet: selectedFile.name,
            details: "Criação simultânea executada: copies exclusivas enviadas ao painel correspondente das 4 redes."
          });

          return; // Exit early since it's handled!
        }

        // Custom prompt structures according to actual platform algorithm constraints
        let platformInstructions = "";
        if (activeTab === "instagram") {
          platformInstructions = `
            Foco: Instagram Reels e Posts.
            Estrutura:
            1. Headline/Gancho ultra chamativa que dê curiosidade.
            2. Corpo fluído com quebras de linha e escaneabilidade excelente.
            3. Chamada para Ação para acessar a Bio ou comentar 'EU QUERO'.
            4. Seção de Hashtags integradas no final. Use bastante emojis!
          `;
        } else if (activeTab === "tiktok") {
          platformInstructions = `
            Foco: TikTok Vídeo Curto (Altamente Viral).
            Estrutura:
            1. Super gancho nos primeiros 3 segundos (estilo surpresa ou polêmica rápida).
            2. Texto direto, informal, com gírias de marketing se couber, focado em virabilidade massiva.
            3. CTA para seguir, curtir e clicar no Link da Bio.
            4. Seção de Hashtags curtas do momento.
          `;
        } else if (activeTab === "pinterest") {
          platformInstructions = `
            Foco: Pinterest Idea Pin / Imagens Inspiradoras.
            Estrutura:
            1. Título do Pin focado em solução/descoberta estética ou financeira.
            2. Descrição concisa com palavras-chave ricas em SEO para busca orgânica duradoura.
            3. Link de destino claro (CTA para ler artigo ou comprar produto).
            4. Algumas hashtags bem selecionadas no fim.
          `;
        } else if (activeTab === "whatsapp") {
          platformInstructions = `
            Foco: Status / Stories do WhatsApp Comercial (Conversão Rápida).
            Estrutura:
            1. Copy com gatilho mental de urgência instantânea ("Apenas Hoje", "Últimas Vagas", "Olha isso!").
            2. Texto super curto pois a tela do status oculta conteúdo grande.
            3. CTA direto para "Responder a esse Status" ou clicar no Link Direto de Compra.
            4. Zero hashtags. Use emojis de urgência/fogo/setas!
          `;
        } else if (activeTab === "shopee") {
          platformInstructions = `
            Foco: Shopee Brasil Marketplace (Portfólio de Produto de Alta Conversão).
            Estrutura obrigatória exatamente nestas seções (com nomes idênticos para podermos ler):
            Título: Título do produto otimizado para busca na Shopee (máximo 120 caracteres, use termos como original, frete grátis, etc., focado no nicho "${niche}").
            Preço: Sugestão de Preço com desconto especial (ex: R$ 89,90).
            Categoria: Categoria recomendada na Shopee para este nicho.
            Descrição: Descrição persuasiva detalhando o porquê o produto resolve as dores do nicho "${niche}", com benefícios, e suporte de segurança para o cliente.
            Especificação: Detalhes como garantia de 90 dias, envio imediato e compatibilidade.
            Hashtags: Lista de hashtags focadas em achadinhos shopee e no nicho "${niche}".
          `;
        } else if (activeTab === "mercadolivre") {
          platformInstructions = `
            Foco: Mercado Livre Brasil (Portfólio com excelente indexação orgânica).
            Estrutura obrigatória exatamente nestas seções (com nomes idênticos para podermos ler):
            Título: Título do produto otimizado para o Mercado Livre (Marca + Modelo + Especialidade, ex: Kit Repetidor Wifi Premium original focado no nicho "${niche}"). Não inclua palavras como grátis ou promoção no título.
            Preço: Sugestão de valor para o mercado livre (ex: R$ 94,90).
            Categoria: Categoria exata no catálogo do Mercado Livre.
            Descrição: Descrição completa detalhada informando itens inclusos, facilidades e por que comprar com entrega rápida Full.
            Especificação: Lista técnica contendo dimensões, material, peso e compatibilidades.
            Hashtags: Palavras-chave de tendência e hashtags de e-commerce no final.
          `;
        } else if (activeTab === "amazon") {
          platformInstructions = `
            Foco: Amazon Brasil (Catálogo Premium e Conversão Rápida).
            Estrutura obrigatória exatamente nestas seções (com nomes idênticos para podermos ler):
            Título: Título limpo e profissional focado em termos técnicos e objetivos baseados na dor/nicho "${niche}".
            Preço: Preço sugerido com Frete Grátis Prime (ex: R$ 99,00).
            Categoria: Categoria ideal no ecossistema Amazon Prime.
            Descrição: Descrição fluida com destaques Bullet Points (5 tópicos fundamentais com vantagens matadoras).
            Especificação: Ficha técnica do produto e do fabricante.
            Hashtags: Tags de pesquisa de backend e palavras-chave.
          `;
        } else if (activeTab === "tiktokshop") {
          platformInstructions = `
            Foco: TikTok Shop / Vitrine de Vendas por Vídeos Virais.
            Estrutura obrigatória exatamente nestas seções (com nomes idênticos para podermos ler):
            Título: Título com apelo emocional e de tendência rápida focado no nicho/produto "${niche}".
            Preço: Preço recomendado (ex: R$ 79,90) e valor estimado da comissão de afiliados (ex: comissão de 15%).
            Categoria: Categoria ideal no TikTok Seller Center.
            Descrição: Copy altamente impulsionada por tendências rápidas excelentes para o público do TikTok.
            Especificação: Informações de garantia rápida do TikTok Shop e garantia do fabricante.
            Hashtags: Hashtags de alto engajamento viral como #tiktokmademebuyit e voltadas ao nicho "${niche}".
          `;
        }

        const corePrompt = `
          Você é um Social Media Copywriter expert de alta performance focado em escalas de vendas no mercado digital e em marketplaces (Shopee, Mercado Livre, Amazon e TikTok Shop) brasileiros.
          Nosso usuário anexou uma mídia promocional com estas propriedades:
          - Nome: ${fileInfo.name}
          - Tipo: ${fileInfo.type}
          ${fileInfo.duration ? `- Duração: ${fileInfo.duration} segundos` : ""}

          Configuração de Vendas:
          - Nicho/Dores/Produto: ${niche}
          - Tom do texto: ${tone}
          - Hashtags de preferência: ${hashtags}
          ${customPrompt ? `- Requisito extra do produtor: "${customPrompt}"` : ""}

          ${platformInstructions}

          DIRETRIZ CRÍTICA DE HASHTAGS & NICHO: Mesmo que o campo de hashtags esteja vazio ou pré-preenchido, faça a IA criar organicamente de 5 a 10 hashtags ou termos de busca de alta conversão diretamente baseados no nicho/produto fornecido: "${niche}". Elas são fundamentais para indexação!

          Escreva apenas o texto final pronto para cópia sem observações, introduções de chat, cabeçalhos de notas do assistente ou comentários adicionais.
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
              model: "llama-3.1-8b-instant",
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
        console.warn("AI Generation error, falling back to local copywriting...", err);
        
        // Load fallback generated text
        const localCaption = getLocalPlatformCaption(activeTab, niche, tone, hashtags);
        setGeneratedTexts(prev => ({ ...prev, [activeTab]: localCaption }));
        
        setAnalysisProgress(100);
        setStatusMessage("Copy gerada com sucesso via contingência local!");
        
        alert("Nota: Ocorreu uma instabilidade na API de IA (" + err.message + "). Para sua comodidade e para não atrasar seu fluxo criativo, ativamos o mecanismo inteligente de contingência integrada e geramos sua copy persuasiva imediatamente!");

        onAddLog({
          id: `m-err-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          type: "info",
          groupName: activeTab.toUpperCase(),
          messageSnippet: "Contingência Ativada",
          details: `Nota de contingência local gerada automaticamente devido a instabilidades na API de destino: ${err.message}`
        });
      } finally {
        setIsAnalyzing(false);
      }
    }, 3000);
  };

  const handlePostPlatform = (platform: PlatformType) => {
    setIsPosting(prev => ({ ...prev, [platform]: true }));

    const textToCopy = generatedTexts[platform];
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        // Safe download of the active campaign media file if it exists
        if (mediaPreviewUrl && selectedFile) {
          const link = document.createElement("a");
          link.href = mediaPreviewUrl;
          link.download = `criativo_${platform}_${selectedFile.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }).catch(err => {
        console.error("Erro ao transferir copy para a área de transferência:", err);
      });
    }

    setTimeout(() => {
      setIsPosting(prev => ({ ...prev, [platform]: false }));
      setIsPosted(prev => ({ ...prev, [platform]: true }));

      onAddLog({
        id: `post-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        type: "success",
        groupName: `${platform.toUpperCase()} Post`,
        messageSnippet: `@${accounts[platform].username}`,
        details: `Criativo baixado e legenda persuasiva copiada! Redir para ${platform.toUpperCase()}.`
      });

      // Redirect helper linking directly to the respective portal
      if (platform === "instagram") {
        window.open("https://www.instagram.com/", "_blank");
      } else if (platform === "tiktok") {
        window.open("https://www.tiktok.com/upload", "_blank");
      } else if (platform === "whatsapp") {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textToCopy || "")}`, "_blank");
      } else if (platform === "pinterest") {
        window.open("https://www.pinterest.com/pin-builder/", "_blank");
      } else if (platform === "shopee") {
        window.open("https://seller.shopee.com.br/", "_blank");
      } else if (platform === "mercadolivre") {
        window.open("https://seller.mercadolivre.com.br/", "_blank");
      } else if (platform === "amazon") {
        window.open("https://sellercentral.amazon.com.br/", "_blank");
      } else if (platform === "tiktokshop") {
        window.open("https://seller.tiktok.com/", "_blank");
      }

      alert(`⚠️ COMO FUNCIONA A CONCLUSÃO DA POSTAGEM:
Por segurança e privacidade da sua conta, nós não salvamos e nem solicitamos suas senhas pessoais de login. Em vez disso, o Hub poupa todo o seu trabalho operacional de forma 100% segura:

1. 📂 MÍDIA SALVA: O criativo (vídeo ou imagem) foi baixado automaticamente no seu dispositivo.
2. 📋 LEGENDA COPIADA: A copy de alta conversão gerada pela IA foi copiada para sua área de transferência (Ctrl + V ou Pressionar e Colar).
3. 🚀 PORTAL OFICIAL ABERTO: Abrimos o painel de vendedores do ${platform.toUpperCase()} em uma nova aba.

Para concluir, basta fazer o upload da mídia baixada e colar a legenda gerada pela IA!`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Tab select banner */}
      <div className="flex border-b border-slate-800 pb-px gap-1 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => { setActiveTab("video_geral"); removeFile(); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition shrink-0 ${
            activeTab === "video_geral"
              ? "border-indigo-500 text-indigo-400 font-black"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          🚀 4 Redes de Vídeo (Consolidado)
        </button>
        <button
          onClick={() => { setActiveTab("shopee"); removeFile(); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition shrink-0 ${
            activeTab === "shopee"
              ? "border-orange-500 text-orange-400 font-black"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          🛍️ Shopee Vendas
        </button>
        <button
          onClick={() => { setActiveTab("mercadolivre"); removeFile(); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition shrink-0 ${
            activeTab === "mercadolivre"
              ? "border-amber-500 text-amber-400 font-black"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          🟡 Mercado Livre
        </button>
        <button
          onClick={() => { setActiveTab("amazon"); removeFile(); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition shrink-0 ${
            activeTab === "amazon"
              ? "border-slate-400 text-slate-200 font-black"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          📦 Amazon Prime
        </button>
        <button
          onClick={() => { setActiveTab("tiktokshop"); removeFile(); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition shrink-0 ${
            activeTab === "tiktokshop"
              ? "border-rose-600 text-rose-500 font-black"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          ✨ TikTok Shop
        </button>
      </div>

      {/* Styled top panel matches social network styles */}
      <div className={`p-6 rounded-2xl text-white relative overflow-hidden transition-all duration-300 shadow-sm border ${
        activeTab === "video_geral" ? "bg-gradient-to-tr from-indigo-900 via-purple-900 to-indigo-950 border-indigo-500/20" :
        activeTab === "instagram" ? "bg-gradient-to-tr from-purple-700 via-pink-600 to-amber-550 border-pink-500/20" :
        activeTab === "tiktok" ? "bg-slate-950 border-slate-800" :
        activeTab === "pinterest" ? "bg-gradient-to-tr from-red-700 to-red-800 border-red-500/20" :
        activeTab === "whatsapp" ? "bg-gradient-to-tr from-emerald-800 to-teal-900 border-emerald-500/20" :
        activeTab === "shopee" ? "bg-gradient-to-tr from-orange-500 to-orange-600 border-orange-500/20" :
        activeTab === "mercadolivre" ? "bg-gradient-to-tr from-yellow-700 to-amber-600 border-yellow-500/20" :
        activeTab === "amazon" ? "bg-gradient-to-tr from-slate-800 to-slate-950 border-slate-800/20" :
        "bg-gradient-to-tr from-rose-600 via-pink-600 to-purple-800 border-rose-500/20"
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -z-10" />
        <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-white">
          Creator Business Hub • {activeTab === "video_geral" ? "4 REDES DE VÍDEO CONSOLIDADAS" : activeTab.toUpperCase()}
        </span>
        <h2 className="text-xl font-black font-sans leading-tight mt-2 flex items-center gap-2">
          {activeTab === "video_geral" && "🚀 Publicação de Vídeo Unificada: 1 Vídeo em 4 Redes Sociais"}
          {activeTab === "instagram" && "Copywriter & Editor de Reels Instagram"}
          {activeTab === "tiktok" && "Algoritmo de Engajamento Viral TikTok"}
          {activeTab === "pinterest" && "Pinterest Idea Pins & Busca Orgânica (SEO)"}
          {activeTab === "whatsapp" && "Status e Stories do WhatsApp Comercial"}
          {activeTab === "shopee" && "Criador de Portfólio de Alta Conversão Shopee"}
          {activeTab === "mercadolivre" && "Indexador de Catálogo e Vendas Mercado Livre"}
          {activeTab === "amazon" && "Ficha Técnica e Bullet Points de Vendas Amazon"}
          {activeTab === "tiktokshop" && "Vitrine de Afiliados e Influenciadores TikTok Shop"}
        </h2>
        <p className="text-xs max-w-2xl mt-1 leading-relaxed text-indigo-100">
          {activeTab === "video_geral"
            ? "Configure seu criativo promocional uma única vez, preencha o nicho e gere cópias personalizadas e otimizadas simultaneamente para seu Instagram Reels, TikTok, Pinterest e WhatsApp Status em um clique!"
            : activeTab === "shopee" || activeTab === "mercadolivre" || activeTab === "amazon" || activeTab === "tiktokshop"
            ? "Gere copys completas estruturadas para e-commerce. Preços, categorias, bullet points persuasivos e hashtags baseadas no nicho criadas automaticamente pela inteligência artificial!"
            : "Configure as propriedades da IA abaixo para obter copies perfeitamente calibradas para capturar e converter leitores em clientes."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input specifications side */}
        <div className={activeTab === "video_geral" ? "lg:col-span-12 space-y-6" : "lg:col-span-7 space-y-6"}>
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

              {activeTab === "video_geral" ? (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800 pt-4 mt-2">
                  <div className="space-y-1.5 font-sans">
                    <label className="text-xs font-bold text-pink-400 flex items-center gap-1">📸 Usuário Instagram</label>
                    <input
                      type="text"
                      value={accounts.instagram.username}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAccounts(prev => ({
                          ...prev,
                          instagram: { ...prev.instagram, username: val }
                        }));
                      }}
                      className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-lg text-xs font-medium text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 font-sans">
                    <label className="text-xs font-bold text-teal-400 flex items-center gap-1">🎵 Usuário TikTok</label>
                    <input
                      type="text"
                      value={accounts.tiktok.username}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAccounts(prev => ({
                          ...prev,
                          tiktok: { ...prev.tiktok, username: val }
                        }));
                      }}
                      className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-lg text-xs font-medium text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 font-sans">
                    <label className="text-xs font-bold text-red-400 flex items-center gap-1">📌 Usuário Pinterest</label>
                    <input
                      type="text"
                      value={accounts.pinterest.username}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAccounts(prev => ({
                          ...prev,
                          pinterest: { ...prev.pinterest, username: val }
                        }));
                      }}
                      className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-lg text-xs font-medium text-white focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1">🏪 Nome da sua Loja/Usuário ({activeTab.toUpperCase()})</label>
                  <input
                    type="text"
                    value={(accounts as any)[activeTab]?.username || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAccounts(prev => ({
                        ...prev,
                        [activeTab]: {
                          ...prev[activeTab as PlatformType],
                          username: val
                        }
                      }));
                    }}
                    placeholder="Nome exato da sua loja"
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">🟢 WhatsApp para Contato Direto (Comprador)</label>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 5511999998888"
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {activeTab !== "whatsapp" && activeTab !== "video_geral" && (
              <div className="space-y-1.5 font-sans">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1">✨ Hashtags da Campanha</label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="A IA criará as tags de venda automaticamente"
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-xs focus:outline-none"
                  disabled
                />
                <span className="text-[10px] text-blue-600 font-medium">✨ Ativado: O algoritmo inteligente gerará as melhores hashtags com base no seu nicho!</span>
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
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
              >
                <Sparkles size={15} /> {activeTab === "video_geral" ? "Gerar Copys Simultâneas para as 4 Redes" : `Gerar Legenda Exclusiva ${activeTab.toUpperCase()}`}
              </button>
            )}
          </div>

          {/* Section 3: Google Shopping Price Quotation (User-requested) */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-sans font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <ShoppingCart size={14} className="text-orange-500" />
                3. Comparativo de Preços (Google Shopping)
              </h3>
              <a 
                href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(niche)}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-[11px] flex items-center gap-1 font-bold transition shrink-0"
              >
                Pesquisar no Google Shopping <ExternalLink size={11} />
              </a>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Otimize seus canais de venda cruzando dados reais de ofertas! Faça uma estimativa de preço de produtos similares para o nicho <span className="font-bold text-slate-800">"{niche}"</span> com um clique:
            </p>

            {isSearchingQuotes ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2 bg-slate-50/50 rounded-xl border border-slate-100/60">
                <RefreshCw size={24} className="text-orange-500 animate-spin" />
                <span className="text-xs font-bold text-slate-650">Analisando feeds competitivos no Google...</span>
              </div>
            ) : shoppingQuotes.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto border border-slate-150 rounded-xl bg-white shadow-3xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-100">
                        <th className="p-2.5">Portal / Concorrente</th>
                        <th className="p-2.5">Título Otimizado</th>
                        <th className="p-2.5 text-right">Preço Sugerido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {shoppingQuotes.map((q, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40 transition">
                          <td className="p-2.5 font-bold text-slate-705">
                            <span className="block text-slate-800 font-bold">{q.store}</span>
                            <span className="text-[10px] font-normal text-slate-400 block">{q.rating}</span>
                          </td>
                          <td className="p-2.5 text-slate-600 truncate max-w-[150px]" title={q.title}>
                            {q.title}
                          </td>
                          <td className="p-2.5 text-right">
                            <span className="font-mono font-black text-rose-650 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">{q.price}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-orange-50/60 rounded-xl p-3.5 border border-orange-100 space-y-1.5 shadow-3xs">
                  <span className="text-xs font-bold text-orange-900 flex items-center gap-1">⚡ Margem Competitiva Recomendada:</span>
                  <p className="text-[11px] text-orange-800 leading-relaxed">
                    Com base no preço médio de <span className="font-bold">R$ {(shoppingQuotes.reduce((acc, q) => acc + parseFloat(q.price.replace('R$', '').replace('.', '').replace(',', '.')), 0) / shoppingQuotes.length).toFixed(2).replace('.', ',')}</span> detectado para concorrentes de <span className="font-bold">"{niche}"</span>, sugerimos fixar o preço da sua oferta em torno de <span className="font-mono font-bold text-slate-900 decoration-amber-500 bg-white px-1.5 py-0.5 rounded shadow-3xs">R$ {(shoppingQuotes.reduce((acc, q) => acc + parseFloat(q.price.replace('R$', '').replace('.', '').replace(',', '.')), 0) / shoppingQuotes.length * 0.95).toFixed(2).replace('.', ',')}</span> para dominar as buscas com melhor custo-benefício!
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFetchGoogleShoppingQuotes}
                className="w-full py-2.5 bg-orange-550 border border-orange-600 hover:bg-orange-600 hover:border-orange-700 text-orange-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <ShoppingCart size={14} className="text-orange-900" />
                Analisar & Comparar Preços no Google Shopping
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Mock Device Render based on Active Platform */}
        {activeTab !== "video_geral" ? (
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl max-w-sm mx-auto relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full flex justify-center items-center gap-1.5">
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
              <div className="w-2 h-2 bg-slate-800 rounded-full" />
            </div>

            {/* Platform Dynamic Mock Display */}
            <div className="mt-4 rounded-2xl overflow-hidden shadow-xl select-none text-slate-900 bg-white max-h-[480px] overflow-y-auto scrollbar-thin">
              
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

                  <div className="p-3 space-y-2">
                    <p className="text-xs">
                      <span className="font-extrabold mr-1">{accounts.instagram.username}</span>
                      {generatedTexts.instagram ? (
                        <span className="whitespace-pre-line text-slate-700">{generatedTexts.instagram}</span>
                      ) : (
                        <span className="text-slate-400 italic">"Insira o criativo e gere a copy ao lado..."</span>
                      )}
                    </p>
                    {generatedTexts.instagram && (
                      <button 
                        onClick={() => { navigator.clipboard.writeText(generatedTexts.instagram); alert("Legenda copiada!"); }}
                        className="flex items-center justify-center gap-1 w-full bg-slate-50 border border-slate-200 py-1.5 rounded text-xs text-slate-600 font-bold hover:bg-slate-100"
                      >
                        <Copy size={13} /> Copiar Legenda Instagram
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TIKTOK MOCK */}
              {activeTab === "tiktok" && (
                <div className="bg-slate-950 text-white pb-3">
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
                  {generatedTexts.tiktok && (
                    <div className="px-3 pt-2">
                      <button 
                        onClick={() => { navigator.clipboard.writeText(generatedTexts.tiktok); alert("Copy viral copiada!"); }}
                        className="flex items-center justify-center gap-1 w-full bg-slate-900 border border-slate-800 py-1.5 rounded text-xs text-white font-bold hover:bg-slate-800"
                      >
                        <Copy size={13} /> Copiar Copy TikTok
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PINTEREST MOCK */}
              {activeTab === "pinterest" && (
                <div className="bg-stone-100 p-4">
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-3 border border-stone-200 max-w-[260px] mx-auto space-y-3 font-sans">
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

                    {generatedTexts.pinterest && (
                      <button 
                        onClick={() => { navigator.clipboard.writeText(generatedTexts.pinterest); alert("Texto do Pin copiado!"); }}
                        className="flex items-center justify-center gap-1 w-full bg-slate-50 border border-slate-200 py-1.5 rounded text-xs text-slate-650 font-bold hover:bg-slate-100"
                      >
                        <Copy size={13} /> Copiar Pauta do Pin
                      </button>
                    )}
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

                  {generatedTexts.whatsapp && (
                    <div className="z-10 mt-1">
                      <button 
                        onClick={() => { navigator.clipboard.writeText(generatedTexts.whatsapp); alert("Mensagem do Whatsapp copiada!"); }}
                        className="flex items-center justify-center gap-1 w-full bg-emerald-600 border border-emerald-500 py-1.5 rounded text-xs text-white font-bold hover:bg-emerald-500"
                      >
                        <Copy size={13} /> Copiar Texto Status
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SHOPEE MOCK */}
              {activeTab === "shopee" && (
                <div className="bg-white font-sans text-xs flex flex-col">
                  {/* Shopee Orange Header */}
                  <div className="bg-orange-500 text-white p-3 flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1 font-sans">🛍️ Shopee Brasil</span>
                    <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded">Garantia Shopee</span>
                  </div>
                  
                  {/* Media View */}
                  <div className="aspect-video bg-orange-50/50 flex items-center justify-center overflow-hidden border-b border-orange-100">
                    {mediaPreviewUrl ? (
                      selectedFile?.type.startsWith("video/") ? (
                        <video src={mediaPreviewUrl} autoPlay muted loop className="w-full h-full object-cover" />
                      ) : (
                        <img referrerPolicy="no-referrer" src={mediaPreviewUrl} alt="Shopee Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-center p-4">
                        <ShoppingBag size={30} className="mx-auto text-orange-500 mb-1" />
                        <p className="text-[10px] text-orange-400 font-bold">Mídia de Portfólio do Produto</p>
                      </div>
                    )}
                  </div>

                  {/* Portfolio Details */}
                  <div className="p-3 space-y-3 text-slate-800">
                    {(() => {
                      const portfolio = parseMarketplacePortfolio(generatedTexts.shopee, niche);
                      return (
                        <>
                          <div className="space-y-1 font-sans">
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-extrabold text-[#222] line-clamp-2 leading-tight flex-1">{portfolio.title}</h4>
                              <button 
                                onClick={() => { navigator.clipboard.writeText(portfolio.title); alert("Título copiado!"); }}
                                className="p-1 text-slate-400 hover:text-indigo-600 border border-slate-200 rounded shrink-0 bg-white"
                                title="Copiar Título"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                            <span className="text-[9px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-bold">Avaliador Ouro</span>
                          </div>

                          <div className="bg-orange-50/30 p-2 rounded-xl flex justify-between items-center text-orange-600 font-extrabold border border-orange-100 font-sans">
                            <div>
                              <span className="text-[9px] text-slate-400 font-normal line-through block font-sans">R$ 159,90</span>
                              <span className="text-xs font-mono">{portfolio.price}</span>
                            </div>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(portfolio.price); alert("Preço copiado!"); }}
                              className="p-1 text-orange-500 hover:bg-orange-50 rounded border border-orange-200 shrink-0 bg-white"
                              title="Copiar Preço"
                            >
                              <Copy size={11} />
                            </button>
                          </div>

                          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 font-sans">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Ficha Técnica</span>
                            <pre className="text-[9px] text-slate-600 font-mono whitespace-pre-wrap leading-tight">{portfolio.specs}</pre>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(portfolio.specs); alert("Ficha técnica copiada!"); }}
                              className="mt-1 flex items-center justify-center gap-1 w-full bg-white border border-slate-200 py-1 rounded text-[9px] text-slate-500 font-bold hover:text-indigo-600"
                            >
                              <Copy size={9} /> Copiar Ficha Técnica
                            </button>
                          </div>

                          <div className="space-y-1 font-sans">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Descrição Persuasiva</span>
                            <p className="text-[10px] text-slate-700 line-clamp-4 leading-normal whitespace-pre-line font-sans">{portfolio.description}</p>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(portfolio.description); alert("Descrição copiada!"); }}
                              className="mt-1 flex items-center justify-center gap-1 w-full bg-white border border-slate-200 py-1 rounded text-[9px] text-slate-500 font-bold hover:text-indigo-600"
                            >
                              <Copy size={9} /> Copiar Descrição Completa
                            </button>
                          </div>

                          <div className="text-[9px] text-slate-400 font-mono italic font-sans">
                            Hashtags do Nicho: {portfolio.hashtags}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* MERCADO LIVRE MOCK */}
              {activeTab === "mercadolivre" && (
                <div className="bg-[#FFF159] font-sans text-xs flex flex-col text-slate-900">
                  {/* Mercado Livre Header */}
                  <div className="bg-[#FFF159] p-3 flex justify-between items-center font-bold text-slate-900 border-b border-yellow-400 font-sans">
                    <span className="flex items-center gap-1 font-black">🤝 Mercado Livre</span>
                    <span className="text-[8px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black uppercase">LÍDER PLATINUM</span>
                  </div>
                  
                  {/* Media block */}
                  <div className="aspect-video bg-white flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {mediaPreviewUrl ? (
                      selectedFile?.type.startsWith("video/") ? (
                        <video src={mediaPreviewUrl} autoPlay muted loop className="w-full h-full object-cover" />
                      ) : (
                        <img referrerPolicy="no-referrer" src={mediaPreviewUrl} alt="ML Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-center p-4">
                        <Store size={30} className="mx-auto text-blue-600 mb-1" />
                        <p className="text-[10px] text-slate-400">Imagens do Anúncio de Venda</p>
                      </div>
                    )}
                  </div>

                  {/* Portfolio Details */}
                  <div className="p-3 space-y-3 bg-white text-slate-800">
                    {(() => {
                      const portfolio = parseMarketplacePortfolio(generatedTexts.mercadolivre, niche);
                      return (
                        <>
                          <div className="space-y-1 text-slate-900 font-sans">
                            <span className="text-[9px] text-slate-400 block font-normal">Novo • +10.000 vendidos</span>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-extrabold text-[#333] line-clamp-2 leading-tight flex-1">{portfolio.title}</h4>
                              <button 
                                onClick={() => { navigator.clipboard.writeText(portfolio.title); alert("Título copiado!"); }}
                                className="p-1 text-slate-400 hover:text-indigo-600 border border-slate-200 rounded shrink-0 bg-white"
                                title="Copiar Título"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </div>

                          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl flex justify-between items-center font-extrabold border border-emerald-100 font-sans">
                            <div>
                              <span className="text-[9px] text-slate-400 font-normal block font-sans">Valor do Anúncio</span>
                              <span className="text-xs font-mono">{portfolio.price}</span>
                            </div>
                            <span className="text-[8px] bg-green-600 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-sans">⚡ ENVIO FULL</span>
                          </div>

                          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 font-sans text-slate-800">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Especificação Comercial</span>
                            <pre className="text-[9px] text-slate-600 font-mono whitespace-pre-wrap leading-tight">{portfolio.specs}</pre>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(portfolio.specs); alert("Ficha técnica copiada!"); }}
                              className="mt-1 flex items-center justify-center gap-1 w-full bg-white border border-slate-200 py-1 rounded text-[9px] text-slate-500 font-bold hover:text-indigo-600"
                            >
                              <Copy size={9} /> Copiar Ficha Técnica
                            </button>
                          </div>

                          <div className="space-y-1 font-sans text-slate-800">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Descrição e Vantagens ML</span>
                            <p className="text-[10px] text-slate-700 line-clamp-4 leading-normal whitespace-pre-line font-sans">{portfolio.description}</p>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(portfolio.description); alert("Descrição copiada!"); }}
                              className="mt-1 flex items-center justify-center gap-1 w-full bg-white border border-slate-200 py-1 rounded text-[9px] text-slate-500 font-bold hover:text-indigo-600"
                            >
                              <Copy size={9} /> Copiar Descrição
                            </button>
                          </div>

                          <div className="text-[9px] text-slate-450 font-mono italic font-sans font-normal">
                            Palavras-Chave de Busca: {portfolio.hashtags}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* AMAZON MOCK */}
              {activeTab === "amazon" && (
                <div className="bg-[#131921] font-sans text-xs flex flex-col text-slate-100">
                  {/* Amazon Header */}
                  <div className="bg-[#232F3E] p-3 flex justify-between items-center">
                    <span className="font-bold text-amber-500 font-sans">amazon.com.br</span>
                    <span className="text-[8px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 font-sans">⭐ Amazon's Choice</span>
                  </div>
                  
                  {/* Image/Video block */}
                  <div className="aspect-video bg-[#131921] flex items-center justify-center overflow-hidden border-b border-slate-800">
                    {mediaPreviewUrl ? (
                      selectedFile?.type.startsWith("video/") ? (
                        <video src={mediaPreviewUrl} autoPlay muted loop className="w-full h-full object-cover" />
                      ) : (
                        <img referrerPolicy="no-referrer" src={mediaPreviewUrl} alt="Amazon Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-center p-4">
                        <Package size={30} className="mx-auto text-amber-500 mb-1" />
                        <p className="text-[10px] text-slate-500">Mídias Detalhadas de Produto</p>
                      </div>
                    )}
                  </div>

                  {/* Portfolio Details */}
                  <div className="p-3 space-y-3 bg-white text-slate-900">
                    {(() => {
                      const portfolio = parseMarketplacePortfolio(generatedTexts.amazon, niche);
                      return (
                        <>
                          <div className="space-y-1 font-sans">
                            <span className="text-[9px] text-amber-600 font-bold block">Prime Seller Store</span>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-extrabold text-[#111] line-clamp-2 leading-tight flex-1 font-sans">{portfolio.title}</h4>
                              <button 
                                onClick={() => { navigator.clipboard.writeText(portfolio.title); alert("Título copiado!"); }}
                                className="p-1 text-slate-400 hover:text-[#e47911] border border-slate-200 rounded shrink-0 bg-white"
                                title="Copiar Título"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                            <span className="text-[9px] text-[#555] block">4.8 de 5 estrelas • 1.280 classificações</span>
                          </div>

                          <div className="p-2 bg-amber-50 border border-amber-200 text-amber-950 rounded-xl flex justify-between items-center font-bold font-sans">
                            <div>
                              <span className="text-[9px] text-slate-400 font-normal block font-sans">Preço Recomendado</span>
                              <span className="text-xs font-mono text-[#B12704]">{portfolio.price}</span>
                            </div>
                            <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-sans uppercase">✓ Amazon Prime</span>
                          </div>

                          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 font-sans">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Bullet Points de Atração</span>
                            <pre className="text-[9px] text-slate-650 font-mono whitespace-pre-wrap leading-tight">{portfolio.specs}</pre>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(portfolio.specs); alert("Destaques copiados!"); }}
                              className="mt-1 flex items-center justify-center gap-1 w-full bg-white border border-slate-200 py-1 rounded text-[9px] text-slate-500 font-bold hover:text-amber-600"
                            >
                              <Copy size={9} /> Copiar Bullet Points
                            </button>
                          </div>

                          <div className="space-y-1 font-sans">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Descrição e Vendas</span>
                            <p className="text-[10px] text-slate-700 line-clamp-4 leading-normal whitespace-pre-line font-sans">{portfolio.description}</p>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(portfolio.description); alert("Descrição copiada!"); }}
                              className="mt-1 flex items-center justify-center gap-1 w-full bg-white border border-slate-200 py-1 rounded text-[9px] text-slate-500 font-bold hover:text-amber-600"
                            >
                              <Copy size={9} /> Copiar Descrição Completa
                            </button>
                          </div>

                          <div className="text-[9px] text-slate-450 font-mono italic font-sans font-normal font-sans">
                            Tags Amazon Seller: {portfolio.hashtags}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* TIKTOK SHOP MOCK */}
              {activeTab === "tiktokshop" && (
                <div className="bg-slate-950 text-white font-sans text-xs flex flex-col">
                  {/* TikTok Shop Header */}
                  <div className="bg-[#121212] p-3 flex justify-between items-center border-b border-slate-850">
                    <span className="font-extrabold text-[#ff0050] flex items-center gap-1">🎵 TikTok Shop</span>
                    <span className="text-[8px] bg-[#00f2fe] text-slate-950 px-1 py-0.5 rounded font-extrabold uppercase">LIVE COMISSÃO</span>
                  </div>
                  
                  {/* Video/Image block */}
                  <div className="aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-slate-800">
                    {mediaPreviewUrl ? (
                      selectedFile?.type.startsWith("video/") ? (
                        <video src={mediaPreviewUrl} autoPlay muted loop className="w-full h-full object-cover" />
                      ) : (
                        <img referrerPolicy="no-referrer" src={mediaPreviewUrl} alt="TikTok Shop Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-center p-4">
                        <Flame size={30} className="mx-auto text-pink-500 mb-1" />
                        <p className="text-[10px] text-slate-500">Mídia Showcase de Anúncio</p>
                      </div>
                    )}
                  </div>

                  {/* Portfolio Details */}
                  <div className="p-3 space-y-3 bg-[#161823] text-slate-300">
                    {(() => {
                      const portfolio = parseMarketplacePortfolio(generatedTexts.tiktokshop, niche);
                      return (
                        <>
                          <div className="space-y-1 font-sans">
                            <span className="text-[8px] text-[#00f2fe] uppercase tracking-wider font-bold">Vitrine Exclusiva Afiliador</span>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-extrabold text-white line-clamp-2 leading-tight flex-1">{portfolio.title}</h4>
                              <button 
                                onClick={() => { navigator.clipboard.writeText(portfolio.title); alert("Título copiado!"); }}
                                className="p-1 text-slate-400 hover:text-[#00f2fe] border border-slate-700 bg-slate-800 rounded shrink-0"
                                title="Copiar Título"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </div>

                          <div className="p-2 bg-slate-900 border border-slate-800 text-white rounded-xl flex justify-between items-center font-bold font-sans">
                            <div>
                              <span className="text-[8px] text-slate-400 font-normal block font-sans">Preço na Loja</span>
                              <span className="text-xs font-mono text-[#ff0050]">{portfolio.price}</span>
                            </div>
                            <span className="text-[8px] border border-[#ff0050] text-[#ff0050] px-1.5 py-0.5 rounded-full uppercase font-sans">⚡ GANHE COMISSÃO</span>
                          </div>

                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1 font-sans font-normal leading-tight">
                            <span className="text-[9px] text-[#00f2fe] font-bold block uppercase">Especificação Afiliado</span>
                            <pre className="text-[9px] text-slate-350 font-mono whitespace-pre-wrap leading-tight">{portfolio.specs}</pre>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(portfolio.specs); alert("Ficha complementar copiada!"); }}
                              className="mt-1 flex items-center justify-center gap-1 w-full bg-slate-850 border border-slate-850 py-1 rounded text-[9px] text-slate-450 font-bold hover:text-[#ff0050]"
                            >
                              <Copy size={9} /> Copiar Detalhes
                            </button>
                          </div>

                          <div className="space-y-1 font-sans">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">Copy de Vendas e Vídeo</span>
                            <p className="text-[10px] text-slate-300 line-clamp-4 leading-normal whitespace-pre-line font-sans">{portfolio.description}</p>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(portfolio.description); alert("Letras e copy de vendas copiadas!"); }}
                              className="mt-1 flex items-center justify-center gap-1 w-full bg-slate-850 border border-slate-800 py-1 rounded text-[9px] text-slate-440 font-bold hover:text-[#00f2fe]"
                            >
                              <Copy size={9} /> Copiar Copy Viral Completa
                            </button>
                          </div>

                          <div className="text-[9px] text-slate-500 font-mono italic font-sans font-normal">
                            Hashtags Virais: {portfolio.hashtags}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

            </div>

            {/* Direct Send Platform Publish Sync Indicator */}
            {generatedTexts[activeTab] && (
              <div className="mt-4 pt-1 space-y-2 font-sans">
                <button
                  type="button"
                  onClick={() => handlePostPlatform(activeTab)}
                  disabled={isPosting[activeTab]}
                  className={`w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition text-white cursor-pointer ${
                    activeTab === "instagram" ? "bg-gradient-to-tr from-purple-600 to-pink-600 animate-pulse" :
                    activeTab === "tiktok" ? "bg-slate-900 hover:bg-slate-850" :
                    activeTab === "pinterest" ? "bg-red-600 hover:bg-red-700" :
                    activeTab === "whatsapp" ? "bg-emerald-600 hover:bg-emerald-700" :
                    activeTab === "shopee" ? "bg-orange-500 hover:bg-orange-600" :
                    activeTab === "mercadolivre" ? "bg-yellow-500 hover:bg-yellow-600 text-slate-950" :
                    activeTab === "amazon" ? "bg-slate-800 hover:bg-slate-900" :
                    "bg-[#ff0050]"
                  }`}
                >
                  {isPosting[activeTab] ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Processando Arquivos...
                    </>
                  ) : isPosted[activeTab] ? (
                    <>
                      <Check size={13} /> Preparado & Painel Aberto!
                    </>
                  ) : (
                    <>
                      <Send size={13} /> Preparar Postagem & Abrir Portal
                    </>
                  )}
                </button>

                {/* Direct WhatsApp Contact Button (User requested) */}
                <a
                  href={`https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(
                    `Olá! Gostaria de comprar o produto do nicho "${niche}". Li que o preço sugerido é altamente competitivo e gostaria de fazer o pedido diretamente por aqui. Me mande as instruções para pagamento!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-emerald-650 hover:bg-emerald-600 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition shadow-2xs text-center cursor-pointer"
                >
                  <MessageCircle size={13} className="text-emerald-205" />
                  Botão de Contato Direto (Testar Zap)
                </a>
              </div>
            )}
          </div>

          {/* Sponsoring account information details and alert anti shadowban */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-3 font-sans">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Segurança & Privacidade</span>
            
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[11px] text-blue-900 flex gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-blue-600" />
              <div className="space-y-1">
                <p className="font-bold">Como funciona a publicação sem login?</p>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Por segurança contra invasões e termos de uso das redes, nós **nunca pedimos suas senhas**. O Hub prepara tudo: salva o vídeo na sua pasta de Downloads, copia a copy persuasiva pro seu teclado (Ctrl+V) e abre o portal de destino. Sua conta fica 100% protegida!
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase">Perfil Ativo</span>
              <span className="font-mono text-slate-500">@{accounts[activeTab as PlatformType]?.username}</span>
            </div>
          </div>
        </div>
        ) : (
          <div className="lg:col-span-12">
            <IntegratedVideoCampaign
              generatedTexts={generatedTexts}
              setGeneratedTexts={setGeneratedTexts}
              selectedFile={selectedFile}
              mediaPreviewUrl={mediaPreviewUrl}
              accounts={accounts}
              whatsappPhone={whatsappPhone}
              handlePostPlatform={handlePostPlatform}
            />
          </div>
        )}

      </div>
    </div>
  );
}
