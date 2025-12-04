import React, { useEffect, useState } from "react";
import { Screen, Presentation } from "../types";
import { generatePresentationData } from "../services/geminiService";

interface GeneratingProps {
  onNavigate: (screen: Screen) => void;
  inputText: string;
  sourceFilename: string;
  onGenerationComplete: (presentation: Presentation) => void;
}

export const Generating: React.FC<GeneratingProps> = ({
  onNavigate,
  inputText,
  sourceFilename,
  onGenerationComplete,
}) => {
  const [progress, setProgress] = useState(10);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runGeneration = async () => {
      try {
        const interval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 5, 90));
        }, 500);

        // 1. Get structured data from Gemini
        const data = await generatePresentationData(inputText);

        clearInterval(interval);
        setProgress(100);

        // Construct filename
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        const safeTheme = (data.cover.theme || "Tema")
          .replace(/[^a-zA-Z0-9]/g, "_")
          .substring(0, 20);
        const safeName = (data.cover.guestName || "Convidado").replace(/[^a-zA-Z0-9]/g, "_");
        let downloadName = `${yyyy}${mm}${dd}_02_CARD_${safeTheme}_${safeName}`;
        if (!downloadName.toLowerCase().endsWith(".pptx")) {
          downloadName += ".pptx";
        }

        const newPresentation: Presentation = {
          id: Date.now().toString(),
          title: data.cover.title || "Apresentação Gerada",
          date: today.toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          fileName: downloadName,
          data: data,
        };

        // Allow some time for the progress bar to complete visually
        setTimeout(() => {
          onGenerationComplete(newPresentation);
        }, 500);
      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(`Falha: ${errorMessage}`);
        setProgress(0);
      }
    };

    runGeneration();
  }, [inputText, sourceFilename, onGenerationComplete]);

  return (
    <div className="flex flex-col flex-1 bg-white items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 flex flex-col items-center">
        {error ? (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="size-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-16-80a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V144A8,8,0,0,0,112,136Zm8-32a12,12,0,1,0-12-12A12,12,0,0,0,120,104Z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#101418]">Ocorreu um erro</h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => onNavigate(Screen.UPLOAD)}
              className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Voltar para Upload
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-[#101418] text-2xl font-bold mb-8 animate-pulse">
              Gerando Apresentação...
            </h2>

            <div className="w-full bg-[#dae0e7] rounded-full h-3 mb-4 overflow-hidden">
              <div
                className="bg-[#0066cc] h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <p className="text-[#5e758d] text-center text-sm">
              A IA está analisando o roteiro, extraindo perguntas e formatando os 12 slides conforme
              o padrão Casal Notarial.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
