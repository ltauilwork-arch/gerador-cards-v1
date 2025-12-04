export enum Screen {
  HOME = "HOME",
  UPLOAD = "UPLOAD",
  GENERATING = "GENERATING",
  PREVIEW = "PREVIEW",
  PRESENTATIONS = "PRESENTATIONS",
}

export interface PresentationData {
  cover: {
    guestName: string;
    area: string;
    theme: string;
    instagram: string;
    linkedin: string;
    title: string;
    duration: string;
    guestDescription: string;
    centralGoal: string;
  };
  opening: {
    points: string[];
    hook: string;
    cta: string;
  };
  blocks: Array<{
    title: string;
    objective: string;
    questions: string[];
  }>;
  finalQuestion: {
    question: string;
  };
  closing: {
    recapPoints: string[];
    ctaPoints: string[];
  };
}

export interface Presentation {
  id: string;
  title: string;
  date: string;
  fileName: string; // For the specific download format
  data: PresentationData; // Store full data to regenerate PPTX
}
