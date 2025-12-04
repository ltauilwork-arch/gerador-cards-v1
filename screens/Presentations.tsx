import React, { useState } from "react";
import { Screen, Presentation } from "../types";
import { IconArrowLeft, IconDownload } from "../components/Icons";
import { generatePptx } from "../services/geminiService";

interface PresentationsProps {
  onNavigate: (screen: Screen) => void;
  items: Presentation[];
}

export const Presentations: React.FC<PresentationsProps> = ({ onNavigate, items }) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (item: Presentation) => {
    if (!item.data) {
      alert("Dados corrompidos ou antigos. Não é possível gerar o PPTX.");
      return;
    }

    setDownloadingId(item.id);
    try {
      const blob = await generatePptx(item.data);

      let fileName = item.fileName || "apresentacao.pptx";
      if (!fileName.toLowerCase().endsWith(".pptx")) {
        fileName += ".pptx";
      }
      console.log("Downloading with filename:", fileName);
      console.log("Blob type:", blob.type, "Size:", blob.size);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar arquivo PPTX.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white">
      <div className="flex items-center bg-white p-4 pb-2 justify-between">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="text-[#101418] flex size-12 shrink-0 items-center"
        >
          <IconArrowLeft />
        </button>
        <h2 className="text-[#101418] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Apresentações
        </h2>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#5e758d]">
            <p>Nenhuma apresentação criada ainda.</p>
            <button
              onClick={() => onNavigate(Screen.UPLOAD)}
              className="text-[#0066cc] mt-2 font-bold"
            >
              Criar nova
            </button>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between border-b border-[#f0f2f5] last:border-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col justify-center">
                <p className="text-[#101418] text-base font-medium leading-normal line-clamp-1">
                  {item.title}
                </p>
                <p className="text-[#5e758d] text-sm font-normal leading-normal line-clamp-2">
                  Criado em {item.date}
                </p>
              </div>
              <button
                className="shrink-0 p-2 hover:bg-gray-200 rounded-full disabled:opacity-50"
                onClick={() => handleDownload(item)}
                disabled={downloadingId === item.id}
                title="Download PPTX"
              >
                {downloadingId === item.id ? (
                  <span className="text-xs font-bold text-blue-600">...</span>
                ) : (
                  <div className="text-[#101418] flex size-7 items-center justify-center">
                    <IconDownload />
                  </div>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
