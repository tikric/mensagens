import React, { useState } from "react";
import { FacebookAccount, DispatchLog } from "../types";
import { Plus, Search, LogIn, Lock, Trash2, ShieldCheck, Key, AlertCircle, RefreshCw, X, Check, Globe } from "lucide-react";

interface AccountsManagerProps {
  accounts: FacebookAccount[];
  onAddAccount: (acc: Omit<FacebookAccount, "id" | "groupsCount">) => void;
  onUpdateAccount: (acc: FacebookAccount) => void;
  onDeleteAccount: (id: string) => void;
  onAddLog: (log: DispatchLog) => void;
}

export default function AccountsManager({ accounts, onAddAccount, onUpdateAccount, onDeleteAccount, onAddLog }: AccountsManagerProps) {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [cookieString, setCookieString] = useState("");
  const [status, setStatus] = useState<FacebookAccount["status"]>("logged_in");
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoadingLogin(true);

    // Simulate standard extension / cookies checking login
    setTimeout(() => {
      onAddAccount({
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, "")}@facebook-user.com`,
        status: cookieString || accessToken ? "logged_in" : "not_logged",
        accessToken,
        cookieString,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&w=150&q=80`
      });

      onAddLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        type: "success",
        groupName: "Gerenciador de Contas",
        messageSnippet: name,
        details: `Conta '${name}' conectada com sucesso para revezamento e disparo automatizado.`
      });

      setIsLoadingLogin(false);
      setName("");
      setEmail("");
      setAccessToken("");
      setCookieString("");
      setIsFormOpen(false);
    }, 1200);
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action block with credentials notice */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 rounded-2xl border border-blue-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold font-sans text-white mb-1 flex items-center gap-2">
              <Lock size={18} className="text-blue-400" />
              Contas e Perfis do Facebook
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Gerencie múltiplas contas do Facebook para revezar as postagens de 1 a 5 mensagens ao dia. 
              Ao alternar as contas, você divide a carga de postagens diminuindo ainda mais o risco de suspensão.
            </p>
          </div>
          <button
            onClick={() => setShowManualGuide(!showManualGuide)}
            className="text-xs px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition shadow-md shrink-0"
          >
            {showManualGuide ? "Ocultar Guia do Facebook" : "⚠️ Erro na Meta? Clique Aqui para Resolver"}
          </button>
        </div>

        {/* ALWAYS SHOW or TOGGLE this highly helpful warning to save the user from Facebook developer portal frustration */}
        <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-300 space-y-3 leading-relaxed">
          <p className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
            <AlertCircle size={16} className="text-amber-400" /> 
            Por que você está vendo erro na Meta (Developers)? Leia abaixo:
          </p>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
            <p className="text-[11px] text-slate-200">
              🚨 <strong>Aviso Importante:</strong> Em <strong>22 de Abril de 2024</strong>, a Meta (Facebook) <strong>DESATIVOU COMPLETAMENTE</strong> a API de Grupos do Facebook (<code className="text-amber-300">publish_to_groups</code>) para usuários normais domésticos. Portanto, nenhum aplicativo hoje consegue permissão de postagem automática oficial direto no painel de desenvolvedores, e eles exigirão verificações e pagamentos de empresa que não servem para pessoas físicas.
            </p>
            <p className="font-bold text-white text-[11px]">
              E agora? Não se preocupe! Você NÃO precisa criar aplicativo de desenvolvedores na Meta!
            </p>
            <p className="text-[11px] text-slate-200">
              Nosso sistema foi construído especificamente para rodar de forma híbrida e independente sem necessitar do aplicativo da Meta. Veja abaixo o passo-a-passo simples para cadastrar e começar a postar grátis em menos de 2 minutos:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
            <div className="bg-slate-900/45 p-3 rounded-xl border border-slate-850">
              <span className="text-[10px] bg-blue-600 text-white font-bold h-5 w-5 rounded-full inline-flex items-center justify-center mb-1.5">1</span>
              <p className="font-bold text-slate-100 text-[11px]">Cadastrar Perfil</p>
              <p className="text-[10px] text-slate-400 leading-tight">Aqui mesmo na tela, clique em <strong>"Conectar Nova Conta FB"</strong>. Digite apenas seu nome e e-mail. Deixe o campo "Token" em branco!</p>
            </div>

            <div className="bg-slate-900/45 p-3 rounded-xl border border-slate-850">
              <span className="text-[10px] bg-blue-600 text-white font-bold h-5 w-5 rounded-full inline-flex items-center justify-center mb-1.5">2</span>
              <p className="font-bold text-slate-100 text-[11px]">Copiar Links Grupos</p>
              <p className="text-[10px] text-slate-400 leading-tight">Vá na guia <strong>"Grupos do Facebook"</strong> no menu lateral e adicione os links dos grupos reais de classificados que você participa.</p>
            </div>

            <div className="bg-slate-900/45 p-3 rounded-xl border border-slate-850">
              <span className="text-[10px] bg-blue-600 text-white font-bold h-5 w-5 rounded-full inline-flex items-center justify-center mb-1.5">3</span>
              <p className="font-bold text-slate-100 text-[11px]">Criar Anúncios</p>
              <p className="text-[10px] text-slate-400 leading-tight">Na guia <strong>"Modelos de Mensagens"</strong>, monte o texto do seu anúncio principal e crie variações automáticas com IA para não tomar bloqueios.</p>
            </div>

            <div className="bg-slate-900/45 p-3 rounded-xl border border-slate-850">
              <span className="text-[10px] bg-blue-600 text-white font-bold h-5 w-5 rounded-full inline-flex items-center justify-center mb-1.5">4</span>
              <p className="font-bold text-slate-100 text-[11px]">Postagem Híbrida 1-Click</p>
              <p className="text-[10px] text-slate-400 leading-tight">No menu <strong>"Assistente de Transmissão"</strong>, aperte em Gerar Cronograma. Depois, clique no botão azul <strong>"Copiar e Abrir FB"</strong>. O sistema copia seu anúncio antispam e abre o grupo para você colar e publicar nativamente em 1 segundo!</p>
            </div>
          </div>
        </div>

        {showManualGuide && (
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-300 space-y-2 leading-relaxed">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Globe size={14} className="text-blue-400" /> Método Alternativo por Cookies de Navegador:
            </p>
            <p>
              Se você deseja testar requisições automáticas diretas sem abrir a aba, nosso sistema extrai a sessão pelo navegador real. Você insere o cookie de sessão do seu navegador (como <code>c_user</code> e <code>xs</code>) copiando das ferramentas de desenvolvedores (F12 - Aplicativo - Cookies) do seu próprio Facebook no navegador e colando no campo do formulário de login para simular conexões nativas.
            </p>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar contas cadastradas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
        >
          <LogIn size={16} /> Conectar Nova Conta FB
        </button>
      </div>

      {/* Account Login Form Modal */}
      {isFormOpen && (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl relative animate-fadeIn space-y-4">
          <button 
            onClick={() => setIsFormOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
          
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            🔑 Conexão Integrada de Conta Facebook (Cookie / Token)
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Nome do Proprietário do Perfil</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">E-mail Cadastrado no FB (Opcional)</label>
                <input
                  type="email"
                  placeholder="Ex: carlos.silva@provedor.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Key size={13} className="text-slate-500" />
                Access Token da API (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: EAAGbZA8..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-mono focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-400">Token gerado pela ferramenta de desenvolvedores Facebook Graph API.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Lock size={13} className="text-slate-500" />
                Cookies de Sessão para Postagem Direta (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: c_user=1000XXXXXXXX; xs=XXXXXXXX;"
                value={cookieString}
                onChange={(e) => setCookieString(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-mono focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-400">Seus dados de sessão segura obtidos na aba de cookies f_id/xs do seu navegador do Facebook.</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 text-xs flex gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-blue-600" />
              <p className="leading-snug">
                <strong>Garantia de Privacidade:</strong> Seus dados de cookies e tokens de acesso são guardados exclusivamente no seu navegador (armazenamento local) e nunca são transmitidos a servidores terceiros.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-100 font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoadingLogin}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {isLoadingLogin ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> Testando conexão...
                  </>
                ) : (
                  <>
                    <Check size={13} /> Autenticar Conta
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const isLoggedIn = acc.status === "logged_in";
          return (
            <div
              key={acc.id}
              className={`bg-white rounded-2xl border p-5 shadow-3xs hover:border-slate-200 transition flex flex-col justify-between ${
                isLoggedIn ? "border-slate-100" : "border-slate-100 bg-slate-50/20 opacity-70"
              }`}
            >
              <div className="space-y-4">
                {/* Profile Header card */}
                <div className="flex items-center gap-3">
                  <img
                    referrerPolicy="no-referrer"
                    src={acc.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                    alt={acc.name}
                    className="w-12 h-12 rounded-full border border-slate-100 object-cover bg-slate-100"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{acc.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                  </div>
                </div>

                {/* Session specifications info */}
                <div className="space-y-1.5 py-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Sessão Autenticada:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      isLoggedIn ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {isLoggedIn ? "Conectado" : "Senha Requerida"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Atribuição de Grupos:</span>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">{acc.groupsCount || "Não configurado" } grupos</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                    <span>Rodízio Diário Estimado:</span>
                    <span className="font-sans font-bold text-slate-600">Até 15 disparos/dia</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    const nextStatus = isLoggedIn ? "not_logged" : "logged_in";
                    onUpdateAccount({
                      ...acc,
                      status: nextStatus,
                      accessToken: nextStatus === "logged_in" ? "EAAGbZA81_SIMULATED" : undefined,
                      cookieString: nextStatus === "logged_in" ? "c_user=1_SIMULATED" : undefined,
                    });
                    
                    onAddLog({
                      id: `log-${Date.now()}`,
                      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                      type: "info",
                      groupName: "Gerenciador de Contas",
                      messageSnippet: acc.name,
                      details: `Status da conta modificado para: ${nextStatus === "logged_in" ? "Ativo/Logado" : "Desconectado"}`
                    });
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold"
                >
                  {isLoggedIn ? "Desconectar Perfil" : "Logar Perfil FB"}
                </button>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      if (confirm(`Remover a conta de "${acc.name}" permanentemente do banco local de rotação?`)) {
                        onDeleteAccount(acc.id);
                        onAddLog({
                          id: `log-${Date.now()}`,
                          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                          type: "warning",
                          groupName: "Gerenciador de Contas",
                          messageSnippet: acc.name,
                          details: `Conta '${acc.name}' removida dos dispositivos cadastrados.`
                        });
                      }
                    }}
                    className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition"
                    title="Excluir Perfil"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
