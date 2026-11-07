import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  FolderOpen,
  Search,
  Users,
  GitBranch,
  Gavel,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  Clock,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Flame,
  FileText,
  X,
} from 'lucide-react';
import { useGameState, GameScreen } from '../context/GameStateContext';

interface NavbarProps {
  onOpenDossier: () => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDossier, className = '' }) => {
  const {
    currentScreen,
    setCurrentScreen,
    discoveredEvidenceIds,
    contradictionsFound,
    isDemoMode,
    triggerDemoAutoSolve,
    resetGame,
    isMuted,
    toggleMute,
    playSfx,
  } = useGameState();

  const [isFastTrackOpen, setIsFastTrackOpen] = useState(false);
  const [fastTrackSeconds, setFastTrackSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFastTrackOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 60-second Fast-Track Timer for Judges
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTimerRunning && fastTrackSeconds > 0) {
      timer = setInterval(() => {
        setFastTrackSeconds((prev) => prev - 1);
      }, 1000);
    } else if (fastTrackSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playSfx.success();
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, fastTrackSeconds, playSfx]);

  const handleTriggerAutoSolve = () => {
    playSfx.mystery();
    triggerDemoAutoSolve();
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.15 },
    });
    setFastTrackSeconds(60);
    setIsTimerRunning(true);
    setIsFastTrackOpen(false);
  };

  const handleReset = () => {
    playSfx.click();
    resetGame();
    setFastTrackSeconds(60);
    setIsTimerRunning(false);
    setIsFastTrackOpen(false);
  };

  const handleScreenChange = (screen: GameScreen) => {
    playSfx.pageFlip();
    setCurrentScreen(screen);
    setIsFastTrackOpen(false);
  };

  const navItems = [
    {
      id: 'crime-scene' as GameScreen,
      label: 'Hiện Trường',
      icon: Search,
      badge: `${discoveredEvidenceIds.length}/6`,
      tooltip: 'Khám nghiệm hiện trường vụ án',
    },
    {
      id: 'interrogation' as GameScreen,
      label: 'Thẩm Vấn',
      icon: Users,
      badge: Object.values(contradictionsFound).filter(Boolean).length > 0 ? 'Mâu thuẫn' : undefined,
      tooltip: 'Thẩm vấn 3 nghi phạm then chốt',
    },
    {
      id: 'pinboard' as GameScreen,
      label: 'Bảng Chỉ Đỏ',
      icon: GitBranch,
      badge: isDemoMode ? '10/10 Dây' : undefined,
      tooltip: 'Sơ đồ ghim manh mối và chuỗi suy luận',
    },
    {
      id: 'verdict' as GameScreen,
      label: 'Bản Phán Quyết',
      icon: Gavel,
      badge: isDemoMode ? 'Sẵn Sàng' : undefined,
      tooltip: 'Lập cáo trạng và định danh thủ phạm',
    },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-[#16120e]/95 backdrop-blur-md border-b-2 border-[#3f3224] shadow-[0_8px_30px_rgba(0,0,0,0.85)] ${className}`}>
      {/* Top Banner Ribbon */}
      <div className="bg-[#241c14] border-b border-[#362b1f] px-4 py-1 text-xs text-[#a89b88] flex items-center justify-between font-courier tracking-wider">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#e5a953]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#e5a953]" />
            <span>HỒ SƠ TỐI MẬT #1947: ĐÊM TỔNG DUYỆT NHÀ HÁT</span>
          </span>
          <span className="hidden sm:inline text-[#5f5140]">|</span>
          <span className="hidden md:inline text-[#c8b79f]">
            NẠN NHÂN: <strong className="text-[#ded3be]">HOÀNG LONG (54T)</strong> • TỬ VONG: <span className="text-[#e0564c]">22:15 (KCN POISONING)</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Sound Mute Toggle */}
          <button
            onClick={() => {
              playSfx.click();
              toggleMute();
            }}
            title={isMuted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh hiệu ứng'}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[#a89b88] hover:text-[#f4e8d3] hover:bg-[#32271c] transition text-xs"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Âm: Tắt' : 'Âm: Bật'}</span>
          </button>

          {/* Dossier Quick Access */}
          <button
            onClick={() => {
              playSfx.pageFlip();
              onOpenDossier();
            }}
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#2f241a] hover:bg-[#433425] text-[#ffd699] border border-[#6b523a] rounded shadow transition group"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#e5a953] group-hover:scale-110 transition" />
            <span className="font-special text-xs font-bold tracking-wide">Hồ Sơ Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo / Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDossier}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            title="Mở hồ sơ vụ án Dossier"
          >
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#3f2a1b] to-[#1a120c] border border-[#785b3b] p-1.5 flex items-center justify-center shadow-lg group-hover:border-[#e5a953] transition">
              <FileText className="w-6 h-6 text-[#e5a953] group-hover:rotate-6 transition" />
            </div>
            <div>
              <div className="font-special font-bold text-base sm:text-lg text-[#ded3be] leading-tight tracking-wider flex items-center gap-1.5">
                NOIR DETECTIVE
                {isDemoMode && (
                  <span className="px-1.5 py-0.2 bg-[#7f1d1d] text-[#fecaca] text-[10px] font-mono tracking-widest border border-red-500 rounded">
                    DEMO 100%
                  </span>
                )}
              </div>
              <div className="text-[11px] font-courier text-[#8f7e69] tracking-widest uppercase">
                Bản Giao Hưởng Đoạt Mệnh
              </div>
            </div>
          </button>
        </div>

        {/* Center Screen Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleScreenChange(item.id)}
                title={item.tooltip}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded font-special text-xs sm:text-sm tracking-wide transition ${
                  isActive
                    ? 'bg-[#35281b] text-[#ffd699] border border-[#7e5f3a] shadow-inner font-bold'
                    : 'text-[#ab9c86] hover:text-[#eedec5] hover:bg-[#251d14] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#e5a953]' : 'text-[#857460]'}`} />
                <span className="hidden md:inline">{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 text-[10px] rounded font-courier font-bold ${
                      isActive
                        ? 'bg-[#5a4229] text-[#fff1cc]'
                        : 'bg-[#282017] text-[#8e7e6a] border border-[#3f3325]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#e5a953] shadow-[0_0_8px_#e5a953]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Fast-Track & Demo Controls for Judges (BGK) */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => {
                playSfx.click();
                setIsFastTrackOpen(!isFastTrackOpen);
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded font-special text-xs sm:text-sm font-bold tracking-wider uppercase border transition ${
                isDemoMode
                  ? 'bg-gradient-to-r from-[#7a2e16] to-[#5a1c0d] text-[#fff0eb] border-[#d9532f] shadow-[0_0_15px_rgba(217,83,47,0.4)]'
                  : 'bg-gradient-to-r from-[#3e2c18] to-[#2b1f11] text-[#fcd34d] border-[#936d37] hover:border-[#fcd34d] shadow-lg animate-pulse-amber'
              }`}
            >
              <Zap className={`w-4 h-4 ${isDemoMode ? 'text-orange-300' : 'text-amber-400 animate-bounce'}`} />
              <span className="hidden lg:inline">BGK Fast-Track</span>
              <span className="lg:hidden">Demo</span>
              <span className="px-1.5 py-0.2 bg-black/40 text-[10px] font-mono rounded text-[#fde68a]">
                60s
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFastTrackOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu for Demo Fast-Track */}
            {isFastTrackOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-[#1b1510] border-2 border-[#6d5133] shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-50 p-4 font-special text-[#ded3be]">
                <div className="flex items-center justify-between pb-3 border-b border-[#3d2f21]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-sm text-[#ffd699] tracking-wider uppercase">
                      Bảng Điều Khiển Ban Giám Khảo
                    </span>
                  </div>
                  <button
                    onClick={() => setIsFastTrackOpen(false)}
                    className="p-1 rounded text-[#806f5b] hover:text-[#ded3be] hover:bg-[#2b2118]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="mt-2 text-xs text-[#a89882] font-courier leading-relaxed">
                  Chế độ trải nghiệm nhanh dành cho Ban Giám Khảo: Tự động mở khóa chứng cứ, liên kết bảng chỉ đỏ và giải mã toàn bộ vụ án trong vòng 60 giây.
                </p>

                {/* 60s Fast-Track Timer Display */}
                <div className="mt-3 p-2.5 rounded bg-[#120d09] border border-[#3b2d1f] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-courier text-[#d1c2ab]">
                      Thời gian thẩm định demo:
                    </span>
                  </div>
                  <span className={`font-mono text-sm font-bold ${fastTrackSeconds <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                    00:{fastTrackSeconds < 10 ? `0${fastTrackSeconds}` : fastTrackSeconds}
                  </span>
                </div>

                {/* Auto-Solve Full Trigger Button */}
                <button
                  onClick={handleTriggerAutoSolve}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#993414] to-[#6e1e0a] hover:from-[#b53e18] hover:to-[#87250d] text-[#fff5ea] font-bold text-xs uppercase tracking-widest rounded border border-[#e0564c] shadow-[0_0_15px_rgba(224,86,76,0.35)] transition"
                >
                  <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span>⚡ Phá Án Tự Động 100% (Auto-Solve)</span>
                </button>

                {/* Quick Jump Grid to any Segment */}
                <div className="mt-4 pt-3 border-t border-[#3d2f21]">
                  <div className="text-[11px] font-courier uppercase text-[#96846f] tracking-wider mb-2">
                    Mở nhanh bất kỳ phân đoạn nào:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-courier">
                    <button
                      onClick={() => {
                        onOpenDossier();
                        setIsFastTrackOpen(false);
                      }}
                      className="flex items-center gap-1.5 p-2 rounded bg-[#241c14] hover:bg-[#34271c] text-[#ded3be] border border-[#483726] text-left transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">1. Hồ Sơ Dossier</span>
                    </button>

                    <button
                      onClick={() => handleScreenChange('crime-scene')}
                      className="flex items-center gap-1.5 p-2 rounded bg-[#241c14] hover:bg-[#34271c] text-[#ded3be] border border-[#483726] text-left transition"
                    >
                      <Search className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">2. Hiện Trường</span>
                    </button>

                    <button
                      onClick={() => handleScreenChange('interrogation')}
                      className="flex items-center gap-1.5 p-2 rounded bg-[#241c14] hover:bg-[#34271c] text-[#ded3be] border border-[#483726] text-left transition"
                    >
                      <Users className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">3. Phòng Thẩm Vấn</span>
                    </button>

                    <button
                      onClick={() => handleScreenChange('pinboard')}
                      className="flex items-center gap-1.5 p-2 rounded bg-[#241c14] hover:bg-[#34271c] text-[#ded3be] border border-[#483726] text-left transition"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">4. Bảng Chỉ Đỏ</span>
                    </button>

                    <button
                      onClick={() => handleScreenChange('verdict')}
                      className="col-span-2 flex items-center justify-center gap-1.5 p-2 rounded bg-[#2c1d17] hover:bg-[#3d271f] text-[#ffc5b8] border border-[#833a27] font-bold text-center transition"
                    >
                      <Gavel className="w-3.5 h-3.5 text-red-400" />
                      <span>5. Bản Phán Quyết / Luận Tội</span>
                    </button>
                  </div>
                </div>

                {/* Reset Action */}
                <div className="mt-3 pt-2.5 border-t border-[#34271c] flex items-center justify-between text-xs font-courier text-[#96846f]">
                  <span>Trạng thái: {isDemoMode ? 'Đã phá án' : 'Chưa phá án'}</span>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[#e0564c] hover:text-[#ff786d] underline underline-offset-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Làm mới từ đầu</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
