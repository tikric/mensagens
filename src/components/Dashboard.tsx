import { FacebookGroup, MessageTemplate, DispatchLog } from "../types";
import { Users, FileText, CheckCircle2, TrendingUp, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  groups: FacebookGroup[];
  templates: MessageTemplate[];
  logs: DispatchLog[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ groups, templates, logs, onNavigate }: DashboardProps) {
  const activeGroups = groups.filter(g => g.active);
  const totalLimit = activeGroups.reduce((acc, curr) => acc + curr.dailyLimit, 0);
  const totalSentToday = activeGroups.reduce((acc, curr) => acc + curr.postsCountToday, 0);
  const totalVariations = templates.reduce((acc, curr) => acc + (curr.variations?.length || 0), 0);

  // Calculate percentage of quota used
  const quotaPercentage = totalLimit > 0 ? Math.min(100, Math.round((totalSentToday / totalLimit) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Intro Bannner */}
      <div className="bg-radial from-slate-900 via-slate-950 to-black p-6 rounded-2xl border border-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-sans font-bold tracking-tight text-white mb-1">
              Painel de Postagens para Grupos do Facebook
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Gerencie suas postagens com contingência e variação inteligente de texto por Inteligência Artificial (Gemini API) para evitar bloqueios por spam.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/85 px-4 py-2 rounded-xl border border-slate-700">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-300 font-mono">Sistema Pronto</span>
          </div>
        </div>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate("grupos")}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-all shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Grupos Ativos</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-slate-900">{activeGroups.length} <span className="text-xs font-normal text-slate-400">/ {groups.length}</span></h3>
            <p className="text-xs text-slate-500">Grupos configurados para envio</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate("modelos")}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-all shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Variações Inteligentes</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-slate-900">{totalVariations} <span className="text-xs font-normal text-slate-400">textos</span></h3>
            <p className="text-xs text-slate-500">Prontos para alternar no rodízio</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate("fila")}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-all shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Enviados Hoje</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-slate-900">{totalSentToday} <span className="text-xs font-normal text-slate-400">/ {totalLimit}</span></h3>
            <p className="text-xs text-slate-500">Postados dentro do limite diário</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate("modelos")}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-all shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Média por Grupo</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-slate-900">
              {groups.length > 0 ? (groups.reduce((a, b) => a + b.dailyLimit, 0) / groups.length).toFixed(1) : "0"}
            </h3>
            <p className="text-xs text-slate-500">Postagens permitidas por dia</p>
          </div>
        </div>
      </div>

      {/* Quota Progress & Simulation Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Limit Meter */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 lg:col-span-1 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-sans mb-1">Mapeamento de Cota Diária</h3>
            <p className="text-xs text-slate-500 mb-6">Controle estrito de 1 a 5 publicações diárias por grupo para garantir a integridade da sua conta.</p>

            <div className="flex flex-col items-center justify-center py-6 relative">
              {/* Simple graphic radial border */}
              <div className="w-36 h-36 rounded-full border-8 border-slate-100 flex items-center justify-center relative">
                {/* SVG Circle showing dynamic percent */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    className="text-blue-500"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 64}
                    strokeDashoffset={2 * Math.PI * 64 * (1 - quotaPercentage / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="64"
                    cx="72"
                    cy="72"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-3xl font-black text-slate-900 font-sans">{quotaPercentage}%</span>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Usado Hoje</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-sans">Total Enviado Hoje:</span>
              <span className="font-bold text-slate-900">{totalSentToday} mensagens</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${quotaPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              * O Facebook costuma restringir contas que ultrapassam 5 postagens iguais por dia em grupos de estranhos. Nosso rodízio de IA minimiza esse risco.
            </p>
          </div>
        </div>

        {/* Right Card: Daily Activity Stream / Logs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-base font-bold text-slate-900 font-sans">Log de Operações Recentes</h3>
              <button 
                onClick={() => onNavigate("fila")}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Ver Fila e Histórico
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Acompanhe as ações tomadas pelo assistente e pela automação inteligente.</p>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <p className="text-sm">Nenhuma atividade registrada hoje.</p>
                  <p className="text-xs text-slate-300">Inicie um envio na aba "Assistente de Envio" para ver o histórico.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${
                      log.type === "success" ? "bg-emerald-500" :
                      log.type === "error" ? "bg-red-500" :
                      log.type === "warning" ? "bg-amber-500" : "bg-sky-500"
                    }`} />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-800">{log.groupName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600">{log.details}</p>
                      {log.messageSnippet && (
                        <div className="bg-white p-2 rounded-md border border-slate-100 text-[11px] text-slate-500 font-mono line-clamp-1 italic">
                          "{log.messageSnippet}"
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                <ShieldCheck size={16} />
              </div>
              <span className="text-xs text-slate-600 font-sans">
                Para disparos automatizados diretos, prefira a nossa esteira híbrida com <strong>cópia expressa</strong>.
              </span>
            </div>
            <button
              onClick={() => onNavigate("fila")}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl tracking-tight transition shadow-sm"
            >
              Começar Disparos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
