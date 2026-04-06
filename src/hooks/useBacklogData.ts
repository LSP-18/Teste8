/**
 * useBacklogData - Custom hook for managing Shopee Backlog data
 * Design: Shopee brand identity (orange #EE4D2D), data persisted in localStorage
 *
 * Data structure:
 * - DailyEntry: one record per day with all 5 categories
 * - WeeklyData: aggregated view grouped by week (for historico)
 */

import { useState, useCallback, useMemo, useEffect } from "react";

export interface DailyEntry {
  id: string;
  date: string; // "DD/MM/YYYY"
  amarelo: number;
  erro: number;
  onhold: number;
  fleet: number;
  office: number;
  total: number;
  createdAt: string;
}

export interface WeeklyData {
  semana: string; // "DD/MM - DD/MM"
  total: number;
  amarelo: number;
  erro: number;
  onhold: number;
  fleet: number;
  office: number;
  datas: string[];
  diario: {
    amarelo: number[];
    erro: number[];
    onhold: number[];
    fleet: number[];
    office: number[];
  };
}

const STORAGE_KEY = "shopee_backlog_entries";

// Seed data from the original HTML files
const SEED_DATA: DailyEntry[] = [
  // Semana 30/03 - 05/04
  ...["30/03/2026","31/03/2026","01/04/2026","02/04/2026","03/04/2026","04/04/2026","05/04/2026"].map((date, i) => {
    const amarelo = [149,51,149,82,209,177,57][i];
    const erro = [233,178,230,198,361,147,165][i];
    const onhold = [502,252,61,37,2099,45,29][i];
    const fleet = [272,109,87,162,187,65,120][i];
    const office = [0,0,0,0,3010,2484,987][i];
    return {
      id: `seed-4-${i}`,
      date: date.substring(0,5) + "/" + date.substring(6),
      amarelo, erro, onhold, fleet, office,
      total: amarelo + erro + onhold + fleet + office,
      createdAt: new Date(2026, 2, 30 + i).toISOString()
    };
  }),
];

function countBRsByDateAndCategory(date: string): { amarelo: number; erro: number; onhold: number; fleet: number; office: number } {
  try {
    const brRaw = localStorage.getItem("shopee_br_data");
    if (!brRaw) return { amarelo: 0, erro: 0, onhold: 0, fleet: 0, office: 0 };
    
    const brs = JSON.parse(brRaw) as any[];
    const counts = { amarelo: 0, erro: 0, onhold: 0, fleet: 0, office: 0 };
    
    const [d, m, y] = date.split("/");
    const targetDate = `${y}-${m}-${d}`;
    
    for (const br of brs) {
      if (br.data === targetDate) {
        const cat = br.categoria.toLowerCase();
        if (cat.includes("amarelo")) counts.amarelo++;
        else if (cat.includes("erro")) counts.erro++;
        else if (cat.includes("hold")) counts.onhold++;
        else if (cat.includes("fleet")) counts.fleet++;
        else if (cat.includes("office")) counts.office++;
      }
    }
    return counts;
  } catch {
    return { amarelo: 0, erro: 0, onhold: 0, fleet: 0, office: 0 };
  }
}

function mergeWithBRBacklog(entries: DailyEntry[]): DailyEntry[] {
  try {
    const result = entries.map(entry => {
      const brCounts = countBRsByDateAndCategory(entry.date);
      const hasBRs = brCounts.amarelo + brCounts.erro + brCounts.onhold + brCounts.fleet + brCounts.office > 0;
      return {
        ...entry,
        amarelo: hasBRs ? brCounts.amarelo : entry.amarelo,
        erro: hasBRs ? brCounts.erro : entry.erro,
        onhold: hasBRs ? brCounts.onhold : entry.onhold,
        fleet: hasBRs ? brCounts.fleet : entry.fleet,
        office: hasBRs ? brCounts.office : entry.office,
        total: hasBRs ? (brCounts.amarelo + brCounts.erro + brCounts.onhold + brCounts.fleet + brCounts.office) : entry.total,
      };
    });
    
    const brRaw = localStorage.getItem("shopee_br_data");
    if (brRaw) {
      const brs = JSON.parse(brRaw) as any[];
      const uniqueDates = new Set(brs.map((br: any) => {
        const [y, m, d] = br.data.split("-");
        return `${d}/${m}/${y}`;
      }));
      
      for (const dateStr of Array.from(uniqueDates)) {
        if (!result.find(e => e.date === dateStr)) {
          const brCounts = countBRsByDateAndCategory(dateStr);
          result.push({
            id: `br-auto-${dateStr}`,
            date: dateStr,
            amarelo: brCounts.amarelo,
            erro: brCounts.erro,
            onhold: brCounts.onhold,
            fleet: brCounts.fleet,
            office: brCounts.office,
            total: brCounts.amarelo + brCounts.erro + brCounts.onhold + brCounts.fleet + brCounts.office,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
    return result;
  } catch {
    return entries;
  }
}

function loadEntries(): DailyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const entries = JSON.parse(raw) as DailyEntry[];
      return mergeWithBRBacklog(entries);
    }
  } catch {
    // ignore
  }
  const merged = mergeWithBRBacklog(SEED_DATA);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

function saveEntries(entries: DailyEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function parseDateToTimestamp(dateStr: string): number {
  // dateStr: "DD/MM/YYYY"
  const [d, m, y] = dateStr.split("/").map(Number);
  return new Date(y, m - 1, d).getTime();
}

function getWeekKey(dateStr: string): string {
  // Returns "DD/MM - DD/MM" for the week (Mon-Sun) containing the date
  const [d, m, y] = dateStr.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0=Sun, 1=Mon...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(date);
  mon.setDate(date.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (dt: Date) =>
    `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(mon)} - ${fmt(sun)}`;
}

function groupByWeek(entries: DailyEntry[]): WeeklyData[] {
  const weekMap = new Map<string, DailyEntry[]>();
  for (const entry of entries) {
    const key = getWeekKey(entry.date);
    if (!weekMap.has(key)) weekMap.set(key, []);
    weekMap.get(key)!.push(entry);
  }

  const weeks: WeeklyData[] = [];
  weekMap.forEach((dayEntries, semana) => {
    // Sort days within week
    dayEntries.sort((a, b) => parseDateToTimestamp(a.date) - parseDateToTimestamp(b.date));

    const amarelo = dayEntries.reduce((s, e) => s + e.amarelo, 0);
    const erro = dayEntries.reduce((s, e) => s + e.erro, 0);
    const onhold = dayEntries.reduce((s, e) => s + e.onhold, 0);
    const fleet = dayEntries.reduce((s, e) => s + e.fleet, 0);
    const office = dayEntries.reduce((s, e) => s + e.office, 0);

    // Build 7-slot arrays (Mon-Sun), filling missing days with 0
    const [monStr] = semana.split(" - ");
    const [md, mm] = monStr.split("/").map(Number);
    const monDate = new Date(dayEntries[0] ? parseDateToTimestamp(dayEntries[0].date) : Date.now());
    // find monday
    const firstDate = new Date(parseDateToTimestamp(dayEntries[0].date));
    const dayOfWeek = firstDate.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(firstDate);
    monday.setDate(firstDate.getDate() + diffToMon);

    const datas: string[] = [];
    const diario = { amarelo: [] as number[], erro: [] as number[], onhold: [] as number[], fleet: [] as number[], office: [] as number[] };

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      datas.push(`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`);
      const found = dayEntries.find(e => e.date === dateStr);
      diario.amarelo.push(found?.amarelo ?? 0);
      diario.erro.push(found?.erro ?? 0);
      diario.onhold.push(found?.onhold ?? 0);
      diario.fleet.push(found?.fleet ?? 0);
      diario.office.push(found?.office ?? 0);
    }

    weeks.push({ semana, total: amarelo + erro + onhold + fleet + office, amarelo, erro, onhold, fleet, office, datas, diario });
  });

  // Sort weeks chronologically
  weeks.sort((a, b) => {
    const [ad] = a.semana.split(" - ");
    const [bd] = b.semana.split(" - ");
    const [ad2, am2] = ad.split("/").map(Number);
    const [bd2, bm2] = bd.split("/").map(Number);
    if (am2 !== bm2) return am2 - bm2;
    return ad2 - bd2;
  });

  return weeks;
}

export function useBacklogData() {
  const [entries, setEntries] = useState<DailyEntry[]>(() => loadEntries());
  const [syncTrigger, setSyncTrigger] = useState(0);

  const addEntry = useCallback((entry: Omit<DailyEntry, "id" | "total" | "createdAt">) => {
    const newEntry: DailyEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      total: entry.amarelo + entry.erro + entry.onhold + entry.fleet + entry.office,
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => {
      const updated = [...prev, newEntry];
      saveEntries(updated);
      return updated;
    });
    return newEntry;
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<Omit<DailyEntry, "id" | "createdAt">>) => {
    setEntries(prev => {
      const updated = prev.map(e => {
        if (e.id !== id) return e;
        const merged = { ...e, ...updates };
        merged.total = merged.amarelo + merged.erro + merged.onhold + merged.fleet + merged.office;
        return merged;
      });
      saveEntries(updated);
      return updated;
    });
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveEntries(updated);
      return updated;
    });
  }, []);

  const getEntryByDate = useCallback((date: string) => {
    return entries.find(e => e.date === date);
  }, [entries]);

  // Recalculate weekly data whenever entries change or sync trigger updates
  const weeklyData = useMemo(() => {
    const merged = mergeWithBRBacklog(entries);
    return groupByWeek(merged);
  }, [entries, syncTrigger]);

  const sortedEntries = [...entries].sort(
    (a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date)
  );

  // Check for changes in backlog storage every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTrigger(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    entries: sortedEntries,
    weeklyData,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryByDate,
  };
}
