import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Search,
  Users,
  GitBranch,
  Gavel,
  Zap,
  X,
  Skull,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import { Navbar } from './components/Navbar';
import CrimeScene from './components/CrimeScene';
import InterrogationRoom from './components/InterrogationRoom';
import DetectiveBoard from './components/DetectiveBoard';
import VerdictScreen from './components/VerdictScreen';
import { mockCase } from './data/mockCase';

const MainApp: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    discoverEvidence,
    resetGame,
    isDemoMode,
    triggerDemoAutoSolve,
    playSfx,
  } = useGameState();

  // Initial Dossier Popup modal open by default on first load
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(true);

  const handleStartInvestigation = () => {
    playSfx.pageFlip();
    setIsDossierOpen(false);
    if (currentScreen === 'intro' || currentScreen === 'case-file') {
      setCurrentScreen('crime-scene');
    }
  };

  const handleFastTrackSolve = () => {
    playSfx.mystery();
    triggerDemoAutoSolve();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });
    setIsDossierOpen(false);
    setCurrentScreen('pinboard');
  };

  return (
    <div className="min-h-screen bg-[#0e0c0a] text-[#ded3be] font-special relative selection:bg-[#8b2616] selection:text-[#fff8ec]">
      {/* Film Noir Ambient Vignette */}
      <div className="fixed inset-0 pointer-events-none noir-vignette z-40" />

      {/* Detective Top Navigation Bar */}
      <Navbar onOpenDossier={() => setIsDossierOpen(true)} />

      {/* Demo Mode BGK Active Notification Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-[#6e1e0a] via-[#85270f] to-[#541607] border-b border-[#e0564c] px-4 py-2 text-xs font-courier text-[#fff1ea] flex flex-wrap items-center justify-between gap-2 shadow-lg z-30 relative">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-300"></span>
            </span>
            <span className="font-bold tracking-wide">
              ⚡ CHẾ ĐỘ BAN GIÁM KHẢO FAST-TRACK (60S) ĐANG KÍCH HOẠT:
            </span>
            <span className="text-[#ffd699]">
              Toàn bộ 6 chứng cứ, 10 đường chỉ đỏ, và lời khai mâu thuẫn đã được mở khóa tự động!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSfx.click();
                setCurrentScreen('pinboard');
              }}
              className="px-2.5 py-1 bg-[#3a1005] hover:bg-[#521708] text-[#ffc5b8] rounded border border-[#a83a21] font-special text-xs transition"
            >
              Xem Bảng Chỉ Đỏ
            </button>
            <button
              onClick={() => {
                playSfx.click();
                setCurrentScreen('verdict');
              }}
              className="px-2.5 py-1 bg-[#ffe3db] hover:bg-white text-[#731f0a] font-bold rounded shadow text-xs transition"
            >
              Đến Bản Phán Quyết
            </button>
            <button
              onClick={() => {
                playSfx.click();
                resetGame();
              }}
              className="px-2 py-1 text-red-200 hover:text-white transition"
              title="Khôi phục trạng thái ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Screen Content View */}
      <main className="relative z-10">
        {(currentScreen === 'crime-scene' || currentScreen === 'intro' || currentScreen === 'case-file') && (
          <CrimeScene
            onEvidenceCollected={(ev) => discoverEvidence(ev.id)}
            onNavigateToBoard={() => setCurrentScreen('pinboard')}
          />
        )}

        {currentScreen === 'interrogation' && (
          <InterrogationRoom
            onNavigateToBoard={() => setCurrentScreen('pinboard')}
            onNavigateToScene={() => setCurrentScreen('crime-scene')}
          />
        )}

        {currentScreen === 'pinboard' && (
          <DetectiveBoard
            onNavigateToScene={() => setCurrentScreen('crime-scene')}
            onNavigateToInterrogation={() => setCurrentScreen('interrogation')}
            onNavigateToVerdict={() => setCurrentScreen('verdict')}
          />
        )}

        {currentScreen === 'verdict' && (
          <VerdictScreen
            onBackToBoard={() => setCurrentScreen('pinboard')}
            onBackToScene={() => setCurrentScreen('crime-scene')}
            onResetGame={resetGame}
          />
        )}
      </main>

      {/* INITIAL CASE DOSSIER MODAL (HỒ SƠ VỤ ÁN MẬT) */}
      {isDossierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto dossier-folder rounded-md p-6 sm:p-8 text-[#ded3be] border-2 border-[#544331] shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
            {/* Top Manila Tab & Close */}
            <div className="flex items-center justify-between border-b-2 border-[#473827] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="stamp-classified">TỐI MẬT - CLASSIFIED</div>
                <span className="text-xs sm:text-sm font-courier text-[#a89680] tracking-widest uppercase">
                  HỒ SƠ ĐIỀU TRA ĐẶC BIỆT #1947
                </span>
              </div>
              <button
                onClick={() => {
                  playSfx.click();
                  setIsDossierOpen(false);
                }}
                className="p-1.5 rounded-sm bg-[#1c1611] hover:bg-[#34271c] text-[#a89680] hover:text-[#fff1cc] border border-[#4a3928] transition"
                title="Đóng hồ sơ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Case Title Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold font-special text-[#ffdfa9] tracking-wider mb-2">
                {mockCase.title}
              </h1>
              <div className="text-sm font-courier text-[#9c8971] flex flex-wrap items-center gap-4">
                <span>Độ khó: <strong className="text-amber-400">{mockCase.difficulty}</strong></span>
                <span>•</span>
                <span>Hiện trường: <strong className="text-[#d8c7af]">{mockCase.victim.location}</strong></span>
                <span>•</span>
                <span>Thời điểm tử vong: <strong className="text-red-400 font-mono">{mockCase.victim.estimatedTimeOfDeath}</strong></span>
              </div>
            </div>

            {/* Victim Brief & Crime Brief Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {/* Victim Card */}
              <div className="p-4 rounded bg-[#1c1611] border border-[#3f3122] shadow-inner">
                <div className="flex items-center gap-2 text-xs font-courier uppercase text-[#e5a953] tracking-wider mb-2">
                  <Skull className="w-4 h-4 text-red-400" />
                  <span>Nạn Nhân Án Mạng</span>
                </div>
                <h3 className="text-lg font-bold text-[#f7eedd] font-special">
                  {mockCase.victim.name} ({mockCase.victim.age} tuổi)
                </h3>
                <p className="text-xs text-[#b8a68f] font-courier mt-1">
                  {mockCase.victim.role}
                </p>
                <div className="mt-3 text-xs font-courier text-[#96846e] border-t border-[#312518] pt-2">
                  <span className="text-red-400 font-bold">Nguyên nhân:</span> {mockCase.victim.causeOfDeath}
                </div>
                <p className="mt-2 text-xs text-[#a3917a] font-courier leading-relaxed">
                  {mockCase.victim.description}
                </p>
              </div>

              {/* 3 Prime Suspects Summary */}
              <div className="md:col-span-2 p-4 rounded bg-[#1c1611] border border-[#3f3122]">
                <div className="flex items-center justify-between text-xs font-courier uppercase text-[#e5a953] tracking-wider mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>3 Đối Tượng Tình Nghi Có Mặt Lúc 22:00 - 22:30</span>
                  </div>
                  <span className="text-[11px] text-[#85735f]">Đều có chìa khóa phòng</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  {mockCase.suspects.map((suspect) => (
                    <div
                      key={suspect.id}
                      className="p-3 rounded bg-[#14100c] border border-[#33271b] hover:border-[#6b523a] transition"
                    >
                      <div className="font-special font-bold text-sm text-[#ffd699]">
                        {suspect.name}
                      </div>
                      <div className="text-[11px] font-courier text-[#8a7966]">{suspect.role}</div>
                      <div className="mt-2 text-[11px] font-courier text-[#a89781] leading-tight">
                        <strong>Động cơ:</strong> {suspect.motive}
                      </div>
                      <div className="mt-1.5 text-[10px] font-courier text-[#6e5d4c]">
                        Khai: {suspect.alibi}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detective Protocol / Objectives */}
            <div className="p-4 rounded bg-[#17120e] border border-[#3c2f21] mb-6 font-courier">
              <div className="flex items-center gap-2 text-xs uppercase text-[#e5a953] tracking-widest font-bold mb-3">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Quy Trình Phá Án Noir Dành Cho Thám Tử:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded bg-[#1e1711] border border-[#382b1d]">
                  <div className="text-[#ffd699] font-bold font-special text-sm mb-1 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-amber-400" />
                    1. Khám Nghiệm
                  </div>
                  <p className="text-[#9e8d77] text-[11px] leading-relaxed">
                    Khám nghiệm 4 điểm nghi vấn tại hiện trường, hóa nghiệm độc chất và kính hiển vi UV.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-[#1e1711] border border-[#382b1d]">
                  <div className="text-[#ffd699] font-bold font-special text-sm mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    2. Thẩm Vấn
                  </div>
                  <p className="text-[#9e8d77] text-[11px] leading-relaxed">
                    Đối chất trực tiếp 3 nghi phạm, tung vật chứng để lật tẩy lời khai mâu thuẫn thời khắc 22:15.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-[#1e1711] border border-[#382b1d]">
                  <div className="text-[#ffd699] font-bold font-special text-sm mb-1 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                    3. Bảng Chỉ Đỏ
                  </div>
                  <p className="text-[#9e8d77] text-[11px] leading-relaxed">
                    Ghim polaroid, kéo nối 10 đường dây chỉ đỏ logic để xây dựng chuỗi chứng cứ đanh thép.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-[#1e1711] border border-[#382b1d]">
                  <div className="text-[#ffd699] font-bold font-special text-sm mb-1 flex items-center gap-1.5">
                    <Gavel className="w-3.5 h-3.5 text-red-400" />
                    4. Bản Phán Quyết
                  </div>
                  <p className="text-[#9e8d77] text-[11px] leading-relaxed">
                    Chốt định danh thủ phạm, nộp bằng chứng then chốt và động cơ để nhận huy hiệu Thám Tử Huyền Thoại.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons for Normal Flow & BGK Fast-Track */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-[#473827]">
              {/* Judge / BGK Fast-Track Option */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFastTrackSolve}
                  className="flex items-center gap-2 px-4 py-2.5 rounded bg-gradient-to-r from-[#85270f] to-[#5a1608] hover:from-[#a33214] hover:to-[#6e1e0a] text-[#fff2ea] font-special font-bold text-xs uppercase tracking-wider border border-[#e0564c] shadow-[0_0_20px_rgba(224,86,76,0.35)] transition group"
                >
                  <Zap className="w-4 h-4 text-yellow-300 group-hover:scale-125 transition" />
                  <span>⚡ Demo Mode / BGK Fast-Track (60s)</span>
                </button>
                <span className="text-[11px] font-courier text-[#8a7864] hidden md:inline">
                  (Dành cho BGK xem nhanh toàn bộ lời giải)
                </span>
              </div>

              {/* Start Normal Investigation */}
              <button
                onClick={handleStartInvestigation}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-[#1c1206] font-special font-bold text-sm tracking-widest uppercase shadow-[0_4px_15px_rgba(217,119,6,0.4)] transition"
              >
                <span>Tiếp Nhận Vụ Án / Bắt Đầu Điều Tra</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <GameStateProvider>
      <MainApp />
    </GameStateProvider>
  );
}

