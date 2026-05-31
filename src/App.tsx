import { useState, useEffect } from "react";
import { FacebookGroup, MessageTemplate, ScheduleCampaign, DispatchLog, FacebookAccount } from "./types";
import { defaultGroups, defaultTemplates, defaultCampaign, defaultAccounts } from "./defaultData";
import Dashboard from "./components/Dashboard";
import GroupsManager from "./components/GroupsManager";
import TemplatesManager from "./components/TemplatesManager";
import SenderAssistant from "./components/SenderAssistant";
import AccountsManager from "./components/AccountsManager";
import MultiPlatformManager from "./components/MultiPlatformManager";
import { LayoutDashboard, Users, FileText, Send, Sparkles, RefreshCw, Settings, Info, UserCheck, Smartphone, Share2 } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  // State with LocalStorage Hydration
  const [groups, setGroups] = useState<FacebookGroup[]>([]);
  const [accounts, setAccounts] = useState<FacebookAccount[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [campaign, setCampaign] = useState<ScheduleCampaign>(defaultCampaign);
  const [logs, setLogs] = useState<DispatchLog[]>([]);

  // Initial load
  useEffect(() => {
    const savedGroups = localStorage.getItem("fb_autopost_groups");
    const savedAccounts = localStorage.getItem("fb_autopost_accounts");
    const savedTemplates = localStorage.getItem("fb_autopost_templates");
    const savedCampaign = localStorage.getItem("fb_autopost_campaign");
    const savedLogs = localStorage.getItem("fb_autopost_logs");

    if (savedGroups) {
      try {
        setGroups(JSON.parse(savedGroups));
      } catch {
        setGroups(defaultGroups);
      }
    } else {
      setGroups(defaultGroups);
    }

    if (savedAccounts) {
      try {
        setAccounts(JSON.parse(savedAccounts));
      } catch {
        setAccounts(defaultAccounts);
      }
    } else {
      setAccounts(defaultAccounts);
    }

    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch {
        setTemplates(defaultTemplates);
      }
    } else {
      setTemplates(defaultTemplates);
    }

    if (savedCampaign) {
      try {
        setCampaign(JSON.parse(savedCampaign));
      } catch {
        setCampaign(defaultCampaign);
      }
    } else {
      setCampaign(defaultCampaign);
    }

    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch {
        setLogs([]);
      }
    } else {
      setLogs([]);
    }
  }, []);

  // Save states to localStorage when they change
  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem("fb_autopost_groups", JSON.stringify(groups));
    }
  }, [groups]);

  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem("fb_autopost_accounts", JSON.stringify(accounts));
    }
  }, [accounts]);

  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem("fb_autopost_templates", JSON.stringify(templates));
    }
  }, [templates]);

  useEffect(() => {
    localStorage.setItem("fb_autopost_campaign", JSON.stringify(campaign));
  }, [campaign]);

  useEffect(() => {
    localStorage.setItem("fb_autopost_logs", JSON.stringify(logs));
  }, [logs]);

  // Operations - Groups
  const handleAddGroup = (newGroup: Omit<FacebookGroup, "id" | "postsCountToday">) => {
    const group: FacebookGroup = {
      ...newGroup,
      id: `g-${Date.now()}`,
      postsCountToday: 0,
    };
    const updated = [...groups, group];
    setGroups(updated);
    localStorage.setItem("fb_autopost_groups", JSON.stringify(updated));

    handleAddLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      type: "info",
      groupName: newGroup.name,
      messageSnippet: "",
      details: "Grupo cadastrado com sucesso no monitor de limites diários.",
    });
  };

  const handleUpdateGroup = (updatedGroup: FacebookGroup) => {
    const updated = groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g));
    setGroups(updated);
    localStorage.setItem("fb_autopost_groups", JSON.stringify(updated));
  };

  const handleDeleteGroup = (id: string) => {
    const target = groups.find((g) => g.id === id);
    const updated = groups.filter((g) => g.id !== id);
    setGroups(updated);
    localStorage.setItem("fb_autopost_groups", JSON.stringify(updated));

    if (target) {
      handleAddLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        type: "warning",
        groupName: target.name,
        messageSnippet: "",
        details: "Grupo removido do sistema.",
      });
    }
  };

  // Operations - Templates
  const handleAddTemplate = (newTpl: Omit<MessageTemplate, "id" | "createdAt">) => {
    const tpl: MessageTemplate = {
      ...newTpl,
      id: `t-${Date.now()}`,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };
    const updated = [...templates, tpl];
    setTemplates(updated);
    localStorage.setItem("fb_autopost_templates", JSON.stringify(updated));

    handleAddLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      type: "info",
      groupName: "Modelos de Mensagem",
      messageSnippet: newTpl.title,
      details: `Novo modelo de mensagem registrado com ${newTpl.variations?.length || 0} variações de rodízio da IA.`,
    });
  };

  const handleUpdateTemplate = (updatedTpl: MessageTemplate) => {
    const updated = templates.map((t) => (t.id === updatedTpl.id ? updatedTpl : t));
    setTemplates(updated);
    localStorage.setItem("fb_autopost_templates", JSON.stringify(updated));
  };

  const handleDeleteTemplate = (id: string) => {
    const target = templates.find((t) => t.id === id);
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem("fb_autopost_templates", JSON.stringify(updated));

    if (target) {
      handleAddLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        type: "warning",
        groupName: "Modelos de Mensagem",
        messageSnippet: target.title,
        details: "Modelo de mensagem apagado do banco local.",
      });
    }
  };

  // Operations - Accounts (Facebook Profiles)
  const handleAddAccount = (newAcc: Omit<FacebookAccount, "id" | "groupsCount">) => {
    const acc: FacebookAccount = {
      ...newAcc,
      id: `acc-${Date.now()}`,
      groupsCount: 0,
    };
    const updated = [...accounts, acc];
    setAccounts(updated);
    localStorage.setItem("fb_autopost_accounts", JSON.stringify(updated));
  };

  const handleUpdateAccount = (updatedAcc: FacebookAccount) => {
    const updated = accounts.map((a) => (a.id === updatedAcc.id ? updatedAcc : a));
    setAccounts(updated);
    localStorage.setItem("fb_autopost_accounts", JSON.stringify(updated));
  };

  const handleDeleteAccount = (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    localStorage.setItem("fb_autopost_accounts", JSON.stringify(updated));
  };

  // Global Log Handler
  const handleAddLog = (newLog: DispatchLog) => {
    setLogs((prev) => [newLog, ...prev].slice(0, 50)); // Keep last 50 entries
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem("fb_autopost_logs");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 font-sans selection:bg-slate-700 antialiased">
      {/* Premium Elegant Header */}
      <header className="sticky top-0 z-50 bg-slate-950/85 border-b border-slate-800 shadow-3xs backdrop-blur-md bg-slate-950/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md flex items-center justify-center">
              <Send size={18} className="translate-x-px -translate-y-px rotate-12" />
            </div>
            <div>
              <h1 className="text-base font-bold font-sans text-slate-900 tracking-tight leading-none mb-1">
                FB Group AutoPoster
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
                Rodízio Inteligente & Limite de Spam
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick stats indicator */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-600 font-sans">Meta Diária Segura:</span>
              <span className="text-xs font-black text-slate-800">1 a 5 por grupo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Controls Layout */}
        <nav className="md:col-span-1 space-y-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs space-y-1">
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block px-3 mb-2">
              Navegação
            </span>
            <button
              onClick={() => setCurrentTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
                currentTab === "dashboard"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <LayoutDashboard size={16} /> Painel de Controle
            </button>

            <button
              onClick={() => setCurrentTab("grupos")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
                currentTab === "grupos"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Users size={16} /> Grupos do Facebook
              <span className="ml-auto px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded font-bold">
                {groups.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab("contas")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
                currentTab === "contas"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <UserCheck size={16} /> Contas do Facebook
              <span className="ml-auto px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded font-bold">
                {accounts.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab("modelos")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
                currentTab === "modelos"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <FileText size={16} /> Modelos de Mensagens
              <span className="ml-auto px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded font-bold">
                {templates.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab("transmissao")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
                currentTab === "transmissao"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Send size={16} /> Assistente de Envio
            </button>

            <button
              onClick={() => setCurrentTab("instagram")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
                currentTab === "instagram"
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-550/10"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <Share2 size={16} className="text-pink-500 animate-pulse" /> 🚀 Vídeo único em 4 Redes
            </button>
          </div>

          {/* Quick Informational card */}
          <div className="bg-radial from-slate-900 to-black text-white p-5 rounded-2xl border border-slate-800 shadow-3xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <Sparkles size={14} className="animate-pulse" /> IA integrada
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              O Facebook impõe bloqueios temporários quando contas postam mensagens idênticas em grupos. 
              Ao gerar variações pelo Gemini ao lado de quotas de <strong>1 a 5 posts por dia</strong>, sua conta fica altamente protegida.
            </p>
          </div>
        </nav>

        {/* Action Panel Dynamic Content */}
        <section className="md:col-span-3 space-y-6">
          {currentTab === "dashboard" && (
            <Dashboard
              groups={groups}
              templates={templates}
              logs={logs}
              onNavigate={(tab) => {
                if (tab === "grupos") setCurrentTab("grupos");
                if (tab === "modelos") setCurrentTab("modelos");
                if (tab === "fila" || tab === "transmissao") setCurrentTab("transmissao");
              }}
            />
          )}

          {currentTab === "grupos" && (
            <GroupsManager
              groups={groups}
              onAddGroup={handleAddGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          )}

          {currentTab === "contas" && (
            <AccountsManager
              accounts={accounts}
              onAddAccount={handleAddAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
              onAddLog={handleAddLog}
            />
          )}

          {currentTab === "modelos" && (
            <TemplatesManager
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          )}

          {currentTab === "transmissao" && (
            <SenderAssistant
              groups={groups}
              templates={templates}
              campaign={campaign}
              onUpdateCampaign={setCampaign}
              onUpdateGroups={(updated) => {
                setGroups(updated);
                localStorage.setItem("fb_autopost_groups", JSON.stringify(updated));
              }}
              onAddLog={handleAddLog}
            />
          )}

          {currentTab === "instagram" && (
            <MultiPlatformManager onAddLog={handleAddLog} />
          )}
        </section>
      </main>

      {/* Footer bar */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FB Group AutoPoster - Assistente Híbrido Protegido de Alta Conversão.</p>
          <div className="flex gap-4">
            <button onClick={clearLogs} className="hover:text-red-500 font-medium transition">
              Apagar Histórico de Logs
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
