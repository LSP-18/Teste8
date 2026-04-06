/**
 * useBRData - Custom hook for managing BR (Bills of Lading) data
 * Design: Shopee brand identity with localStorage persistence
 *
 * Data structure:
 * - BR: code, categoria, data (YYYY-MM-DD format for easy sorting)
 */

import { useState, useCallback, useMemo } from "react";

export interface BR {
  id: string;
  code: string;
  categoria: string;
  data: string;
  createdAt: string;
}

interface BacklogEntry {
  id: string;
  data: string;
  onHold: number;
  amarelo: number;
  erro: number;
  fleet: number;
  office: number;
  createdAt: string;
}

const STORAGE_KEY = "shopee_br_data";
const BACKLOG_STORAGE_KEY = "shopee_backlog_data";

const BR_CATEGORIES = [
  { key: "amarelo", label: "Amarelo", color: "#F5C518" },
  { key: "erro_operacional", label: "Erro operacional", color: "#EE4D2D" },
  { key: "on_hold", label: "On hold", color: "#0055AA" },
  { key: "retirada_fleet", label: "Retirada Fleet", color: "#26AA99" },
  { key: "office", label: "OFFICE", color: "#64748B" },
] as const;

function loadBRs(): BR[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as BR[];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveBRs(brs: BR[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brs));
}

function loadBacklogEntries(): BacklogEntry[] {
  try {
    const raw = localStorage.getItem(BACKLOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBacklogEntries(entries: BacklogEntry[]): void {
  localStorage.setItem(BACKLOG_STORAGE_KEY, JSON.stringify(entries));
}

function todayStr(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function dateToTimestamp(dateStr: string): number {
  // dateStr: "DD/MM/YYYY"
  const [d, m, y] = dateStr.split("/").map(Number);
  return new Date(y, m - 1, d).getTime();
}

const AUTH_KEY = "shopee_br_auth";
const DEFAULT_PASSWORD = "shopee2026";

export function useBRData() {
  const [brs, setBRs] = useState<BR[]>(loadBRs());
  const [backlogEntries, setBacklogEntries] = useState<BacklogEntry[]>(loadBacklogEntries());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [authenticated, setAuthenticated] = useState(isAuth);

  // BR-related functions
  const todayBRs = useMemo(() => {
    const today = todayStr();
    return brs.filter(br => br.data === today);
  }, [brs]);

  const filteredBRs = useMemo(() => {
    let result = brs;
    if (searchTerm) {
      result = result.filter(br => br.code.toUpperCase().includes(searchTerm.toUpperCase()));
    }
    if (selectedCategory) {
      result = result.filter(br => br.categoria === selectedCategory);
    }
    return result;
  }, [brs, searchTerm, selectedCategory]);

  const groupedByCategory = useMemo(() => {
    const grouped: Record<string, BR[]> = {};
    filteredBRs.forEach(br => {
      if (!grouped[br.categoria]) {
        grouped[br.categoria] = [];
      }
      grouped[br.categoria].push(br);
    });
    return grouped;
  }, [filteredBRs]);

  const categorySummary = useMemo(() => {
    const summary: Record<string, number> = {};
    [...BR_CATEGORIES].forEach(cat => {
      summary[cat.key] = filteredBRs.filter(br => br.categoria === cat.label).length;
    });
    return summary;
  }, [filteredBRs]);

  const weeklyHistory = useMemo(() => {
    const history: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      const count = brs.filter(br => br.data === dateStr).length;
      history[dateStr] = count;
    }
    return history;
  }, [brs]);

  const addBR = useCallback((code: string, categoria: string) => {
    if (!code.trim()) return;
    const newBR: BR = {
      id: `br-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      code: code.toUpperCase(),
      categoria,
      data: todayStr(),
      createdAt: new Date().toISOString(),
    };
    setBRs(prev => {
      const updated = [newBR, ...prev];
      saveBRs(updated);
      return updated;
    });
  }, []);

  const deleteBR = useCallback((id: string) => {
    setBRs(prev => {
      const updated = prev.filter(br => br.id !== id);
      saveBRs(updated);
      return updated;
    });
  }, []);

  const clearAllBRs = useCallback(() => {
    setBRs([]);
    saveBRs([]);
  }, []);

  // Sort BRs by date (newest first)
  const sortedBRs = useMemo(() => {
    return [...brs].sort((a, b) => dateToTimestamp(b.data) - dateToTimestamp(a.data));
  }, [brs]);

  const importBatch = useCallback((text: string, categoria: string, customDate?: string) => {
    const lines = text
      .split("\n")
      .map(line => line.trim().toUpperCase())
      .filter(line => line.length > 0);

    let added = 0;
    const newBRs: BR[] = [];
    const dateToUse = customDate || todayStr();

    lines.forEach(code => {
      const newBR: BR = {
        id: `br-${Date.now()}-${Math.random().toString(36).slice(2)}-${added}`,
        code,
        categoria,
        data: dateToUse,
        createdAt: new Date().toISOString(),
      };
      newBRs.push(newBR);
      added++;
    });

    if (newBRs.length > 0) {
      setBRs(prev => {
        const updated = [...newBRs, ...prev];
        saveBRs(updated);
        return updated;
      });
    }

    return added;
  }, []);

  const login = useCallback((password: string): boolean => {
    if (password === DEFAULT_PASSWORD) {
      setAuthenticated(true);
      setIsAuth(true);
      localStorage.setItem(AUTH_KEY, "true");
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuthenticated(false);
    setIsAuth(false);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  // Backlog-related functions
  const addBacklogEntry = useCallback((data: string, onHold: number, amarelo: number, erro: number, fleet: number, office: number) => {
    const newEntry: BacklogEntry = {
      id: `backlog-${Date.now()}`,
      data,
      onHold,
      amarelo,
      erro,
      fleet,
      office,
      createdAt: new Date().toISOString(),
    };
    setBacklogEntries(prev => {
      const updated = [...prev, newEntry];
      saveBacklogEntries(updated);
      return updated;
    });
  }, []);

  const updateBacklogEntry = useCallback((id: string, onHold: number, amarelo: number, erro: number, fleet: number, office: number) => {
    setBacklogEntries(prev => {
      const updated = prev.map(entry =>
        entry.id === id
          ? { ...entry, onHold, amarelo, erro, fleet, office }
          : entry
      );
      saveBacklogEntries(updated);
      return updated;
    });
  }, []);

  const deleteBacklogEntry = useCallback((id: string) => {
    setBacklogEntries(prev => {
      const updated = prev.filter(entry => entry.id !== id);
      saveBacklogEntries(updated);
      return updated;
    });
  }, []);

  const getBacklogByDate = useCallback((date: string): BacklogEntry | undefined => {
    return backlogEntries.find(entry => entry.data === date);
  }, [backlogEntries]);

  return {
    // BR data
    brs: sortedBRs,
    todayBRs,
    filteredBRs,
    groupedByCategory,
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
    categories: BR_CATEGORIES,
    // Backlog data
    backlogEntries,
    addBacklogEntry,
    updateBacklogEntry,
    deleteBacklogEntry,
    getBacklogByDate,
  };
}
