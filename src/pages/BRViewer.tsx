/**
 * BRViewer.tsx - BR (Bills of Lading) Viewer (Read-Only)
 * Design: Shopee brand identity (orange #EE4D2D primary)
 * Features: Buscar, Filtrar, Listagem (sem edição)
 */

import { useState } from "react";
import {
  Search,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Zap,
  LogOut,
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
function SectionBRList({ filteredBRs }: {
  filteredBRs: any[];
}) {
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BRViewer() {
  const {
    filteredBRs,
    categorySummary,
    weeklyHistory,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
  } = useBRData();

  return (
    <div className="min-h-screen" style={{ background: "#F6F6F6" }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm border-b-4 mb-6 px-6 py-5 flex items-center justify-between" style={{ borderBottomColor: COLORS.orange }}>
          <div className="flex items-center gap-4">
            <Zap size={28} style={{ color: COLORS.orange }} />
            <div>
              <h1 className="text-lg font-800" style={{ color: COLORS.orange }}>Visualizar BRs</h1>
              <p className="text-xs text-gray-500 font-500">Bills of Lading • Logística Shopee</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-700 text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: COLORS.orange }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left: Category Summary */}
          <div className="lg:col-span-1">
            <SectionCategorySummary categorySummary={categorySummary} categories={categories} />
          </div>

          {/* Right: Weekly History */}
          <div className="lg:col-span-2">
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
          <SectionBRList filteredBRs={filteredBRs} />
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-xs text-gray-400">
          © 2026 Shopee • Visualizar BRs • Logística Carandiru
        </footer>
      </div>
    </div>
  );
}
