import { useState, useEffect, useCallback } from "react";
import { listFiles, DriveFile } from "../services/driveService";
import { useAuth } from "../contexts/AuthContext";

export interface DashboardItem {
  key: string; // YYYYMMDD + Theme
  theme: string;
  roteiro: DriveFile | null;
  card: DriveFile | null;
  status: "pending" | "done" | "error"; // pending (red), done (green)
}

export const useDashboardData = () => {
  const { accessToken, isAuthenticated } = useAuth();
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const files = await listFiles(accessToken);
      
      // 1. Filter Roteiros and Cards
      const roteiros = files.filter(f => f.name.includes("_01_ROTEIRO_"));
      const cards = files.filter(f => f.name.includes("_02_CARD_"));

      // 2. Map to DashboardItems
      const itemMap = new Map<string, DashboardItem>();

      // Process Roteiros first
      roteiros.forEach(roteiro => {
        // Name format: YYYYMMDD_01_ROTEIRO_Theme
        // Key: YYYYMMDD + Theme
        const parts = roteiro.name.split("_01_ROTEIRO_");
        if (parts.length === 2) {
            const datePart = parts[0]; // YYYYMMDD
            const themePart = parts[1].replace(/\.[^/.]+$/, ""); // Remove extension
            const key = datePart + themePart;

            itemMap.set(key, {
                key,
                theme: themePart,
                roteiro: roteiro,
                card: null,
                status: "pending"
            });
        }
      });

      // Match Cards
      cards.forEach(card => {
         // Name format: YYYYMMDD_02_CARD_Theme
         const parts = card.name.split("_02_CARD_");
         if (parts.length === 2) {
             const datePart = parts[0];
             const themePart = parts[1].replace(/\.[^/.]+$/, "");
             const key = datePart + themePart;

             if (itemMap.has(key)) {
                 const item = itemMap.get(key)!;
                 item.card = card;
                 item.status = "done";
             } else {
                 // Orphan card? Or maybe just list it? 
                 // Spec focuses on "Roteiros pendentes", but let's handle orphans if needed later.
                 // For now, only Roteiro-driven items.
             }
         }
      });

      // Sort by date desc (assuming YYYYMMDD at start of key)
      const sortedItems = Array.from(itemMap.values()).sort((a, b) => b.key.localeCompare(a.key));
      
      setItems(sortedItems);

    } catch (err) {
      console.error(err);
      setError("Falha ao carregar dados do Dashboard.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    }
  }, [isAuthenticated, refresh]);

  return { items, loading, error, refresh };
};
