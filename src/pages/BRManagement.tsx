/**
 * BRManagement.tsx - BR (Bills of Lading) Management System
 * Design: Shopee brand identity (orange #EE4D2D primary)
 * Features: Cadastro, resumo diário, listagem, busca, categorias, histórico
 */

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  BarChart3,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Lock,
  LogOut,
  Upload,
  FileText,
} from "lucide-react";
import { useBRData } from "@/hooks/useBRData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const COLORS = {
  orange: "#EE4D2D",
  amarelo: "#F5C518",
  avaria: "#EE4D2D",
  extravio: "#0055AA",
  devolucao: "#26AA99",
  outro: "#64748B",
};

function formatNum(n: number) {
  return n.toLocaleString("pt-BR");
}

function getCategoryColor(categoria: string): string {
  const colorMap: Record<string, string> = {
    "Amarelo": "#F5C518",
    "Erro operacional": "#EE4D2D",
    "On hold": "#0055AA",
    "Retirada Fleet": "#26AA99",
    "OFFICE": "#64748B",
  };
  return colorMap[categoria] || "#64748B";
}

// ─── Section: Cadastro de BR ──────────────────────────────────────────────────
function SectionAddBR({ addBR, categories }: {
  addBR: (code: string, categoria: string) => any;
  categories: any[];
}) {
  const [code, setCode] = useState("");
  const [categoria, setCategoria] = useState(categories[0]?.label || "OFFICE");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Digite um código BR válido");
      inputRef.current?.focus();
      return;
    }

    const result = addBR(code, categoria);
    if (result) {
      toast.success(`BR ${result.code} adicionado como ${categoria}!`, { icon: "✅" });
      setCode("");
      inputRef.current?.focus();
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Plus size={20} style={{ color: COLORS.orange }} />
        <h2 className="text-lg font-800" style={{ color: COLORS.orange }}>Cadastrar BR</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ex: BR123456 ou 123456"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>

        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-3 text-sm font-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
        >
          {[...categories].map(cat => (
            <option key={cat.key} value={cat.label}>{cat.label}</option>
          ))}
        </select>

        <button
          type="submit"
          className="px-6 py-3 rounded-lg text-white text-sm font-700 transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap"
          style={{ background: COLORS.orange }}
        >
          <Plus size={16} />
          Adicionar
        </button>
      </form>
    </div>
  );
}

// ─── Section: Resumo do Dia ───────────────────────────────────────────────────
function SectionTodaySummary({ todayBRs, categories }: {
  todayBRs: any[];
  categories: any[];
}) {
  const todayByCategory = new Map<string, any[]>();
  todayBRs.forEach(br => {
    if (!todayByCategory.has(br.categoria)) {
      todayByCategory.set(br.categoria, []);
    }
    todayByCategory.get(br.categoria)!.push(br);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2" style={{ background: "linear-gradient(135deg, #EE4D2D08 0%, #EE4D2D03 100%)" }}>
        <Calendar size={18} style={{ color: COLORS.orange }} />
        <h2 className="text-lg font-800" style={{ color: COLORS.orange }}>Hoje</h2>
        <span className="ml-auto text-xs font-700 text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{todayBRs.length} BRs</span>
      </div>

      {todayBRs.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-600">Nenhum BR cadastrado hoje</p>
          <p className="text-sm">Adicione o primeiro acima!</p>
        </div>
      ) : (
        <div className="p-6 space-y-3">
          {[...categories].map(cat => {
            const items = todayByCategory.get(cat.label) || [];
            if (items.length === 0) return null;
            return (
              <div key={cat.key} className="rounded-lg p-4 border-l-4" style={{ borderLeftColor: cat.color, background: cat.color + "08" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-700 uppercase" style={{ color: cat.color }}>{cat.label}</span>
                  <span className="text-sm font-800" style={{ color: cat.color }}>{items.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map(br => (
                    <span key={br.id} className="px-3 py-1.5 rounded-lg text-xs font-700 text-white" style={{ background: cat.color }}>
                      {br.code}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Section: Category Summary ─────────────────────────────────────────────────
function SectionCategorySummary({ categorySummary, categories }: {
  categorySummary: Record<string, number>;
  categories: readonly any[];
}) {
  const chartData = [...categories].map(cat => ({
    name: cat.label,
    value: categorySummary[cat.key] || 0,
    color: cat.color,
  }));

  const total = Object.values(categorySummary).reduce((s, v) => s + v, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} style={{ color: COLORS.orange }} />
        <h2 className="text-lg font-800" style={{ color: COLORS.orange }}>Por Categoria</h2>
        <span className="ml-auto text-sm font-700 text-gray-500">{formatNum(total)} total</span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number) => formatNum(v)} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[...categories].map(cat => (
          <div key={cat.key} className="rounded-lg p-3 text-center border border-gray-100">
            <p className="text-xs font-700 uppercase text-gray-500">{cat.label}</p>
            <p className="text-xl font-800 mt-1" style={{ color: cat.color }}>{formatNum(categorySummary[cat.key] || 0)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Weekly History ──────────────────────────────────────────────────
function SectionWeeklyHistory({ weeklyHistory }: { weeklyHistory: Record<string, number> }) {
  const chartData = Object.entries(weeklyHistory).map(([date, count]) => ({
    date: date.substring(0, 5),
    count,
  }));

  const total = Object.values(weeklyHistory).reduce((s, v) => s + v, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} style={{ color: COLORS.orange }} />
        <h2 className="text-lg font-800" style={{ color: COLORS.orange }}>Últimos 7 Dias</h2>
        <span className="ml-auto text-sm font-700 text-gray-500">{formatNum(total)} BRs</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number) => formatNum(v)} />
          <Line type="monotone" dataKey="count" stroke={COLORS.orange} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.orange }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Section: Search & Filter ─────────────────────────────────────────────────
function SectionSearch({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories }: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  categories: readonly any[];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Search size={18} style={{ color: COLORS.orange }} />
        <h2 className="text-lg font-800" style={{ color: COLORS.orange }}>Buscar & Filtrar</h2>
      </div>

      <input
        type="text"
        placeholder="Buscar por código BR..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-xs font-700 transition-all ${
            selectedCategory === null
              ? "text-white"
              : "border border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
          style={{ background: selectedCategory === null ? COLORS.orange : "transparent" }}
        >
          Todas
        </button>
        {[...categories].map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.label)}
            className={`px-4 py-2 rounded-lg text-xs font-700 transition-all ${
              selectedCategory === cat.label
                ? "text-white"
                : "border text-gray-600 hover:border-opacity-50"
            }`}
            style={{
              background: selectedCategory === cat.label ? cat.color : "transparent",
              borderColor: selectedCategory === cat.label ? cat.color : cat.color + "40",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Section: BR List ─────────────────────────────────────────────────────────
function SectionBRList({ filteredBRs, deleteBR }: {
  filteredBRs: any[];
  deleteBR: (id: string) => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function handleDelete(id: string) {
    deleteBR(id);
    setDeleteConfirm(null);
    toast.success("BR excluído", { icon: "🗑️" });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-800" style={{ color: COLORS.orange }}>Listagem de BRs</h2>
        <span className="text-xs font-700 text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{filteredBRs.length} registros</span>
      </div>

      {filteredBRs.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-400">
          <AlertTriangle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-600">Nenhum BR encontrado</p>
          <p className="text-sm">Tente ajustar os filtros</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-700 text-gray-500 uppercase">Código BR</th>
                <th className="px-4 py-3 text-left text-xs font-700 text-gray-500 uppercase">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-700 text-gray-500 uppercase">Data</th>
                <th className="px-4 py-3 text-center text-xs font-700 text-gray-500 uppercase">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredBRs.map(br => (
                <tr key={br.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-800 text-white" style={{ background: getCategoryColor(br.categoria) }}>
                      {br.code}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-600" style={{ color: getCategoryColor(br.categoria) }}>
                    {br.categoria}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{br.data}</td>
                  <td className="px-4 py-4 text-center">
                    {deleteConfirm === br.id ? (
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleDelete(br.id)} className="px-2 py-1 rounded text-xs bg-red-500 text-white font-700 hover:bg-red-600">Sim</button>
                        <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 font-700 hover:bg-gray-200">Não</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(br.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Section: Login ──────────────────────────────────────────────────────────
function SectionLogin({ login }: { login: (password: string) => boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (login(password)) {
      setPassword("");
      setError("");
      toast.success("Autenticado com sucesso!", { icon: "🔓" });
    } else {
      setError("Senha incorreta");
      inputRef.current?.focus();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F6F6F6" }}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-sm w-full">
        <div className="flex items-center justify-center mb-6">
          <Lock size={32} style={{ color: COLORS.orange }} />
        </div>
        <h1 className="text-2xl font-800 text-center mb-2" style={{ color: COLORS.orange }}>Gerenciador de BRs</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Digite a senha para acessar</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white text-sm font-700 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: COLORS.orange }}
          >
            Acessar
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Section: Batch Import ───────────────────────────────────────────────────
function SectionBatchImport({ importBatch, categories }: {
  importBatch: (text: string, categoria: string, customDate?: string) => number;
  categories: any[];
}) {
  const [text, setText] = useState("");
  const [categoria, setCategoria] = useState("OFFICE");
  const [date, setDate] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleImport() {
    if (!text.trim()) {
      toast.error("Cole os BRs primeiro");
      textareaRef.current?.focus();
      return;
    }

    if (!date) {
      toast.error("Selecione uma data");
      return;
    }

    const count = importBatch(text, categoria, date);
    if (count > 0) {
      toast.success(`${count} BRs importados como ${categoria}!`, { icon: "✅" });
      setText("");
      setDate("");
    } else {
      toast.error("Nenhum BR válido encontrado");
    }
  }

  const lineCount = text.split("\n").filter(line => line.trim().length > 0).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Upload size={20} style={{ color: COLORS.orange }} />
        <h2 className="text-lg font-800" style={{ color: COLORS.orange }}>Importar em Lote</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-700 text-gray-600 uppercase mb-2">Cole os BRs (um por linha)</label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="BR267391958008Z\nBR269903219612X\nBR262351766246C\n..."
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
            rows={8}
          />
          <p className="text-xs text-gray-400 mt-1">{lineCount} BRs detectados</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-700 text-gray-600 uppercase mb-2">Data</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-700 text-gray-600 uppercase mb-2">Categoria</label>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            >
              {[...categories].map(cat => (
                <option key={cat.key} value={cat.label}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleImport}
          className="w-full py-3 rounded-lg text-white text-sm font-700 transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ background: COLORS.orange }}
        >
          <Upload size={16} />
          Importar {lineCount} BRs
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BRManagement() {
  const {
    todayBRs,
    filteredBRs,
    categorySummary,
    weeklyHistory,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    addBR,
    deleteBR,
    clearAllBRs,
    importBatch,
    isAuth,
    login,
    logout,
    categories,

  } = useBRData();
  const [activeTab, setActiveTab] = useState<"brs">("brs");

  if (!isAuth) {
    return <SectionLogin login={login} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "#F6F6F6" }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm border-b-4 mb-6 px-6 py-5 flex items-center justify-between" style={{ borderBottomColor: COLORS.orange }}>
          <div className="flex items-center gap-4">
            <Zap size={28} style={{ color: COLORS.orange }} />
            <div>
              <h1 className="text-lg font-800" style={{ color: COLORS.orange }}>Gerenciador</h1>
              <p className="text-xs text-gray-500 font-500">BRs • Backlog • Logística Shopee</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm("Tem certeza que deseja limpar TODOS os dados?")) {
                  clearAllBRs();
                  toast.success("Todos os dados foram limpos");
                }
              }}
              className="px-4 py-2 rounded-lg text-xs font-700 text-red-600 border border-red-200 hover:bg-red-50 transition-all"
            >
              Limpar Dados
            </button>
            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="px-4 py-2 rounded-lg text-xs font-700 text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-1"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </header>



        {activeTab === "brs" && (
          <>
            {/* Batch Import Section */}
            <div className="mb-6">
              <SectionBatchImport importBatch={importBatch} categories={[...categories]} />
            </div>

            {/* Add BR Section */}
            <div className="mb-6">
              <SectionAddBR addBR={addBR} categories={[...categories]} />
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Left: Today Summary */}
              <div className="lg:col-span-1">
                <SectionTodaySummary todayBRs={todayBRs} categories={[...categories]} />
              </div>

              {/* Right: Category Summary + Weekly */}
              <div className="lg:col-span-2 space-y-6">
                <SectionCategorySummary categorySummary={categorySummary} categories={categories} />
                <SectionWeeklyHistory weeklyHistory={weeklyHistory} />
              </div>
            </div>

            {/* Search & Filter */}
            <div className="mb-6">
              <SectionSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
              />
            </div>

            {/* BR List */}
            <div className="mb-6">
              <SectionBRList filteredBRs={filteredBRs} deleteBR={deleteBR} />
            </div>
          </>
        )}



        {/* Footer */}
        <footer className="text-center py-8 text-xs text-gray-400">
          © 2026 Shopee • Gerenciador • Logística Carandiru
        </footer>
      </div>
    </div>
  );
}
