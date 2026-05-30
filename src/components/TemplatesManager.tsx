import React, { useState } from "react";
import { MessageTemplate } from "../types";
import { Plus, Trash2, Calendar, Sparkles, AlertCircle, RefreshCw, X, Tag, FileText } from "lucide-react";

interface TemplatesManagerProps {
  templates: MessageTemplate[];
  onAddTemplate: (tpl: Omit<MessageTemplate, "id" | "createdAt">) => void;
  onUpdateTemplate: (tpl: MessageTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export default function TemplatesManager({ templates, onAddTemplate, onUpdateTemplate, onDeleteTemplate }: TemplatesManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<MessageTemplate | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [variations, setVariations] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState("");

  const [aiProvider, setAiProvider] = useState<"gemini" | "groq">(() => {
    return (localStorage.getItem("fb_ai_provider") as "gemini" | "groq") || "gemini";
  });
  const [groqKey, setGroqKey] = useState(() => {
    return localStorage.getItem("fb_groq_key") || "";
  });

  React.useEffect(() => {
    localStorage.setItem("fb_ai_provider", aiProvider);
  }, [aiProvider]);

  React.useEffect(() => {
    localStorage.setItem("fb_groq_key", groqKey);
  }, [groqKey]);

  const handleGenerateVariations = async () => {
    if (!text.trim()) {
      setAiError("Por favor, digite o texto da mensagem base antes de solicitar à Inteligência Artificial.");
      return;
    }

    setIsLoadingAi(true);
    setAiError("");

    try {
      if (aiProvider === "gemini") {
        const response = await fetch("/api/gemini/generate-variations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: text }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Erro ao conectar com a API do Gemini. Verifique as credenciais.");
        }

        if (data.variations && Array.isArray(data.variations)) {
          setVariations(data.variations);
        } else {
          throw new Error("Resposta inválida recebida da IA.");
        }
      } else {
        // Groq API Call directly from frontend (CORS-friendly, perfect for standalone APK!)
        if (!groqKey.trim()) {
          throw new Error("Para usar a Groq Externa, por favor insira sua API Key da Groq no campo abaixo.");
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
              {
                role: "system",
                content: `Você é um especialista em marketing em mídias sociais brasileira. Reescreva a mensagem a seguir de 5 formas alternativas e persuasivas originais para evitar bloqueios de spam do Facebook. 
Regras:
1. Preserve exatamente todos os links e e-mails se houver.
2. Não use explicações ou comentários. Responda APENAS no formato array JSON com 5 strings. Exemplo: ["variacao 1", "variacao 2", "variacao 3", "variacao 4", "variacao 5"]`
              },
              {
                role: "user",
                content: text
              }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || "Erro retornado da API da Groq. Remova espaços ou verifique o saldo.");
        }

        const responseContent = data.choices?.[0]?.message?.content;
        if (!responseContent) {
          throw new Error("Não foi possível extrair a variação da resposta.");
        }

        let parsed: any;
        try {
          parsed = JSON.parse(responseContent);
          if (parsed && !Array.isArray(parsed) && typeof parsed === "object") {
            const possibleArray = Object.values(parsed).find(Array.isArray);
            if (possibleArray) parsed = possibleArray;
          }
        } catch {
          const cleanText = responseContent.replace(/```json/g, "").replace(/```/g, "").trim();
          parsed = JSON.parse(cleanText);
        }

        if (Array.isArray(parsed)) {
          setVariations(parsed.slice(0, 5));
        } else {
          throw new Error("Formato de resposta retornado pela Groq inválido. Tente novamente.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Não foi possível conectar com o provedor selecionado.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editTemplate) {
      onUpdateTemplate({
        ...editTemplate,
        title,
        text,
        variations,
        tags: parsedTags,
      });
      setEditTemplate(null);
    } else {
      onAddTemplate({
        title,
        text,
        variations,
        tags: parsedTags,
      });
    }

    // Reset Form
    setTitle("");
    setText("");
    setVariations([]);
    setTagsInput("");
    setIsFormOpen(false);
  };

  const startEdit = (tpl: MessageTemplate) => {
    setEditTemplate(tpl);
    setTitle(tpl.title);
    setText(tpl.text);
    setVariations(tpl.variations || []);
    setTagsInput(tpl.tags.join(", "));
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setEditTemplate(null);
    setTitle("");
    setText("");
    setVariations([]);
    setTagsInput("");
    setAiError("");
    setIsFormOpen(false);
  };

  const removeVariationIndex = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const editVariationText = (index: number, newTxt: string) => {
    const updated = [...variations];
    updated[index] = newTxt;
    setVariations(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">
          Crie modelos de mensagens para usar no revezamento diário de postagens nos grupos.
        </p>
        <button
          onClick={() => {
            setEditTemplate(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition"
        >
          <Plus size={16} /> Criar Modelo
        </button>
      </div>

      {/* Form Card */}
      {isFormOpen && (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl relative animate-fadeIn space-y-4">
          <button 
            onClick={handleCancel}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
          
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {editTemplate ? "✏️ Editar Modelo de Mensagem" : "➕ Criar Novo Modelo de Mensagem"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Título de Identificação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Divulgação Mentoria SP"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 font-sans">Palavras-chave / Tags (Separe por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Vaga, Freelance, Promoção"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600">Mensagem Base Original</label>
                <span className="text-[10px] text-slate-400">Total de caracteres: {text.length}</span>
              </div>
              <textarea
                required
                rows={4}
                placeholder="Insira aqui o texto e links que deseja divulgar..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            {/* AI Generator Integration Panel */}
            <div className="p-4 bg-radial from-slate-900 to-black rounded-xl border border-slate-800 text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-sans">
                    <Sparkles size={14} className="text-blue-400 animate-pulse" />
                    Contingência Anti-Spam Inteligente
                  </h4>
                  <p className="text-[10px] text-slate-300">
                    Reescreva as mensagens de posts do dia para burlar a detecção de assinaturas idênticas.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value as "gemini" | "groq")}
                    className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-200 focus:outline-none"
                  >
                    <option value="gemini">Gemini (Embutido / Cloud)</option>
                    <option value="groq">Groq Cloud API (Chave Externa)</option>
                  </select>

                  <button
                    type="button"
                    disabled={isLoadingAi}
                    onClick={handleGenerateVariations}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {isLoadingAi ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" /> Processando...
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} /> Gerar 5 Opções
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Se escolher Groq, exibe o campo da chave de API */}
              {aiProvider === "groq" && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-300">
                    <span className="font-bold flex items-center gap-1 font-sans">🔑 Inserir API Key da Groq</span>
                    <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-blue-400 underline hover:text-blue-300">Obter chave grátis ↗</a>
                  </div>
                  <input
                    type="password"
                    placeholder="gsk_XXXXXXXXXXXXXXXXXXXXXXXX"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-700"
                  />
                  <p className="text-[9px] text-slate-400 leading-normal">
                    A API da Groq é ideal e recomendada para respostas instantâneas "client-to-cloud" com altíssima velocidade.
                  </p>
                </div>
              )}

              {aiError && (
                <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg flex items-start gap-2 text-xs text-red-200">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Variations listing */}
              {variations.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Variações geradas pela IA ({variations.length}/5):
                  </span>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {variations.map((v, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2 relative group">
                        <span className="text-[10px] font-mono font-bold text-blue-500 mt-1">v{idx+1}</span>
                        <textarea
                          rows={2}
                          value={v}
                          onChange={(e) => editVariationText(idx, e.target.value)}
                          className="flex-1 text-xs bg-transparent border-0 text-slate-200 focus:ring-0 p-0 resize-none focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariationIndex(idx)}
                          className="text-slate-500 hover:text-red-400"
                          title="Remover variação"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-100 font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                {editTemplate ? "Salvar Modelo" : "Salvar Modelo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 gap-4">
        {templates.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
            <p className="text-slate-400 font-medium text-sm">Nenhum modelo de mensagem cadastrado.</p>
            <p className="text-slate-300 text-xs">Aperte no botão \"Criar Modelo\" para começar.</p>
          </div>
        ) : (
          templates.map((tpl) => (
            <div 
              key={tpl.id} 
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-3xs hover:border-slate-200 transition"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-50">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText size={16} className="text-slate-500" />
                    {tpl.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tpl.tags.map((tg, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded-md flex items-center gap-0.5">
                        <Tag size={8} /> {tg}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-400 inline-flex items-center gap-1 ml-1 font-mono">
                      <Calendar size={10} /> Criado em {tpl.createdAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    tpl.variations?.length > 0 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}>
                    {tpl.variations?.length > 0 
                      ? `${tpl.variations.length} Variações Anti-Spam IA` 
                      : "Sem Variações de IA (Recomendado Gerar)"}
                  </span>
                  <button
                    onClick={() => startEdit(tpl)}
                    className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg text-xs hover:bg-slate-50 font-medium transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir o modelo de mensagem "${tpl.title}"?`)) {
                        onDeleteTemplate(tpl.id);
                      }
                    }}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                {/* Regular Text preview */}
                <div className="lg:col-span-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mensagem Principal:</span>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap font-sans">
                    {tpl.text}
                  </div>
                </div>

                {/* IA Variations counts / previews */}
                <div className="lg:col-span-1 space-y-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Rodízio Inteligente:</span>
                    {tpl.variations && tpl.variations.length > 0 ? (
                      <div className="text-xs text-slate-500 space-y-1 bg-blue-50/30 p-3 rounded-xl border border-blue-100/50">
                        <p className="font-bold text-blue-900 leading-snug">Variações Geradas por IA Ativas</p>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          O sistema alternará entre estas variações nos envios do dia para que cada grupo do Facebook receba uma mensagem única.
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 space-y-1 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                        <p className="font-bold text-amber-900 leading-snug">Risco de Bloqueio Alto</p>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Por favor, edite este modelo e clique em <strong>Gerar Variações</strong> para criar versões anti-spam inteligentes.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
