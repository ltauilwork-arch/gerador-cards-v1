import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const CLIENT_ID = "876048156746-b7mj14rpkkgvduheamerkad8mtg35sta.apps.googleusercontent.com";
const TARGET_FOLDER_ID = "13iL9TyT8iWzCd07jM8EfUE4aJuqX_A-z";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

interface DashboardItem {
  key: string;
  theme: string;
  roteiro: DriveFile | null;
  card: DriveFile | null;
  status: "pending" | "done";
}

// Login Screen
const LoginScreen = () => {
  const handleLogin = () => {
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent("https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents.readonly openid profile email");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    window.location.href = authUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Gerador de Cards V2</h1>
        <p className="text-gray-600 mb-6">Faça login para acessar o Dashboard.</p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm mx-auto"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Entrar com Google
        </button>
      </div>
    </div>
  );
};

// Dashboard Screen
const Dashboard = ({ accessToken, onLogout }: { accessToken: string; onLogout: () => void }) => {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const query = `'${TARGET_FOLDER_ID}' in parents and trashed = false`;
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime)&orderBy=modifiedTime desc`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          onLogout();
          return;
        }
        throw new Error(`Erro ao buscar arquivos: ${response.status}`);
      }
      
      const data = await response.json();
      const files: DriveFile[] = data.files || [];
      
      // Match roteiros with cards
      const roteiros = files.filter(f => f.name.includes("_01_ROTEIRO_"));
      const cards = files.filter(f => f.name.includes("_02_CARD_"));
      
      // Build set of valid roteiro keys
      const roteiroKeys = new Set<string>();
      const itemMap = new Map<string, DashboardItem>();
      
      roteiros.forEach(roteiro => {
        const parts = roteiro.name.split("_01_ROTEIRO_");
        if (parts.length === 2) {
          const datePart = parts[0];
          const themePart = parts[1].replace(/\.[^/.]+$/, "");
          const key = datePart + themePart;
          
          roteiroKeys.add(key);
          itemMap.set(key, {
            key,
            theme: themePart,
            roteiro,
            card: null,
            status: "pending"
          });
        }
      });
      
      // Process cards and identify orphans and outdated cards
      const orphanCards: DriveFile[] = [];
      const outdatedCards: DriveFile[] = [];
      
      cards.forEach(card => {
        const parts = card.name.split("_02_CARD_");
        if (parts.length === 2) {
          const datePart = parts[0];
          const themePart = parts[1].replace(/\.[^/.]+$/, "");
          const key = datePart + themePart;
          
          if (roteiroKeys.has(key)) {
            // Card has a matching roteiro
            const item = itemMap.get(key)!;
            
            // Check if roteiro is more recent than card (card is outdated)
            const roteiroDate = new Date(item.roteiro!.modifiedTime);
            const cardDate = new Date(card.modifiedTime);
            
            if (roteiroDate > cardDate) {
              // Roteiro was updated after card was created - card is outdated
              console.log(`📅 Card desatualizado detectado: ${card.name}`);
              console.log(`   Roteiro: ${roteiroDate.toLocaleString()} | Card: ${cardDate.toLocaleString()}`);
              outdatedCards.push(card);
              // Don't associate the outdated card with the item
            } else {
              // Card is up to date
              item.card = card;
              item.status = "done";
            }
          } else {
            // Orphan card - no matching roteiro
            orphanCards.push(card);
          }
        }
      });
      
      // Delete orphan and outdated cards from Drive
      const cardsToDelete = [...orphanCards, ...outdatedCards];
      if (cardsToDelete.length > 0) {
        console.log(`🗑️ Encontrados ${cardsToDelete.length} card(s) para excluir (${orphanCards.length} órfão(s), ${outdatedCards.length} desatualizado(s))...`);
        for (const cardToDelete of cardsToDelete) {
          try {
            await fetch(
              `https://www.googleapis.com/drive/v3/files/${cardToDelete.id}`,
              {
                method: "PATCH",
                headers: { 
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ trashed: true }),
              }
            );
            console.log(`✅ Card excluído: ${cardToDelete.name}`);
          } catch (err) {
            console.error(`❌ Erro ao excluir card: ${cardToDelete.name}`, err);
          }
        }
      }
      
      const sortedItems = Array.from(itemMap.values()).sort((a, b) => b.key.localeCompare(a.key));
      setItems(sortedItems);
      
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [accessToken]);

  const handleGenerate = async (item: DashboardItem) => {
    if (!item.roteiro) return;
    
    setProcessingKey(item.key);
    setStatusMessage("Lendo documento...");
    
    try {
      let text = "";
      const mimeType = item.roteiro.mimeType;
      
      // Check if it's a native Google Doc or an uploaded file
      if (mimeType === "application/vnd.google-apps.document") {
        // Native Google Doc - use Docs API
        const docResponse = await fetch(
          `https://docs.googleapis.com/v1/documents/${item.roteiro.id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        if (!docResponse.ok) throw new Error("Falha ao ler Google Doc");
        
        const doc = await docResponse.json();
        doc.body?.content?.forEach((element: any) => {
          if (element.paragraph) {
            element.paragraph.elements?.forEach((el: any) => {
              if (el.textRun?.content) {
                text += el.textRun.content;
              }
            });
          }
        });
      } else {
        // Regular file (uploaded .docx) - export as plain text
        const exportResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${item.roteiro.id}/export?mimeType=text/plain`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        if (!exportResponse.ok) {
          // If export fails, try to download and read as text
          const downloadResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${item.roteiro.id}?alt=media`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          
          if (!downloadResponse.ok) throw new Error("Falha ao baixar arquivo");
          text = await downloadResponse.text();
        } else {
          text = await exportResponse.text();
        }
      }
      
      if (!text || text.trim().length === 0) {
        throw new Error("Documento vazio ou não foi possível ler o conteúdo");
      }
      
      // 2. Generate with Gemini
      setStatusMessage("Gerando com IA...");
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiKey) throw new Error("VITE_GEMINI_API_KEY não configurada no .env.local");
      
      // Call the Gemini service
      const { generatePresentationData, generatePptx } = await import("./services/geminiService");
      
      const presentationData = await generatePresentationData(text);
      
      setStatusMessage("Criando PPTX...");
      const pptxBlob = await generatePptx(presentationData);
      
      // 3. Delete existing card if regenerating
      if (item.card) {
        setStatusMessage("Excluindo versão anterior...");
        try {
          // Try permanent delete first
          const deleteResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${item.card.id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          
          if (!deleteResponse.ok) {
            // If delete fails, try moving to trash
            const trashResponse = await fetch(
              `https://www.googleapis.com/drive/v3/files/${item.card.id}`,
              {
                method: "PATCH",
                headers: { 
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ trashed: true }),
              }
            );
            
            if (!trashResponse.ok) {
              const errorText = await trashResponse.text();
              console.error("Falha ao excluir card:", errorText);
            }
          }
        } catch (deleteError) {
          console.error("Erro ao excluir card anterior:", deleteError);
        }
      }
      
      // 4. Upload new card to Drive
      setStatusMessage("Enviando para o Drive...");
      const fileName = `${item.key.substring(0, 8)}_02_CARD_${item.theme}.pptx`;
      
      const metadata = {
        name: fileName,
        parents: [TARGET_FOLDER_ID],
      };
      
      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", pptxBlob);
      
      const uploadResponse = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: form,
        }
      );
      
      if (!uploadResponse.ok) throw new Error("Falha ao fazer upload do arquivo");
      
      setStatusMessage("Concluído!");
      alert("✅ Card gerado com sucesso!\n\nArquivo: " + fileName);
      
      // Refresh the list
      fetchFiles();
      
    } catch (err) {
      console.error(err);
      alert("Erro: " + (err as Error).message);
    } finally {
      setProcessingKey(null);
      setStatusMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold">GC</div>
          <a 
            href={`https://drive.google.com/drive/folders/${TARGET_FOLDER_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
            title="Abrir pasta no Google Drive"
          >
            Gerador de Cards
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchFiles}
            disabled={loading}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Atualizar Lista"
          >
            <svg className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
          >
            Sair
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-8 overflow-hidden flex flex-col">
        <div className="bg-white rounded-xl shadow border border-gray-200 flex flex-col flex-1 overflow-hidden">
          <div className="grid gap-4 p-4 border-b border-gray-100 bg-gray-50 font-semibold text-sm text-gray-600" style={{gridTemplateColumns: "0.5fr 4fr 1.5fr 0.5fr 1.5fr 2fr 3fr"}}>
            <div className="text-center">Status</div>
            <div>Roteiro</div>
            <div>Data Roteiro</div>
            <div className="text-center">Card</div>
            <div>Data Card</div>
            <div className="text-center">Ação</div>
            <div className="text-center">Download / Compartilhar</div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {loading && items.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Carregando arquivos do Drive...
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center h-full text-red-500 gap-4">
                <p>{error}</p>
                <button onClick={fetchFiles} className="px-4 py-2 bg-red-100 rounded">Tentar novamente</button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-gray-500 gap-2">
                <p>Nenhum roteiro encontrado na pasta alvo.</p>
                <p className="text-xs text-gray-400">Folder ID: {TARGET_FOLDER_ID}</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.key} className="grid gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors text-sm" style={{gridTemplateColumns: "0.5fr 4fr 1.5fr 0.5fr 1.5fr 2fr 3fr"}}>
                  {/* Status */}
                  <div className="flex justify-center">
                    <div className={`w-3 h-3 rounded-full ${item.status === 'done' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  </div>
                  {/* Roteiro */}
                  <div className="font-medium text-gray-900 truncate" title={item.roteiro?.name}>
                    {item.roteiro?.name}
                  </div>
                  {/* Data Roteiro */}
                  <div className="text-gray-500 text-xs">
                    {item.roteiro?.modifiedTime ? new Date(item.roteiro.modifiedTime).toLocaleDateString() : "-"}
                  </div>
                  {/* Card indicator */}
                  <div className="flex justify-center">
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
                  {/* Data Card */}
                  <div className="text-gray-500 text-xs">
                    {item.card?.modifiedTime ? new Date(item.card.modifiedTime).toLocaleDateString() : "-"}
                  </div>
                  {/* Ação */}
                  <div className="flex justify-center">
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
                          {statusMessage || "..."}
                        </span>
                      ) : item.card ? "Regerar" : "Gerar Card"}
                    </button>
                  </div>
                  {/* Download / Compartilhar */}
                  <div className="flex justify-center gap-2">
                    {item.card ? (
                      <>
                        <a
                          href={`https://drive.google.com/uc?export=download&id=${item.card.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                          title="Baixar arquivo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                        <button
                          onClick={() => {
                            const link = `https://drive.google.com/file/d/${item.card!.id}/view?usp=sharing`;
                            navigator.clipboard.writeText(link).then(() => {
                              alert("✅ Link copiado!\n\n" + link);
                            });
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
                          title="Copiar link para compartilhar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copiar Link
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
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

// Main App
const App = () => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("google_access_token")
  );

  const handleLogout = () => {
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("google_user_profile");
    setAccessToken(null);
  };

  // Handle OAuth redirect
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get("access_token");
    
    if (token) {
      localStorage.setItem("google_access_token", token);
      setAccessToken(token);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (!accessToken) {
    return <LoginScreen />;
  }

  return <Dashboard accessToken={accessToken} onLogout={handleLogout} />;
};

// Render
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
