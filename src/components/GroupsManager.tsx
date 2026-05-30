import React, { useState } from "react";
import { FacebookGroup } from "../types";
import { Plus, Search, Edit2, Trash2, ExternalLink, ShieldCheck, X } from "lucide-react";

interface GroupsManagerProps {
  groups: FacebookGroup[];
  onAddGroup: (group: Omit<FacebookGroup, "id" | "postsCountToday">) => void;
  onUpdateGroup: (group: FacebookGroup) => void;
  onDeleteGroup: (id: string) => void;
}

export default function GroupsManager({ groups, onAddGroup, onUpdateGroup, onDeleteGroup }: GroupsManagerProps) {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<FacebookGroup | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Geral");
  const [dailyLimit, setDailyLimit] = useState(3); // Default to 3, range 1-5
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    if (editGroup) {
      onUpdateGroup({
        ...editGroup,
        name,
        url,
        category,
        dailyLimit,
        notes,
        active,
      });
      setEditGroup(null);
    } else {
      onAddGroup({
        name,
        url,
        category,
        dailyLimit,
        notes,
        active,
      });
    }

    // Reset Form
    setName("");
    setUrl("");
    setCategory("Geral");
    setDailyLimit(3);
    setNotes("");
    setActive(true);
    setIsFormOpen(false);
  };

  const startEdit = (g: FacebookGroup) => {
    setEditGroup(g);
    setName(g.name);
    setUrl(g.url);
    setCategory(g.category);
    setDailyLimit(g.dailyLimit);
    setNotes(g.notes || "");
    setActive(g.active);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setEditGroup(null);
    setName("");
    setUrl("");
    setCategory("Geral");
    setDailyLimit(3);
    setNotes("");
    setIsFormOpen(false);
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Main Call to Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar grupos ou categorias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => {
            setEditGroup(null);
            setIsFormOpen(true);
          }}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
        >
          <Plus size={16} /> Cadastrar Grupo FB
        </button>
      </div>

      {/* Modal / Inline Add or Edit Form */}
      {isFormOpen && (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl relative animate-fadeIn space-y-4">
          <button 
            onClick={handleCancel}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
          
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {editGroup ? "✏️ Editar Configurações do Grupo" : "➕ Cadastrar Novo Grupo do Facebook"}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5Col">
              <label className="text-xs font-bold text-slate-600">Nome do Grupo FB</label>
              <input
                type="text"
                required
                placeholder="Ex: Moda Feminina Atacado SP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Categoria / Tag do Grupo</label>
              <input
                type="text"
                placeholder="Ex: Vendas, Conexão, Empregos"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Endereço Web / URL do Grupo</label>
              <input
                type="url"
                required
                placeholder="Ex: https://www.facebook.com/groups/XXXXXXXXX"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5 p-4 bg-white rounded-xl border border-slate-100 shadow-3xs">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600">Frequência Limite Diária</label>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {dailyLimit} mensagens ao dia
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">Recomendação contra spam: máximo 1 a 5 publicações por dia em cada grupo.</p>
              
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDailyLimit(val)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                      dailyLimit === val
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 md:row-span-1 py-1 flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded-sm focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="activeCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Grupo Ativo na Esteira de Agendamento
                  </label>
                  <p className="text-[10px] text-slate-400">Ative ou desative temporariamente os disparos neste grupo.</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Notas / Observações do Grupo (Opcional)</label>
              <textarea
                rows={2}
                placeholder="Exemplo de regras do administrador ou restrições..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2 pt-2 flex justify-end gap-2">
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
                {editGroup ? "Salvar Alterações" : "Salvar Grupo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of groups with progress bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredGroups.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
            <p className="text-slate-400 font-medium text-sm">Nenhum grupo do Facebook cadastrado com esses termos.</p>
            <p className="text-slate-300 text-xs">Cadastre novos grupos usando o botão "Cadastrar Grupo FB".</p>
          </div>
        ) : (
          filteredGroups.map((g) => {
            const quotaUsagePct = Math.min(100, Math.round((g.postsCountToday / g.dailyLimit) * 100));
            return (
              <div 
                key={g.id} 
                className={`bg-white rounded-2xl border transition-all p-5 shadow-3xs flex flex-col justify-between ${
                  g.active ? "border-slate-100 hover:border-slate-200" : "border-slate-100 opacity-60 bg-slate-50/20"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] font-bold rounded-md uppercase tracking-wider">
                      {g.category || "Sem categoria"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${g.active ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {g.active ? "Ativo" : "Pausado"}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                    {g.name}
                  </h4>

                  {g.notes && (
                    <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-1 mb-3">
                      "{g.notes}"
                    </p>
                  )}

                  {/* Quota Limits visual indicators */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-sans">Meta Diária:</span>
                      <span className="font-bold text-slate-800">
                        {g.postsCountToday} / {g.dailyLimit} posts hoje
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          quotaUsagePct >= 100 ? "bg-amber-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${quotaUsagePct}%` }}
                      />
                    </div>
                    
                    {/* Warning about exceeding 5 posts limit */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Carga: {quotaUsagePct}%</span>
                      {g.dailyLimit > 5 && (
                        <span className="text-amber-500 flex items-center gap-0.5">
                          <Plus size={10} /> limite alto de spam
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card footer operations */}
                <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
                  <a 
                    href={g.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 hover:underline"
                  >
                    Abrir no FB <ExternalLink size={12} />
                  </a>

                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        const nextState = !g.active;
                        onUpdateGroup({ ...g, active: nextState });
                      }}
                      className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-50 rounded bg-slate-100 hover:bg-slate-200 transition"
                    >
                      {g.active ? "Pausar" : "Ativar"}
                    </button>
                    <button
                      onClick={() => startEdit(g)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition"
                      title="Editar"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja remover o grupo "${g.name}" permanentemente?`)) {
                          onDeleteGroup(g.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition"
                      title="Remover"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
