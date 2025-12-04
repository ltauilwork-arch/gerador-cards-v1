import { Presentation } from "../types";

const STORAGE_KEY = "stitch_design_presentations";

export const savePresentations = (presentations: Presentation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations));
  } catch (error) {
    console.error("Failed to save presentations to localStorage:", error);
  }
};

export const loadPresentations = (): Presentation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Presentation[];
  } catch (error) {
    console.error("Failed to load presentations from localStorage:", error);
    return [];
  }
};
