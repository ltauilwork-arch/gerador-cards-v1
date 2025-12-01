import React from "react";
import { Screen } from "../types";

interface HomeProps {
  onNavigate: (screen: Screen) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  // console.log("Client Debug - API_KEY:", apiKey);
  return (
    <div className="flex flex-col flex-1 bg-white">
      <div className="flex items-center bg-white p-4 pb-2 justify-between">
        <h2 className="text-[#101418] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12 pr-12">
          Apresentações
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 mt-10">
        {!apiKey && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-4">
            <div className="flex items-center gap-3 text-red-700 font-medium mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-16-80a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V144A8,8,0,0,0,112,136Zm8-32a12,12,0,1,0-12-12A12,12,0,0,0,120,104Z"></path>
              </svg>
              Configuração Necessária
            </div>
            <p className="text-sm text-red-600">
              A chave da API do Gemini não foi encontrada. Verifique o arquivo{" "}
              <code>.env.local</code>:
              <br />
              <code>VITE_GEMINI_API_KEY=sua_chave_aqui</code>
            </p>
          </div>
        )}

        <h2 className="text-[#101418] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
          Transforme roteiros em apresentações
        </h2>
        <p className="text-[#101418] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center max-w-[480px]">
          Crie apresentações do Google Slides a partir de roteiros, seguindo um modelo específico.
        </p>
      </div>

      <div className="flex px-4 py-3 mb-auto">
        <button
          onClick={() => onNavigate(Screen.UPLOAD)}
          className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#0066cc] text-white text-base font-bold leading-normal tracking-[0.015em]"
        >
          <span className="truncate">Começar</span>
        </button>
      </div>
    </div>
  );
};
