import React from "react";
import { Screen } from "../types";
import { IconHouse, IconUpload, IconPresentation } from "./Icons";

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const getLinkClass = (isActive: boolean) =>
    `flex flex-1 flex-col items-center justify-end gap-1 ${isActive ? "text-[#101418]" : "text-[#5e758d]"}`;

  const getIconContainer = (isActive: boolean, children: React.ReactNode) => (
    <div
      className={`${isActive ? "text-[#101418]" : "text-[#5e758d]"} flex h-8 items-center justify-center`}
    >
      {children}
    </div>
  );

  return (
    <div>
      <div className="flex gap-2 border-t border-[#f0f2f5] bg-white px-4 pb-3 pt-2">
        <button
          onClick={() => onNavigate(Screen.HOME)}
          className={getLinkClass(currentScreen === Screen.HOME)}
        >
          {getIconContainer(currentScreen === Screen.HOME, <IconHouse />)}
          <p className="text-xs font-medium leading-normal tracking-[0.015em]">Início</p>
        </button>

        <button
          onClick={() => onNavigate(Screen.UPLOAD)}
          className={getLinkClass(
            currentScreen === Screen.UPLOAD || currentScreen === Screen.GENERATING
          )}
        >
          {getIconContainer(
            currentScreen === Screen.UPLOAD || currentScreen === Screen.GENERATING,
            <IconUpload />
          )}
          <p className="text-xs font-medium leading-normal tracking-[0.015em]">Upload</p>
        </button>

        <button
          onClick={() => onNavigate(Screen.PRESENTATIONS)}
          className={getLinkClass(currentScreen === Screen.PRESENTATIONS)}
        >
          {getIconContainer(currentScreen === Screen.PRESENTATIONS, <IconPresentation />)}
          <p className="text-xs font-medium leading-normal tracking-[0.015em]">Apresentações</p>
        </button>
      </div>
      <div className="h-5 bg-white"></div>
    </div>
  );
};
