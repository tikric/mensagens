import { useState } from "react";
import { FacebookGroup, MessageTemplate, ScheduleCampaign, DispatchJob, DispatchLog } from "../types";
import { Play, Square, RefreshCw, Copy, Check, ExternalLink, Settings, ShieldAlert, Sparkles, Send, Info } from "lucide-react";

interface SenderAssistantProps {
  groups: FacebookGroup[];
  templates: MessageTemplate[];
  campaign: ScheduleCampaign;
  onUpdateCampaign: (campaign: ScheduleCampaign) => void;
  onUpdateGroups: (groups: FacebookGroup[]) => void;
  onAddLog: (log: DispatchLog) => void;
}

export default function SenderAssistant({
  groups,
  templates,
  campaign,
  onUpdateCampaign,
  onUpdateGroups,
  onAddLog,
}: SenderAssistantProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || "");
  const [jobs, setJobs] = useState<DispatchJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"assistant" | "queue" | "settings">("assistant");

  // Selection of template
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Initialize or generate the dispatch list for today
  const handleGenerateJobs = () => {
    if (!currentTemplate) {
      alert("Por favor, crie um modelo de mensagem antes na aba correspondente.");
      return;
    }

    const activeGroups = groups.filter((g) => g.active);
    if (activeGroups.length === 0) {
      alert("Nenhum grupo ativo cadastrado. Vá até a aba 'Grupos do Facebook' e ative pelo menos um.");
      return;
    }

    // Determine messages rotation
    const newJobs: DispatchJob[] = activeGroups.map((group, index) => {
      // Pick a variation based on index, or use base text if no variations
      let textToUse = currentTemplate.text;
      if (campaign.useAiVariations && currentTemplate.variations && currentTemplate.variations.length > 0) {
        const varIdx = index % currentTemplate.variations.length;
        textToUse = currentTemplate.variations[varIdx];
      }

      // Check if group already reached its quota
      let status: DispatchJob["status"] = "pending";
      let errorMsg = undefined;
      if (group.postsCountToday >= group.dailyLimit) {
        status = "failed";
        errorMsg = `Cancelado: Limite diário de (${group.dailyLimit}) atingido.`;
      }

      // Calculate a scheduled simulated time offset based on index and interval
      const now = new Date();
      const minutesToAdd = index * campaign.intervalMinutes;
      now.setMinutes(now.getMinutes() + minutesToAdd);
      const scheduledTime = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      return {
        id: `job-${group.id}-${Date.now()}-${index}`,
        groupId: group.id,
        groupName: group.name,
        groupUrl: group.url,
        messageText: textToUse,
        scheduledTime,
        status,
        isManual: true,
        error: errorMsg,
      };
    });

    setJobs(newJobs);
    
    onAddLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      type: "info",
      groupName: "Fila de Postagem",
      messageSnippet: currentTemplate.title,
      details: `Fila de disparos gerada com sucesso para ${activeGroups.length} grupos ativos. Intervalo: ${campaign.intervalMinutes} min.`,
    });
  };

  // Dispatch Action (Manual copy helper which is extremely safe and prevents FB browser account lockouts)
  const handleManualDispatch = (job: DispatchJob) => {
    // Copy to clipboard
    navigator.clipboard.writeText(job.messageText);
    setCopiedJobId(job.id);
    setTimeout(() => setCopiedJobId(null), 3000);

    // Open FB Group Link
    window.open(job.groupUrl, "_blank");

    // Update status in Job queue
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === job.id) {
          return { ...j, status: "success", sentAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
        }
        return j;
      })
    );

    // Update count on the group
    const updatedGroups = groups.map((g) => {
      if (g.id === job.groupId) {
        return { ...g, postsCountToday: g.postsCountToday + 1 };
      }
      return g;
    });
    onUpdateGroups(updatedGroups);

    // Add logging item
    onAddLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      type: "success",
      groupName: job.groupName,
      messageSnippet: job.messageText.substring(0, 60) + "...",
      details: `Mensagem copiada para a área de transferência. Grupo aberto no navegador para publicação manual rápida e segura.`
    });
  };

  // Simulated Autoposting simulation helper for demonstration
  const handleSimulateAutopost = async () => {
    const pendingJobs = jobs.filter((j) => j.status === "pending");
    if (pendingJobs.length === 0) {
      alert("Nenhum disparo pendente na fila para simular. Gere a fila primeiro.");
      return;
    }

    setIsLoading(true);

    // Post to groups one-by-one inside a simulation
    for (let i = 0; i < pendingJobs.length; i++) {
      const job = pendingJobs[i];
      
      // Update job status to "sending"
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "sending" } : j))
      );

      // Brief delay to simulate posting activity connection to Facebook servers
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Successfully process simulated posting
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "success", sentAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) } : j))
      );

      // Update actual group counter
      const updatedGroups = groups.map((g) => {
        if (g.id === job.groupId) {
          return { ...g, postsCountToday: g.postsCountToday + 1 };
        }
        return g;
      });
      onUpdateGroups(updatedGroups);

      onAddLog({
        id: `simulation-${Date.now()}-${i}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        type: "success",
        groupName: job.groupName,
        messageSnippet: job.messageText.substring(0, 60) + "...",
        details: `[Simulação Automática] Postagem disparada com sucesso em segundo plano via API fictícia. Rodízio de IA preservado.`,
      });
    }

    setIsLoading(false);
    alert("Simulação de disparo automatizada em lote concluída com sucesso! Verifique os relatórios de limite diário.");
  };

  // Quick reset for today's counters to let them test posting limits endlessly
  const handleResetCounters = () => {
    if (confirm("Deseja redefinir os contadores de hoje de todos os grupos para zero?")) {
      const reset = groups.map((g) => ({ ...g, postsCountToday: 0 }));
      onUpdateGroups(reset);
      setJobs([]);
      
      onAddLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        type: "warning",
        groupName: "Configuração do Sistema",
        messageSnippet: "Reset de cota",
        details: "Todas as quotas de disparos diários foram redefinidas de volta para 0.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header Navigation */}
      <div className="flex border-b border-slate-100 pb-px">
        <button
          onClick={() => setActiveTab("assistant")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition ${
            activeTab === "assistant"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          🚀 Assistente de Transmissão
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition relative ${
            activeTab === "queue"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          📋 Fila de Agendamento ({jobs.filter((j) => j.status === "pending").length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-4 transition ${
            activeTab === "settings"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          ⚙️ Ajustes da Campanha
        </button>
      </div>

      {/* Main Sections */}
      {activeTab === "assistant" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Action Panel Left */}
          <div className="lg:col-span-1 bg-white border border-slate-100 p-6 rounded-2xl shadow-3xs space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 font-sans">1. Escolha a Mensagem</h3>
              <p className="text-[11px] text-slate-400">Selecione o modelo que deseja propagar nos grupos cadastrados hoje.</p>
            </div>

            {templates.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 space-y-2">
                <p className="font-bold flex items-center gap-1">
                  <ShieldAlert size={14} /> Nenhum Modelo Criado
                </p>
                <p>Por favor, vá primeiro na aba "Modelos de Mensagens" para registrar uma mensagem.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>

                {currentTemplate && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                    <p className="font-bold text-slate-700">Texto Original:</p>
                    <p className="text-slate-600 italic line-clamp-3">"{currentTemplate.text}"</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Variações IA: {currentTemplate.variations?.length || 0}</span>
                      {currentTemplate.variations?.length === 0 && (
                        <span className="text-amber-500 font-bold">Risco de Spam alto</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <hr className="border-slate-100" />

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 font-sans">2. Configure e Prepare a Fila</h3>
              <p className="text-[11px] text-slate-400">Ativa o revezamento de IA e respeita as regras de cota de 1-5 posts.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-blue-50/55 rounded-lg text-xs leading-none">
                <span className="text-blue-900 font-medium">Revezar Textos (IA Antispam)</span>
                <input
                  type="checkbox"
                  checked={campaign.useAiVariations}
                  onChange={(e) => onUpdateCampaign({ ...campaign, useAiVariations: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
              </div>

              <button
                onClick={handleGenerateJobs}
                disabled={templates.length === 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Sparkles size={14} /> Gerar Cronograma de Posts
              </button>
            </div>
          </div>

          {/* Active Job Dispatcher Right */}
          <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-3xs space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 font-sans">Esteira de Disparo Híbrido Seguro</h3>
                <p className="text-[11px] text-slate-400">
                  A metodologia híbrida (Copie e Abra) impede bloqueios na sua conta pessoal do Facebook porque você envia de forma nativa e humana.
                </p>
              </div>

              {jobs.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSimulateAutopost}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                  >
                    {isLoading ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />} Simular Lote Auto
                  </button>
                  <button
                    onClick={handleResetCounters}
                    className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg text-xs font-medium transition"
                  >
                    Resetar Cotas
                  </button>
                </div>
              )}
            </div>

            {jobs.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mx-auto">
                  <Info size={24} />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <p className="text-slate-700 font-bold text-sm">Pronto para iniciar!</p>
                  <p className="text-slate-400 text-xs">
                    Certifique-se de ter cadastrado seus grupos e modelos, selecione a mensagem ao lado e clique em <strong>"Gerar Cronograma de Posts"</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {jobs.map((job, idx) => {
                  const isPending = job.status === "pending";
                  const isSending = job.status === "sending";
                  const isSuccess = job.status === "success";
                  const isFailed = job.status === "failed";

                  return (
                    <div
                      key={job.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSuccess ? "bg-emerald-50/30 border-emerald-100" :
                        isFailed ? "bg-red-50/30 border-red-100 opacity-70" :
                        "bg-white border-slate-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {idx + 1}. {job.groupName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono inline-flex items-center gap-1">
                            Hora agendada: {job.scheduledTime}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider ${
                          isSuccess ? "bg-emerald-100 text-emerald-800" :
                          isFailed ? "bg-red-100 text-red-800" :
                          isSending ? "bg-blue-100 text-blue-800 animate-pulse" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {isSuccess ? "Publicado" : isFailed ? "Pular" : isSending ? "Enviando..." : "Pendente"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* Selected variation display */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600 italic relative">
                          <span className="absolute top-1 right-2 text-[9px] text-blue-500 font-bold font-mono">
                            Variação IA Ativa
                          </span>
                          "{job.messageText}"
                        </div>

                        {job.error && (
                          <p className="text-[10px] text-red-500 font-medium">⚠️ {job.error}</p>
                        )}

                        {isPending && (
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <span className="text-[10px] text-slate-400">
                              O botão copiará o texto alterado e abrirá o grupo no Facebook.
                            </span>
                            <button
                              onClick={() => handleManualDispatch(job)}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition shrink-0 shadow-3xs"
                            >
                              {copiedJobId === job.id ? <Check size={12} /> : <Copy size={12} />}
                              {copiedJobId === job.id ? "Copiado!" : "Copiar e Abrir FB"}
                            </button>
                          </div>
                        )}

                        {isSuccess && (
                          <div className="flex items-center justify-between text-[10px] text-emerald-600 pt-1">
                            <span>Concluído com sucesso às {job.sentAt}.</span>
                            <a
                              href={job.groupUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold underline flex items-center gap-0.5 hover:text-emerald-800"
                            >
                              Ver grupo original <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheduler Queue View Tab */}
      {activeTab === "queue" && (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-3xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900">Configuração de Fila Dinâmica</h3>
              <p className="text-xs text-slate-400">Fila cronogenética montada baseada na periodicidade do seu plano.</p>
            </div>
            <p className="text-xs text-slate-500">Pendentes: {jobs.filter((j) => j.status === "pending").length}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-slate-600 text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold text-left border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4 font-sans text-center">Filtro</th>
                  <th className="py-2.5 px-4 font-sans">Grupo do Facebook</th>
                  <th className="py-2.5 px-4 font-sans">Mensagem Selecionada</th>
                  <th className="py-2.5 px-4 font-sans">Hora Agendada</th>
                  <th className="py-2.5 px-4 font-sans text-center">Modo</th>
                  <th className="py-2.5 px-4 font-sans text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhum item agendado na fila de hoje. Volte para a aba anterior e "Gerar Cronograma".
                    </td>
                  </tr>
                ) : (
                  jobs.map((job, idx) => (
                    <tr key={job.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        <div className="flex flex-col">
                          <span>{job.groupName}</span>
                          <a href={job.groupUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                            Facebook Group URL
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncation">
                        <p className="truncate italic text-slate-500">"{job.messageText}"</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{job.scheduledTime}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold uppercase">
                          Semi-Auto
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-[10px] font-bold ${
                          job.status === "success" ? "text-emerald-500" :
                          job.status === "failed" ? "text-red-500" :
                          "text-amber-500 animate-pulse"
                        }`}>
                          {job.status === "success" ? "Públicado" :
                           job.status === "failed" ? "Cancelado/Cheio" : "Agendado"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Settings Tab */}
      {activeTab === "settings" && (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-3xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 font-sans">Ajustes Finos do Planejador diário</h3>
            <p className="text-xs text-slate-400">Controle rigorosamente os tempos entre disparos para emular um comportamento humano.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Intervalo entre Grupos (Minutos)</label>
                <select
                  value={campaign.intervalMinutes}
                  onChange={(e) => onUpdateCampaign({ ...campaign, intervalMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none"
                >
                  <option value={5}>Agressivo (5 minutos)</option>
                  <option value={15}>Rápido seguro (15 minutos)</option>
                  <option value={30}>Ideal padrão (30 minutos)</option>
                  <option value={60}>Muito seguro (60 minutos)</option>
                  <option value={120}>Orgânico real (120 minutos)</option>
                </select>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Intervalos mais amplos reduzem drasticamente as chances do Facebook detectar robôs automatizados de postagem contínua.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Hora de Início do Ciclo</label>
                  <input
                    type="time"
                    value={campaign.startHour}
                    onChange={(e) => onUpdateCampaign({ ...campaign, startHour: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Hora de Encerramento</label>
                  <input
                    type="time"
                    value={campaign.endHour}
                    onChange={(e) => onUpdateCampaign({ ...campaign, endHour: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <ShieldAlert size={14} className="text-amber-500" /> Alerta de Prevenção Antoban
                </h4>
                <ul className="text-[11px] text-slate-500 space-y-1 w-full pl-4 list-disc leading-relaxed">
                  <li>Alternar variações de texto geradas pela IA diminui a detecção de assinaturas idênticas.</li>
                  <li>Evite usar links com domínios suspeitos ou recém-criados em massa.</li>
                  <li>
                    O limite diário de cada grupo está fixado em até <strong>5 postagens</strong>. Se ultrapassar, o app pulará o envio automaticamente.
                  </li>
                  <li>Prefira usar no máximo 3 perfis do FB alternados se tiver mais de 10 grupos.</li>
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="randomizeDelayCheck"
                  checked={campaign.randomizeDelay}
                  onChange={(e) => onUpdateCampaign({ ...campaign, randomizeDelay: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded-sm focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="randomizeDelayCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Adicionar variação aleatória de atraso (+/- 5 min)
                  </label>
                  <p className="text-[10px] text-slate-400">Garante que os disparos não tenham intervalos matematicamente idênticos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
