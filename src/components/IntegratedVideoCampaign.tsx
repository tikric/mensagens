import React from "react";
import { Sparkles, Copy, Video, Send, Instagram, Flame, Pin, MessageCircle, Check } from "lucide-react";

interface IntegratedVideoCampaignProps {
  generatedTexts: {
    instagram: string;
    tiktok: string;
    pinterest: string;
    whatsapp: string;
    [key: string]: string;
  };
  setGeneratedTexts: React.Dispatch<
    React.SetStateAction<{
      instagram: string;
      tiktok: string;
      pinterest: string;
      whatsapp: string;
      shopee: string;
      mercadolivre: string;
      amazon: string;
      tiktokshop: string;
    }>
  >;
  selectedFile: File | null;
  mediaPreviewUrl: string | null;
  accounts: {
    instagram: { username: string };
    tiktok: { username: string };
    pinterest: { username: string };
  };
  whatsappPhone: string;
  handlePostPlatform: (platform: any) => void;
}

export default function IntegratedVideoCampaign({
  generatedTexts,
  setGeneratedTexts,
  selectedFile,
  mediaPreviewUrl,
  accounts,
  whatsappPhone,
  handlePostPlatform
}: IntegratedVideoCampaignProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <h3 className="text-base font-sans font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={18} className="text-pink-500 animate-pulse" />
            📋 Copys Persuasivas para as 4 Redes Sociais
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Revisados de forma integrada e coordenados para disparar em lote nas 4 redes selecionadas!
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`
📷 INSTAGRAM:
${generatedTexts.instagram}

🎵 TIKTOK:
${generatedTexts.tiktok}

📌 PINTEREST:
${generatedTexts.pinterest}

💬 WHATSAPP STATUS:
${generatedTexts.whatsapp}
              `.trim());
              alert("Todas as 4 copies foram copiadas de uma vez para sua área de transferência!");
            }}
            className="py-2 px-3 bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition rounded-xl text-xs font-bold cursor-pointer"
          >
            <Copy size={13} className="inline mr-1" /> Copiar Todas as 4 Copys
          </button>
          {mediaPreviewUrl && (
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = mediaPreviewUrl;
                link.download = `criativo_${selectedFile?.name || "midia.mp4"}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                alert("Criativo de vídeo baixado com sucesso!");
              }}
              className="py-2 px-3 bg-slate-950 border border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white transition rounded-xl text-xs font-bold cursor-pointer"
            >
              <Video size={13} className="inline mr-1" /> Baixar Vídeo Geral
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card Instagram */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-pink-500/10 hover:border-pink-500/30 relative flex flex-col justify-between min-h-[350px] transition duration-300 shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                <Instagram size={14} className="text-pink-500" /> Instagram Reels
              </span>
              <span className="text-[10px] text-slate-500 font-mono">@{accounts.instagram.username}</span>
            </div>
            <textarea
              rows={8}
              value={generatedTexts.instagram}
              onChange={(e) => setGeneratedTexts(prev => ({ ...prev, instagram: e.target.value }))}
              placeholder="Aguardando geração da copy unificada..."
              className="w-full bg-slate-950 text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-pink-550 scrollbar-thin text-slate-300"
            />
          </div>
          <div className="space-y-1 mt-3">
            <button
              onClick={() => handlePostPlatform("instagram")}
              className="w-full py-2 bg-gradient-to-tr from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Send size={12} /> Postar no IG
            </button>
            <p className="text-[9px] text-slate-500 font-sans text-center leading-tight">Deixa a copy no ctrl+v e baixa o vídeo</p>
          </div>
        </div>

        {/* Card TikTok */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-teal-500/10 hover:border-teal-500/30 relative flex flex-col justify-between min-h-[350px] transition duration-300 shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                <Flame size={14} className="text-teal-400" /> TikTok Viral
              </span>
              <span className="text-[10px] text-slate-500 font-mono">@{accounts.tiktok.username}</span>
            </div>
            <textarea
              rows={8}
              value={generatedTexts.tiktok}
              onChange={(e) => setGeneratedTexts(prev => ({ ...prev, tiktok: e.target.value }))}
              placeholder="Aguardando geração da copy unificada..."
              className="w-full bg-slate-950 text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-teal-500 scrollbar-thin text-slate-300"
            />
          </div>
          <div className="space-y-1 mt-3">
            <button
              onClick={() => handlePostPlatform("tiktok")}
              className="w-full py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Send size={12} /> Postar no TikTok
            </button>
            <p className="text-[9px] text-slate-500 font-sans text-center leading-tight">Ganchos otimizados por SEO</p>
          </div>
        </div>

        {/* Card Pinterest */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-red-500/10 hover:border-red-500/30 relative flex flex-col justify-between min-h-[350px] transition duration-300 shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <Pin size={14} className="text-red-500" /> Pinterest Pins
              </span>
              <span className="text-[10px] text-slate-500 font-mono">@{accounts.pinterest.username}</span>
            </div>
            <textarea
              rows={8}
              value={generatedTexts.pinterest}
              onChange={(e) => setGeneratedTexts(prev => ({ ...prev, pinterest: e.target.value }))}
              placeholder="Aguardando geração da copy unificada..."
              className="w-full bg-slate-950 text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-red-500 scrollbar-thin text-slate-300"
            />
          </div>
          <div className="space-y-1 mt-3">
            <button
              onClick={() => handlePostPlatform("pinterest")}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Send size={12} /> Criar Pin
            </button>
            <p className="text-[9px] text-slate-500 font-sans text-center leading-tight">Descrição e SEO ricos</p>
          </div>
        </div>

        {/* Card WhatsApp */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 relative flex flex-col justify-between min-h-[350px] transition duration-300 shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <MessageCircle size={14} className="text-emerald-500" /> WhatsApp Status
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Minha Lista</span>
            </div>
            <textarea
              rows={8}
              value={generatedTexts.whatsapp}
              onChange={(e) => setGeneratedTexts(prev => ({ ...prev, whatsapp: e.target.value }))}
              placeholder="Aguardando geração da copy unificada..."
              className="w-full bg-slate-950 text-xs border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-emerald-555 scrollbar-thin text-slate-300"
            />
          </div>
          <div className="space-y-1 mt-3">
            <button
              onClick={() => handlePostPlatform("whatsapp")}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Send size={12} /> Postar no Status
            </button>
            <p className="text-[9px] text-slate-500 font-sans text-center leading-tight">Chamada persuasiva rápida</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-2 text-slate-300">
        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">🔒 Anti-Block Inteligente & Segurança Total</span>
        <p className="text-xs leading-relaxed text-slate-405">
          Ao acionar as postagens individuais, a copy correspondente é salva automaticamente na sua área de transferência e o painel de publicações oficial do respectivo canal é aberto. Desta forma, o seu perfil não corre risco de punição por uso de APIs robóticas, respeitando as diretrizes anti-spam.
        </p>
      </div>
    </div>
  );
}
