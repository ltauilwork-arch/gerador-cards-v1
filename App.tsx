import React, { useState, useEffect } from "react";
import { loadPresentations, savePresentations } from "./services/storageService";
import { Screen, Presentation } from "./types";
import { Home } from "./screens/Home";
import { Upload } from "./screens/Upload";
import { Generating } from "./screens/Generating";
import { Preview } from "./screens/Preview";
import { Presentations } from "./screens/Presentations";
import { BottomNav } from "./components/BottomNav";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  // Start empty to avoid "corrupted data" errors since we changed the data structure requirements
  // Load initial state from storage
  const [presentations, setPresentations] = useState<Presentation[]>(() => loadPresentations());

  // Save to storage whenever presentations change
  useEffect(() => {
    savePresentations(presentations);
  }, [presentations]);

  // State for file upload -> generating flow
  const [uploadedText, setUploadedText] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const [currentGeneratedPresentation, setCurrentGeneratedPresentation] =
    useState<Presentation | null>(null);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleFileSelect = (text: string, fname: string) => {
    setUploadedText(text);
    setFilename(fname);
    setCurrentScreen(Screen.GENERATING);
  };

  const handleGenerationComplete = (newPresentation: Presentation) => {
    setCurrentGeneratedPresentation(newPresentation);
    setCurrentScreen(Screen.PREVIEW);
  };

  const handleSavePresentation = () => {
    if (currentGeneratedPresentation) {
      setPresentations((prev) => [currentGeneratedPresentation, ...prev]);
      setCurrentScreen(Screen.PRESENTATIONS);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-white overflow-hidden font-sans">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {currentScreen === Screen.HOME && <Home onNavigate={handleNavigate} />}

        {currentScreen === Screen.UPLOAD && (
          <Upload onNavigate={handleNavigate} onFileSelect={handleFileSelect} />
        )}

        {currentScreen === Screen.GENERATING && (
          <Generating
            onNavigate={handleNavigate}
            inputText={uploadedText}
            sourceFilename={filename}
            onGenerationComplete={handleGenerationComplete}
          />
        )}

        {currentScreen === Screen.PREVIEW && currentGeneratedPresentation && (
          <Preview
            onNavigate={handleNavigate}
            presentation={currentGeneratedPresentation}
            onSave={handleSavePresentation}
          />
        )}

        {currentScreen === Screen.PRESENTATIONS && (
          <Presentations onNavigate={handleNavigate} items={presentations} />
        )}
      </div>

      {/* Persistent Bottom Navigation - Hide on Preview Mode to maximize space */}
      {currentScreen !== Screen.PREVIEW && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
