import React, { useRef, useState } from "react";
import JSZip from "jszip";
import { Screen } from "../types";
import { IconArrowLeft, IconGoogleDrive } from "../components/Icons";

interface UploadProps {
  onNavigate: (screen: Screen) => void;
  onFileSelect: (text: string, filename: string) => void;
}

export const Upload: React.FC<UploadProps> = ({ onNavigate, onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteContent, setPasteContent] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDriveClick = () => {
    // Directly trigger the file input.
    // This is a "mock" drive integration as requested, using the OS file picker.
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      setError("Erro ao abrir seletor de arquivos.");
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) {
      setError("O conteúdo está vazio.");
      return;
    }
    onFileSelect(pasteContent, "Roteiro Colado.txt");
  };

  const processFile = async (file: File) => {
    // Basic validation
    if (!file.name.endsWith(".txt") && !file.name.endsWith(".docx") && !file.name.endsWith(".md")) {
      setError("Por favor, envie um arquivo .txt ou .docx.");
      return;
    }

    if (file.name.endsWith(".docx")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        const doc = await zip.file("word/document.xml")?.async("string");

        if (doc) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(doc, "text/xml");
          // Improved parser to handle runs, tabs, and line breaks
          const paragraphs = xmlDoc.getElementsByTagName("w:p");
          let text = "";

          for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            let lineText = "";

            // Iterate over child nodes to handle runs, tabs, etc. in order
            // We can't just use textContent because we miss tabs and line breaks
            // But for simplicity, let's try to find w:t, w:tab, w:br
            // Since DOMParser might not handle namespaces perfectly in querySelector,
            // we iterate children.

            const traverse = (node: Node) => {
              if (node.nodeType === Node.TEXT_NODE) {
                // Usually text is inside w:t, but just in case
                return;
              }

              const nodeName = node.nodeName;

              if (nodeName.endsWith("t")) {
                // w:t
                lineText += node.textContent;
              } else if (nodeName.endsWith("tab")) {
                // w:tab
                lineText += "\t";
              } else if (nodeName.endsWith("br")) {
                // w:br
                lineText += "\n";
              } else {
                // Recurse
                node.childNodes.forEach(traverse);
              }
            };

            traverse(p);
            text += lineText + "\n";
          }

          onFileSelect(text, file.name);
        } else {
          setError("Não foi possível ler o conteúdo do arquivo DOCX.");
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao processar arquivo DOCX.");
      }
    } else {
      // Text files
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onFileSelect(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white overflow-y-auto">
      <div className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className="text-[#101418] flex size-12 shrink-0 items-center hover:bg-gray-100 rounded-full justify-center"
        >
          <IconArrowLeft />
        </button>
        <h2 className="text-[#101418] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Upload
        </h2>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <h3 className="text-[#101418] tracking-light text-2xl font-bold leading-tight px-4 text-center pb-2 pt-5">
          Upload do seu roteiro
        </h3>
        <p className="text-[#101418] text-base font-normal leading-normal pb-6 pt-1 px-4 text-center text-gray-600">
          Carregue seu arquivo para gerar os slides automaticamente.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 mx-4 rounded-md text-sm text-center mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col px-4 gap-6">
          {/* Drag and Drop Area */}
          {!showPaste ? (
            <>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#dae0e7] px-6 py-12 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-gray-100 p-4 rounded-full group-hover:bg-white transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                      className="text-gray-400 group-hover:text-blue-500"
                    >
                      <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"></path>
                    </svg>
                  </div>
                  <p className="text-[#101418] text-lg font-bold leading-tight text-center mt-2">
                    Arraste e solte seu arquivo aqui
                  </p>
                  <p className="text-gray-500 text-sm text-center">Suporta .txt, .docx</p>
                </div>
                <button className="flex items-center justify-center rounded-lg h-10 px-6 bg-[#0066cc] text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                  Selecionar Arquivo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".txt,.docx,.md"
                />
              </div>

              <div className="flex items-center gap-4 w-full">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-sm text-gray-400 font-medium">OU</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Google Drive & Paste Options */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleDriveClick}
                  type="button"
                  className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer active:scale-95 transform"
                >
                  <div className="size-8">
                    <IconGoogleDrive />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Google Drive</span>
                </button>

                <button
                  onClick={() => setShowPaste(true)}
                  className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer active:scale-95 transform"
                >
                  <div className="text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M200,32H168a8,8,0,0,0-8-8H96a8,8,0,0,0-8,8H56A16,16,0,0,0,40,48V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm-96,0h48V48H104ZM200,216H56V48H88V64a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V48h32V216Z"></path>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Colar Texto</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
              <textarea
                className="w-full h-64 p-4 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                placeholder="Cole o texto do seu roteiro aqui..."
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
              ></textarea>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaste(false)}
                  className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePasteSubmit}
                  className="flex-1 py-3 bg-[#0066cc] text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Processar Roteiro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
