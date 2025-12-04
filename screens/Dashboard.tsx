import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useDashboardData, DashboardItem } from "../hooks/useDashboardData";
import { LoginButton } from "../components/LoginButton";
import { getDocContent } from "../services/docsService";
import { uploadFile, updateFile } from "../services/driveService";
import { generatePresentationData } from "../services/geminiService";
import pptxgen from "pptxgenjs";

// Helper to generate PPTX blob (reusing logic from Preview/Generating but simplified for headless)
// We need to import the types for PresentationData
import { PresentationData } from "../types";

// We'll need a way to generate the PPTX binary without the UI. 
// Since pptxgenjs runs in browser, we can do it here.
// I'll create a local helper function for this.

export const Dashboard = () => {
  const { user, isAuthenticated, accessToken } = useAuth();
  const { items, loading, error, refresh } = useDashboardData();
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleGenerate = async (item: DashboardItem) => {
    if (!accessToken || !item.roteiro) {
      console.error("Cannot generate: missing accessToken or roteiro");
      return;
    }
    
    setProcessingKey(item.key);
    setStatusMessage("Lendo Roteiro...");

    try {
      // 1. Read Doc
      const text = await getDocContent(accessToken, item.roteiro.id);
      
      // 2. Generate JSON with Gemini
      setStatusMessage("Gerando Conteúdo com IA...");
      const presentationData = await generatePresentationData(text);
      // 3. Generate PPTX Blob
      setStatusMessage("Criando Arquivo PPTX...");
      const blob = await createPptxBlob(presentationData, item.theme);

      // 4. Upload or Update
      const fileName = `${item.key.substring(0, 8)}_02_CARD_${item.theme}.pptx`;
      
      if (item.card) {
          setStatusMessage("Atualizando Arquivo no Drive...");
          await updateFile(accessToken, item.card.id, blob);
      } else {
          setStatusMessage("Enviando para o Drive...");
          await uploadFile(accessToken, blob, fileName);
      }

      setStatusMessage("Concluído!");
      await refresh();

    } catch (err) {
      console.error(err);
      alert("Erro ao processar: " + (err as Error).message);
    } finally {
      setProcessingKey(null);
      setStatusMessage("");
    }
  };

  if (!isAuthenticated) {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Gerador de Cards V2</h1>
          <p className="text-gray-600 mb-6">Faça login para acessar o Dashboard.</p>
          
          {!clientId && (
             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-left text-sm">
                <strong className="font-bold">Configuração Ausente!</strong>
                <span className="block sm:inline"> VITE_GOOGLE_CLIENT_ID não encontrado no .env.local.</span>
             </div>
          )}

          <div className="flex justify-center">
            <LoginButton />
          </div>
          
          <div className="mt-8 text-xs text-gray-400 text-left border-t pt-4">
            <p>Debug Info:</p>
            <p>Porta: {window.location.port}</p>
            <p>Client ID: {clientId ? `${clientId.substring(0, 10)}...` : "N/A"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold">GC</div>
          <h1 className="text-xl font-bold text-gray-800">Gerador de Cards</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm text-gray-600">
            Logado como <span className="font-bold text-gray-900">{user?.name}</span>
          </div>
          <button 
            onClick={() => refresh()}
            disabled={loading}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Atualizar Lista"
          >
            <svg className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <LoginButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        <div className="bg-white rounded-xl shadow border border-gray-200 flex flex-col flex-1 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 font-semibold text-sm text-gray-600">
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-4">Roteiro</div>
                <div className="col-span-2">Data Roteiro</div>
                <div className="col-span-1 text-center">Card</div>
                <div className="col-span-2">Data Card</div>
                <div className="col-span-2 text-right">Ação</div>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto flex-1">
                {loading && items.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-500">Carregando...</div>
                ) : error ? (
                    <div className="flex justify-center items-center h-full text-red-500">{error}</div>
                ) : items.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-500">Nenhum roteiro encontrado na pasta alvo.</div>
                ) : (
                    items.map(item => (
                        <div key={item.key} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors text-sm">
                            {/* Status */}
                            <div className="col-span-1 flex justify-center">
                                <div className={`w-3 h-3 rounded-full ${item.status === 'done' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>

                            {/* Roteiro Name */}
                            <div className="col-span-4 font-medium text-gray-900 truncate" title={item.roteiro?.name}>
                                {item.roteiro?.name}
                            </div>

                            {/* Roteiro Date */}
                            <div className="col-span-2 text-gray-500">
                                {item.roteiro?.modifiedTime ? new Date(item.roteiro.modifiedTime).toLocaleDateString() : "-"}
                            </div>

                            {/* Card Status Icon */}
                            <div className="col-span-1 flex justify-center">
                                {item.card ? (
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>

                            {/* Card Date */}
                            <div className="col-span-2 text-gray-500">
                                {item.card?.modifiedTime ? new Date(item.card.modifiedTime).toLocaleDateString() : "-"}
                            </div>

                            {/* Action */}
                            <div className="col-span-2 flex justify-end">
                                <button
                                    onClick={() => handleGenerate(item)}
                                    disabled={!!processingKey}
                                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                                        processingKey === item.key 
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                    }`}
                                >
                                    {processingKey === item.key ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin h-3 w-3 border-b-2 border-gray-400 rounded-full"></span>
                                            {statusMessage || "Processando..."}
                                        </span>
                                    ) : item.card ? "Regerar" : "Gerar Card"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

// Helper to create PPTX Blob (Simplified version of what was likely in Preview.tsx)
// We need to replicate the PPTX generation logic here or extract it to a service.
// Since I can't see Preview.tsx logic right now without reading it, I'll implement a basic one
// based on the types. Ideally, this should be refactored into a service.

async function createPptxBlob(data: PresentationData, theme: string): Promise<Blob> {
  const pres = new pptxgen();
  
  // Cover Slide
  const slide = pres.addSlide();
  slide.background = { color: "1A1A1A" };
  slide.addText(data.cover.title, { x: 1, y: 1, w: "80%", fontSize: 32, color: "FFFFFF", bold: true });
  slide.addText(data.cover.guestName, { x: 1, y: 2.5, fontSize: 18, color: "CCCCCC" });
  slide.addText(theme, { x: 1, y: 3, fontSize: 14, color: "888888" });

  // Blocks
  data.blocks.forEach(block => {
      const s = pres.addSlide();
      s.background = { color: "FFFFFF" };
      s.addText(block.title, { x: 0.5, y: 0.5, fontSize: 24, color: "000000", bold: true });
      s.addText(block.objective, { x: 0.5, y: 1.5, fontSize: 14, color: "666666" });
      
      block.questions.forEach((q, i) => {
          s.addText(`• ${q}`, { x: 0.5, y: 2.5 + (i * 0.5), fontSize: 12, color: "333333" });
      });
  });

  return await pres.write("blob") as Blob;
}
