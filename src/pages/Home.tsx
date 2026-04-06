/**
 * Home.tsx - Shopee Backlog Carandiru
 * Design: Shopee brand identity (orange #EE4D2D primary)
 * Three tabs: Resumo Semanal | Adicionar Dados | Histórico Consolidado
 * Data persisted in localStorage via useBacklogData hook
 */

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  History,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Clock,
  Truck,
  Building2,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  ChevronDown,
  BarChart3,
  Zap,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useBacklogData, type DailyEntry } from "@/hooks/useBacklogData";

// ─── Brand Colors ────────────────────────────────────────────────────────────
const COLORS = {
  amarelo: "#F5C518",
  erro: "#EE4D2D",
  onhold: "#0055AA",
  fleet: "#26AA99",
  office: "#64748B",
  orange: "#EE4D2D",
};

const CATEGORY_LABELS = [
  { key: "onhold", label: "On Hold", color: COLORS.onhold, icon: Clock },
  { key: "amarelo", label: "Amarelo", color: COLORS.amarelo, icon: AlertTriangle },
  { key: "erro", label: "Erro Operacional", color: COLORS.erro, icon: Package },
  { key: "fleet", label: "Retirada Fleet", color: COLORS.fleet, icon: Truck },
  { key: "office", label: "OFFICE", color: COLORS.office, icon: Building2 },
] as const;

// ─── Helper ───────────────────────────────────────────────────────────────────
function getStatusInfo(total: number) {
  if (total < 9000) return { label: "OK", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" };
  if (total < 11000) return { label: "ATENÇÃO", bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" };
  return { label: "CRÍTICO", bg: "bg-red-50", text: "text-red-600", border: "border-red-200" };
}

function formatNum(n: number) {
  return n.toLocaleString("pt-BR");
}

function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-700 text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-800 text-gray-900">{typeof value === "number" ? formatNum(value) : value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Tab: Resumo Semanal ──────────────────────────────────────────────────────
function TabResumo({ weeklyData }: { weeklyData: ReturnType<typeof useBacklogData>["weeklyData"] }) {
  const [selectedWeek, setSelectedWeek] = useState<string>(() => {
    return weeklyData.length > 0 ? weeklyData[weeklyData.length - 1].semana : "";
  });

  const data = weeklyData.find(w => w.semana === selectedWeek) ?? weeklyData[weeklyData.length - 1];

  useEffect(() => {
    if (weeklyData.length > 0 && !weeklyData.find(w => w.semana === selectedWeek)) {
      setSelectedWeek(weeklyData[weeklyData.length - 1].semana);
    }
  }, [weeklyData, selectedWeek]);

  if (!data) return (
    <div className="text-center py-20 text-gray-400">
      <Package size={48} className="mx-auto mb-3 opacity-30" />
      <p className="font-600">Nenhum dado disponível</p>
      <p className="text-sm">Adicione dados na aba "Adicionar Dados"</p>
    </div>
  );

  const status = getStatusInfo(data.total);
  const pieData = CATEGORY_LABELS.map(c => ({ name: c.label, value: data[c.key], color: c.color }));
  const barData = data.datas.map((d, i) => ({
    dia: d,
    Amarelo: data.diario.amarelo[i],
    Erro: data.diario.erro[i],
    "On Hold": data.diario.onhold[i],
    Fleet: data.diario.fleet[i],
    Office: data.diario.office[i],
  }));

  const biggestCat = CATEGORY_LABELS.reduce((prev, curr) =>
    data[curr.key] > data[prev.key] ? curr : prev
  );

  return (
    <div>
      {/* Week selector */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Calendar size={16} className="text-shopee-orange" style={{ color: COLORS.orange }} />
          <span className="text-xs font-700 text-gray-500 uppercase">Semana:</span>
          <div className="relative">
            <select
              value={selectedWeek}
              onChange={e => setSelectedWeek(e.target.value)}
              className="appearance-none bg-transparent text-sm font-700 pr-6 outline-none"
              style={{ color: COLORS.orange }}
            >
              {[...weeklyData].reverse().map(w => (
                <option key={w.semana} value={w.semana}>{w.semana}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.orange }} />
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-700 border ${status.bg} ${status.text} ${status.border}`}>
          {status.label}
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Backlog" value={data.total} icon={BarChart3} color={COLORS.orange} />
        <StatCard label="Maior Categoria" value={biggestCat.label} sub={formatNum(data[biggestCat.key]) + " pacotes"} icon={biggestCat.icon} color={biggestCat.color} />
        <div className="col-span-2 lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-700 text-gray-500 uppercase tracking-wide mb-3">Por Categoria</p>
          <div className="space-y-2">
            {CATEGORY_LABELS.map(c => (
              <div key={c.key} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="text-xs text-gray-600 flex-1">{c.label}</span>
                <span className="text-xs font-700 text-gray-800">{formatNum(data[c.key])}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-700 mb-4 text-gray-800">Distribuição Diária — Semana {data.semana}</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatNum(v)} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              {CATEGORY_LABELS.map(c => (
                <Bar key={c.key} dataKey={c.label === "On Hold" ? "On Hold" : c.label === "Retirada Fleet" ? "Fleet" : c.label === "Erro Operacional" ? "Erro" : c.label} stackId="a" fill={c.color} radius={[0,0,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-700 mb-4 text-gray-800">Distribuição %</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatNum(v)} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily detail table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-700 text-gray-800">Detalhamento Diário</h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-700 ${status.bg} ${status.text}`}>{status.label}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-700 text-gray-500 uppercase">Categoria</th>
                {data.datas.map((d, i) => (
                  <th key={i} className="px-3 py-3 text-right text-xs font-700 text-gray-500 uppercase">{["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"][i]} {d}</th>
                ))}
                <th className="px-5 py-3 text-right text-xs font-700 text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_LABELS.map(c => (
                <tr key={c.key} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-600 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    {c.label}
                  </td>
                  {data.diario[c.key].map((v, i) => (
                    <td key={i} className="px-3 py-3 text-right text-gray-700">{v === 0 ? <span className="text-gray-300">—</span> : formatNum(v)}</td>
                  ))}
                  <td className="px-5 py-3 text-right font-700" style={{ color: c.color }}>{formatNum(data[c.key])}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="px-5 py-3 font-800 text-gray-800">TOTAL DIÁRIO</td>
                {data.datas.map((_, i) => {
                  const dayTotal = data.diario.amarelo[i] + data.diario.erro[i] + data.diario.onhold[i] + data.diario.fleet[i] + data.diario.office[i];
                  return <td key={i} className="px-3 py-3 text-right font-700" style={{ color: COLORS.orange }}>{formatNum(dayTotal)}</td>;
                })}
                <td className="px-5 py-3 text-right font-800 text-lg" style={{ color: COLORS.orange }}>{formatNum(data.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Adicionar Dados ─────────────────────────────────────────────────────
function TabAddData({ addEntry, updateEntry, deleteEntry, getEntryByDate, entries }: {
  addEntry: ReturnType<typeof useBacklogData>["addEntry"];
  updateEntry: ReturnType<typeof useBacklogData>["updateEntry"];
  deleteEntry: ReturnType<typeof useBacklogData>["deleteEntry"];
  getEntryByDate: ReturnType<typeof useBacklogData>["getEntryByDate"];
  entries: DailyEntry[];
}) {
  const [date, setDate] = useState(todayStr());
  const [form, setForm] = useState({ onhold: "", amarelo: "", erro: "", fleet: "", office: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Check if entry already exists for the selected date
  const existingEntry = getEntryByDate(date);

  // When date changes, pre-fill form if entry exists
  function handleDateChange(newDate: string) {
    setDate(newDate);
    setEditingId(null);
    const existing = getEntryByDate(newDate);
    if (existing) {
      setForm({
        onhold: String(existing.onhold),
        amarelo: String(existing.amarelo),
        erro: String(existing.erro),
        fleet: String(existing.fleet),
        office: String(existing.office),
      });
      setEditingId(existing.id);
    } else {
      setForm({ onhold: "", amarelo: "", erro: "", fleet: "", office: "" });
    }
  }

  function handleInput(key: keyof typeof form, value: string) {
    if (/^\d*$/.test(value)) setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) { toast.error("Selecione uma data"); return; }

    const vals = {
      date,
      onhold: parseInt(form.onhold || "0"),
      amarelo: parseInt(form.amarelo || "0"),
      erro: parseInt(form.erro || "0"),
      fleet: parseInt(form.fleet || "0"),
      office: parseInt(form.office || "0"),
    };

    if (editingId) {
      updateEntry(editingId, vals);
      toast.success(`Dados de ${date} atualizados com sucesso!`, { icon: "✅" });
    } else {
      addEntry(vals);
      toast.success(`Dados de ${date} salvos com sucesso!`, { icon: "✅" });
    }

    setForm({ onhold: "", amarelo: "", erro: "", fleet: "", office: "" });
    setEditingId(null);
    setDate(todayStr());
  }

  function handleEdit(entry: DailyEntry) {
    setDate(entry.date);
    setEditingId(entry.id);
    setForm({
      onhold: String(entry.onhold),
      amarelo: String(entry.amarelo),
      erro: String(entry.erro),
      fleet: String(entry.fleet),
      office: String(entry.office),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    deleteEntry(id);
    setDeleteConfirm(null);
    toast.success("Registro excluído", { icon: "🗑️" });
    if (editingId === id) {
      setEditingId(null);
      setForm({ onhold: "", amarelo: "", erro: "", fleet: "", office: "" });
    }
  }

  const total = Object.values(form).reduce((s, v) => s + (parseInt(v) || 0), 0);
  const recentEntries = entries.slice(0, 15);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #EE4D2D08 0%, #EE4D2D03 100%)" }}>
            <div className="flex items-center gap-2">
              <PlusCircle size={18} style={{ color: COLORS.orange }} />
              <h3 className="text-sm font-700 text-gray-800">
                {editingId ? "Editar Registro" : "Adicionar Dados Diários"}
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">Preencha os valores por categoria para a data selecionada</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Date input */}
            <div>
              <label className="block text-xs font-700 text-gray-600 uppercase mb-1.5">
                <Calendar size={12} className="inline mr-1" />
                Data
              </label>
              <input
                type="text"
                placeholder="DD/MM/AAAA"
                value={date}
                onChange={e => handleDateChange(e.target.value)}
                maxLength={10}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-600 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              {existingEntry && !editingId && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle size={11} />
                  Já existe um registro para esta data. Será atualizado ao salvar.
                </p>
              )}
            </div>

            {/* Category inputs */}
            {CATEGORY_LABELS.map(c => (
              <div key={c.key}>
                <label className="block text-xs font-700 uppercase mb-1.5 flex items-center gap-1.5" style={{ color: c.color }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  {c.label}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={form[c.key]}
                  onChange={e => handleInput(c.key, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-600 outline-none transition-all"
                  style={{ "--tw-ring-color": c.color + "40" } as React.CSSProperties}
                  onFocus={e => { e.target.style.borderColor = c.color; e.target.style.boxShadow = `0 0 0 3px ${c.color}20`; }}
                  onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
                />
              </div>
            ))}

            {/* Total preview */}
            <div className="rounded-lg p-3 flex items-center justify-between" style={{ background: COLORS.orange + "0D", border: `1px solid ${COLORS.orange}20` }}>
              <span className="text-xs font-700 text-gray-600 uppercase">Total Calculado</span>
              <span className="text-xl font-800" style={{ color: COLORS.orange }}>{formatNum(total)}</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white text-sm font-700 transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: COLORS.orange }}
            >
              <CheckCircle2 size={16} />
              {editingId ? "Atualizar Registro" : "Salvar Dados"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm({ onhold: "", amarelo: "", erro: "", fleet: "", office: "" }); setDate(todayStr()); }}
                className="w-full py-2.5 rounded-xl text-gray-600 text-sm font-600 border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Cancelar Edição
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Recent entries */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-700 text-gray-800">Registros Recentes</h3>
            <p className="text-xs text-gray-500 mt-0.5">{entries.length} registros no total</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-700 text-gray-500 uppercase">Data</th>
                  <th className="px-3 py-3 text-right text-xs font-700 uppercase" style={{ color: COLORS.onhold }}>On Hold</th>
                  <th className="px-3 py-3 text-right text-xs font-700 uppercase" style={{ color: COLORS.amarelo }}>Amarelo</th>
                  <th className="px-3 py-3 text-right text-xs font-700 uppercase" style={{ color: COLORS.erro }}>Erro</th>
                  <th className="px-3 py-3 text-right text-xs font-700 uppercase" style={{ color: COLORS.fleet }}>Fleet</th>
                  <th className="px-3 py-3 text-right text-xs font-700 uppercase" style={{ color: COLORS.office }}>Office</th>
                  <th className="px-3 py-3 text-right text-xs font-700 text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-700 text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">
                      Nenhum registro encontrado. Adicione o primeiro!
                    </td>
                  </tr>
                ) : recentEntries.map(entry => (
                  <tr key={entry.id} className={`border-t border-gray-50 hover:bg-gray-50/50 transition-colors ${editingId === entry.id ? "bg-orange-50" : ""}`}>
                    <td className="px-4 py-3 font-700 text-gray-800">{entry.date}</td>
                    <td className="px-3 py-3 text-right font-600" style={{ color: COLORS.onhold }}>{formatNum(entry.onhold)}</td>
                    <td className="px-3 py-3 text-right font-600" style={{ color: COLORS.amarelo }}>{formatNum(entry.amarelo)}</td>
                    <td className="px-3 py-3 text-right font-600" style={{ color: COLORS.erro }}>{formatNum(entry.erro)}</td>
                    <td className="px-3 py-3 text-right font-600" style={{ color: COLORS.fleet }}>{formatNum(entry.fleet)}</td>
                    <td className="px-3 py-3 text-right font-600" style={{ color: COLORS.office }}>{formatNum(entry.office)}</td>
                    <td className="px-3 py-3 text-right font-800" style={{ color: COLORS.orange }}>{formatNum(entry.total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        {deleteConfirm === entry.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(entry.id)} className="px-2 py-1 rounded text-xs bg-red-500 text-white font-700 hover:bg-red-600">Sim</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 font-700 hover:bg-gray-200">Não</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(entry.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {entries.length > 15 && (
            <div className="px-5 py-3 border-t border-gray-100 text-center text-xs text-gray-400">
              Mostrando os 15 mais recentes de {entries.length} registros
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Histórico Consolidado ───────────────────────────────────────────────
function TabHistorico({ weeklyData }: { weeklyData: ReturnType<typeof useBacklogData>["weeklyData"] }) {
  const sorted = [...weeklyData].sort((a, b) => b.total - a.total);
  const best = [...weeklyData].sort((a, b) => a.total - b.total)[0];
  const worst = sorted[0];

  const lineData = weeklyData.map(w => ({ semana: w.semana, total: w.total }));

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {best && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingDown size={22} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-700 text-gray-500 uppercase">Melhor Semana</p>
              <p className="text-2xl font-800 text-emerald-600">{formatNum(best.total)}</p>
              <p className="text-xs text-gray-400">{best.semana}</p>
            </div>
          </div>
        )}
        {worst && (
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingUp size={22} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs font-700 text-gray-500 uppercase">Pior Semana</p>
              <p className="text-2xl font-800 text-red-500">{formatNum(worst.total)}</p>
              <p className="text-xs text-gray-400">{worst.semana}</p>
            </div>
          </div>
        )}
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <p className="text-sm font-700 text-gray-800 mb-4">Evolução do Backlog Total</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis dataKey="semana" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => formatNum(v)} />
            <Area type="monotone" dataKey="total" stroke={COLORS.orange} strokeWidth={2.5} fill="url(#totalGrad)" dot={{ r: 5, fill: COLORS.orange }} activeDot={{ r: 7 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-700 text-gray-800 mb-4">Volume por Categoria (Última Semana)</p>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={CATEGORY_LABELS.map(c => ({ name: c.label, value: weeklyData[weeklyData.length - 1][c.key], color: c.color }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatNum(v)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {CATEGORY_LABELS.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-10">Sem dados</p>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-700 text-gray-800 mb-4">Distribuição % (Última Semana)</p>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={CATEGORY_LABELS.map(c => ({ name: c.label, value: weeklyData[weeklyData.length - 1][c.key], color: c.color }))}
                  cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value"
                >
                  {CATEGORY_LABELS.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatNum(v)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-10">Sem dados</p>}
        </div>
      </div>

      {/* Historical table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-700 text-gray-800">Tabela Histórica Semanal</h3>
          <span className="text-xs text-gray-400 font-600">{weeklyData.length} semanas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-700 text-gray-500 uppercase">Semana</th>
                <th className="px-4 py-3 text-right text-xs font-700 text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-right text-xs font-700 uppercase" style={{ color: COLORS.onhold }}>On Hold</th>
                <th className="px-4 py-3 text-right text-xs font-700 uppercase" style={{ color: COLORS.amarelo }}>Amarelo</th>
                <th className="px-4 py-3 text-right text-xs font-700 uppercase" style={{ color: COLORS.erro }}>Erro</th>
                <th className="px-4 py-3 text-right text-xs font-700 uppercase" style={{ color: COLORS.fleet }}>Fleet</th>
                <th className="px-4 py-3 text-right text-xs font-700 uppercase" style={{ color: COLORS.office }}>Office</th>
                <th className="px-4 py-3 text-center text-xs font-700 text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...weeklyData].reverse().map(w => {
                const st = getStatusInfo(w.total);
                return (
                  <tr key={w.semana} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-700 text-gray-800">{w.semana}</td>
                    <td className="px-4 py-3 text-right font-800" style={{ color: COLORS.orange }}>{formatNum(w.total)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatNum(w.onhold)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatNum(w.amarelo)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatNum(w.erro)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatNum(w.fleet)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatNum(w.office)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-700 ${st.bg} ${st.text}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = "resumo" | "historico";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("resumo");
  const [refreshKey, setRefreshKey] = useState(0);
  const { entries, weeklyData, addEntry, updateEntry, deleteEntry, getEntryByDate } = useBacklogData();

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "resumo", label: "Resumo Semanal", icon: LayoutDashboard },
    { id: "historico", label: "Histórico", icon: History },
  ];

  const handleNavigateToBR = () => {
    window.location.href = "/br";
  };

  const handleNavigateToBRView = () => {
    window.location.href = "/br-view";
  };

  return (
    <div className="min-h-screen" style={{ background: "#F6F6F6" }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm border-b-4 mb-6 px-6 py-5 flex items-center justify-between" style={{ borderBottomColor: COLORS.orange }}>
          <div className="flex items-center gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/1200px-Shopee_logo.svg.png"
              alt="Shopee"
              className="h-8"
            />
            <div className="w-px h-6 bg-gray-200" />
            <div>
              <h1 className="text-lg font-800" style={{ color: COLORS.orange }}>Backlog Carandiru</h1>
              <p className="text-xs text-gray-500 font-500">Relatório Logístico • Emanuel Brendon</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400 font-500">Dados salvos automaticamente</p>
            <p className="text-xs text-gray-500 font-600">{entries.length} registros diários</p>
          </div>
        </header>

        {/* Navigation tabs */}
        <div className="flex gap-2 mb-6 bg-gray-200 p-1.5 rounded-xl w-fit flex-wrap">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-700 transition-all ${
                  activeTab === tab.id
                    ? "bg-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={activeTab === tab.id ? { color: COLORS.orange } : {}}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
          <div className="border-l border-gray-300 mx-1" />
          <button
            onClick={handleNavigateToBR}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-700 text-gray-500 hover:text-gray-700 hover:bg-white transition-all"
            title="Ir para Gerenciador de BRs"
          >
            <Zap size={15} />
            <span className="hidden sm:inline">Gerenciar BRs</span>
            <span className="sm:hidden">BRs</span>
          </button>
          <button
            onClick={handleNavigateToBRView}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-700 text-gray-500 hover:text-gray-700 hover:bg-white transition-all"
            title="Visualizar BRs"
          >
            <Eye size={15} />
            <span className="hidden sm:inline">Visualizar BRs</span>
            <span className="sm:hidden">Ver</span>
          </button>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "resumo" && <TabResumo weeklyData={weeklyData} />}
          {activeTab === "historico" && <TabHistorico weeklyData={weeklyData} />}
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-xs text-gray-400">
          © 2026 Shopee • Backlog Carandiru • Desenvolvido por Emanuel Brendon
        </footer>
      </div>
    </div>
  );
}
