import React, { useState } from "react";
import { Screen, Presentation, PresentationData } from "../types";
import { IconArrowLeft, IconDownload } from "../components/Icons";
import { generatePptx } from "../services/geminiService";

interface PreviewProps {
  onNavigate: (screen: Screen) => void;
  presentation: Presentation;
  onSave: () => void;
}



// Placeholder images for preview (Must match or be similar to what we export)
const IMG_CASAL_NOTARIAL = "https://placehold.co/400x600/0066cc/ffffff?text=Casal+Notarial";
const IMG_NOTAR_IA = "https://placehold.co/100x100/ffffff/0066cc?text=Notar-IA";

const SlideContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full aspect-video bg-white shadow-lg rounded-lg overflow-hidden relative border border-gray-200 text-[10px] md:text-[12px] lg:text-[14px]">
    {children}
  </div>
);

const Header: React.FC<{ title: string }> = ({ title }) => (
  <div className="absolute top-0 left-0 w-full h-[15%] bg-[#0066cc] flex items-center px-[5%]">
    {/* Notar-IA Image Mockup */}
    <div className="h-[70%] aspect-square bg-white rounded-sm mr-4 flex items-center justify-center overflow-hidden">
      <img src={IMG_NOTAR_IA} className="w-full h-full object-cover" alt="Notar-IA" />
    </div>
    <h1 className="text-white font-bold text-[1.5em] leading-none uppercase">{title}</h1>
  </div>
);

// --- SLIDE RENDERERS ---

const SlideCover: React.FC<{ data: PresentationData["cover"] }> = ({ data }) => {
  return (
    <div className="w-full h-full flex">
      {/* Left Blue Side */}
      <div className="w-1/2 h-full bg-[#0066cc] relative flex items-end justify-center">
        {/* Adjusted to be centered in left half visually */}
        <div className="w-[70%] h-[80%] relative mb-[10%]">
          <img
            src={IMG_CASAL_NOTARIAL}
            className="w-full h-full object-cover rounded-sm"
            alt="Casal Notarial"
          />
        </div>
      </div>

      {/* Right Gray Side */}
      <div className="w-1/2 h-full bg-[#f0f4f8] p-[5%] flex flex-col justify-center">
        <div className="space-y-[0.5em] mb-[1.5em] text-[#333333]">
          <p className="text-[0.9em]">
            <strong>🎙️ Convidada:</strong> {data.guestName}
          </p>
          <p className="text-[0.9em]">
            <strong>🌎 Área:</strong> {data.area}
          </p>
          <p className="text-[0.9em]">
            <strong>🎯 Tema:</strong> {data.theme}
          </p>
          <p className="text-[0.9em]">
            <strong>📲 Insta:</strong> {data.instagram}
          </p>
          {data.linkedin && (
            <p className="text-[0.9em]">
              <strong>💼 LinkedIn:</strong> {data.linkedin}
            </p>
          )}
        </div>

        <h1 className="text-[#0066cc] text-[1.8em] font-bold leading-tight mb-[0.8em]">
          {data.title}
        </h1>

        <p className="text-[#333333] font-bold text-[0.8em] mb-[0.5em]">DURAÇÃO: {data.duration}</p>
        <p className="text-[#333333] text-[0.8em] mb-[1.5em] leading-snug">
          {data.guestDescription}
        </p>

        <p className="text-[#ff6600] italic text-[0.8em] mt-auto">
          OLHAR CENTRAL: {data.centralGoal}
        </p>
      </div>
    </div>
  );
};

const SlideOpening: React.FC<{ data: PresentationData["opening"] }> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white relative">
      <Header title="ABERTURA" />
      <div className="absolute top-[15%] left-0 w-full h-[85%] p-[5%] flex flex-col gap-[1em]">
        <ul className="list-decimal list-inside space-y-[0.5em] text-[#333333] text-[1.2em]">
          {data.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>

        <div className="border-l-4 border-[#ff6600] pl-4 py-2 mt-2 bg-gray-50">
          <p className="text-[#333333] text-[1.1em] font-medium">GANCHO: {data.hook}</p>
        </div>

        <div className="mt-auto bg-[#0066cc] p-4 rounded-sm">
          <p className="text-white text-[1.1em] font-bold">CTA: {data.cta}</p>
        </div>
      </div>
    </div>
  );
};

const SlideBlock: React.FC<{ block: PresentationData["blocks"][0] }> = ({ block }) => {
  const useTwoCols = block.questions.length > 5;
  const half = Math.ceil(block.questions.length / 2);

  return (
    <div className="w-full h-full bg-white relative">
      <Header title={block.title} />
      <div className="absolute top-[15%] left-0 w-full h-[85%] p-[5%] flex flex-col">
        <p className="text-[#333333] italic text-[1.2em] mb-[1.5em]">Objetivo: {block.objective}</p>

        <div className="mb-[1em] border-b-2 border-[#ff6600] inline-block w-full">
          <h3 className="text-[#0066cc] font-bold text-[1.4em]">Perguntas</h3>
        </div>

        {/* Use overflow-y-auto so users can see all questions if the list is long, proving the data exists */}
        <div className="flex-1 overflow-y-auto">
          {useTwoCols ? (
            <div className="flex gap-[2em] h-full">
              <div className="flex-1 space-y-[0.8em]">
                {block.questions.slice(0, half).map((q, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[#ff6600] font-bold text-[1.1em]">{i + 1}.</span>
                    <span className="text-[#333333] text-[1.1em]">{q}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 space-y-[0.8em]">
                {block.questions.slice(half).map((q, i) => (
                  <div key={i + half} className="flex gap-2">
                    <span className="text-[#ff6600] font-bold text-[1.1em]">{i + half + 1}.</span>
                    <span className="text-[#333333] text-[1.1em]">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-[0.8em]">
              {block.questions.map((q, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#ff6600] font-bold text-[1.1em]">{i + 1}.</span>
                  <span className="text-[#333333] text-[1.1em]">{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SlideFinalQuestion: React.FC<{ data: PresentationData["finalQuestion"] }> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white relative">
      <Header title="PERGUNTA FINAL (PONTO DE OURO)" />
      <div className="absolute top-[15%] left-0 w-full h-[85%] p-[5%] flex flex-col items-center justify-center">
        <h2 className="text-[#0066cc] text-[1.5em] mb-[1.5em]">O momento mais esperado:</h2>

        <div className="w-[90%] bg-[#f0f4f8] border-l-8 border-[#ff6600] p-[2em] shadow-sm mb-[2em]">
          <p className="text-[#333333] font-bold text-[1.8em] text-center">{data.question}</p>
        </div>

        <p className="text-[#333333] text-[1.2em]">⏱️ Duração: 5 minutos</p>
      </div>
    </div>
  );
};

const SlideClosing: React.FC<{ data: PresentationData["closing"] }> = ({ data }) => {
  return (
    <div className="w-full h-full bg-white relative">
      <Header title="ENCERRAMENTO" />
      <div className="absolute top-[15%] left-0 w-full h-[85%] p-[5%] flex flex-col gap-[1em]">
        <div>
          <h3 className="text-[#0066cc] font-bold text-[1.5em] border-b-2 border-[#ff6600] inline-block mb-[0.5em]">
            Agradecimentos e Recap
          </h3>
          <ul className="space-y-[0.5em]">
            {data.recapPoints.map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-[#333333] text-[1.2em]">
                <span>🎙️</span> {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          <h3 className="text-[#0066cc] font-bold text-[1.5em] border-b-2 border-[#ff6600] inline-block mb-[0.5em]">
            CTAs
          </h3>
          <div className="bg-[#f0f4f8] p-[1.5em] rounded-md space-y-[0.5em]">
            {data.ctaPoints.map((p, i) => (
              <li key={i} className="flex items-center gap-2 text-[#333333] text-[1.1em] list-none">
                <span>📲</span> {p}
              </li>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Preview: React.FC<PreviewProps> = ({ onNavigate, presentation, onSave }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 12; // Fixed number of slides

  const handleNext = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  const handlePrev = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const renderCurrentSlide = () => {
    const { data } = presentation;
    if (currentSlide === 0) return <SlideCover data={data.cover} />;
    if (currentSlide === 1) return <SlideOpening data={data.opening} />;
    if (currentSlide >= 2 && currentSlide <= 9)
      return <SlideBlock block={data.blocks[currentSlide - 2]} />;
    if (currentSlide === 10) return <SlideFinalQuestion data={data.finalQuestion} />;
    if (currentSlide === 11) return <SlideClosing data={data.closing} />;
    return <div>Slide não encontrado</div>;
  };

  const handleDownload = async () => {
    try {
      const blob = await generatePptx(presentation.data);

      let fileName = presentation.fileName || "apresentacao.pptx";
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

      onSave(); // Navigate to list after download
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar arquivo PPTX.");
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white h-full overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center bg-white p-4 border-b border-[#dae0e7] justify-between">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="text-[#101418] flex items-center gap-2 hover:bg-gray-100 px-3 py-1 rounded-md transition-colors"
        >
          <IconArrowLeft />
          <span className="font-medium hidden sm:inline">Voltar</span>
        </button>
        <h2 className="text-[#101418] text-lg font-bold">Pré-visualização</h2>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-[#0066cc] text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          <span className="hidden sm:inline">Baixar PPTX</span>
          <IconDownload />
        </button>
      </div>

      {/* Main Content - Preview Area */}
      <div className="flex-1 flex flex-col md:flex-row bg-gray-100 overflow-hidden">
        {/* Thumbnails Sidebar */}
        <div className="hidden md:flex flex-col w-48 bg-white border-r border-[#dae0e7] overflow-y-auto p-4 gap-4">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`cursor-pointer rounded border-2 transition-all p-1 ${currentSlide === idx ? "border-[#0066cc] bg-blue-50" : "border-transparent hover:bg-gray-50"}`}
            >
              <div className="text-xs text-center font-bold text-gray-500 mb-1">
                Slide {idx + 1}
              </div>
              <div className="aspect-video bg-gray-200 w-full rounded-sm overflow-hidden flex items-center justify-center text-xs text-gray-400">
                {/* Mini preview logic is heavy, just using placeholders */}
                {idx === 0
                  ? "Capa"
                  : idx === 1
                    ? "Abertura"
                    : idx === 10
                      ? "Final"
                      : idx === 11
                        ? "Fim"
                        : `Bloco ${idx - 1}`}
              </div>
            </div>
          ))}
        </div>

        {/* Main Slide View */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
          <div className="w-full max-w-5xl">
            <SlideContainer>{renderCurrentSlide()}</SlideContainer>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-6 mt-6 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed text-[#0066cc]"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <span className="font-medium text-gray-700 w-24 text-center">
              Slide {currentSlide + 1} / {totalSlides}
            </span>

            <button
              onClick={handleNext}
              disabled={currentSlide === totalSlides - 1}
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed text-[#0066cc]"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
