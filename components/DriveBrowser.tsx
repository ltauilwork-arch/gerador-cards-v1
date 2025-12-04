import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { listFiles, DriveFile } from "../services/driveService";
import { LoginButton } from "./LoginButton";

interface DriveBrowserProps {
  onFileSelect: (file: DriveFile) => void;
  onCancel: () => void;
}

export const DriveBrowser: React.FC<DriveBrowserProps> = ({ onFileSelect, onCancel }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const driveFiles = await listFiles(accessToken);
      setFiles(driveFiles);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar arquivos do Google Drive.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadFiles();
    }
  }, [isAuthenticated, accessToken, loadFiles]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-600 text-center">
          Conecte-se ao Google Drive para selecionar seus arquivos.
        </p>
        <LoginButton />
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-bold text-gray-800">Seus Arquivos no Drive</h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">
            {error}
            <button onClick={loadFiles} className="block mx-auto mt-2 text-blue-600 underline">
              Tentar novamente
            </button>
          </div>
        ) : files.length === 0 ? (
          <div className="text-gray-500 text-center p-8">Nenhum arquivo encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => onFileSelect(file)}
                className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg text-left transition-colors group"
              >
                <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500">
                  {file.mimeType.includes("folder") ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {file.mimeType.replace("application/vnd.google-apps.", "")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
         <LoginButton />
      </div>
    </div>
  );
};
