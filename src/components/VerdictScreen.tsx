import React, { useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Gavel,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileText,
  Clock,
  Skull,
  Scale,
  Flame,
  ChevronRight,
  Volume2,
  VolumeX,
  Eye,
  Info,
  BadgeCheck,
  Layers,
} from 'lucide-react';
import { useGameState } from '../context/GameStateContext';
import { mockCase, mockSuspects, mockEvidences, mockVerdict } from '../data/mockCase';
import { IEvidence, ISuspect } from '../types/game';
import {
  playClick,
  playSuccess,
  playContradiction,
  isAudioMuted,
  toggleAudioMute,
} from '../utils/audio';

export interface VerdictScreenProps {
  onBackToBoard?: () => void;
  onBackToScene?: () => void;
  onResetGame?: () => void;
  className?: string;
}

// Danh sách động cơ khả dĩ cho vụ án
export interface IMotiveOption {
  id: string;
  suspectId: string;
  title: string;
  description: string;
  isCorrect: boolean;
}

export const MOTIVE_OPTIONS: IMotiveOption[] = [
  {
    id: 'MOTIVE-01',
    suspectId: 'SUSPECT-02',
    title: 'Biển thủ 3,2 tỷ & Bị dọa bắt giữ trước 24:00',
    description:
      'Nhạc trưởng Hoàng Long phát hiện khoản thất thoát 3,2 tỷ đồng từ báo cáo kiểm toán độc lập và ra tối hậu thư hạn chót 24:00 phải tự thú, buộc kẻ thủ ác phải ra tay diệt khẩu.',
    isCorrect: true,
  },
  {
    id: 'MOTIVE-02',
    suspectId: 'SUSPECT-01',
    title: 'Tranh chấp di chúc 80% & Ép ký đơn ly hôn',
    description:
      'Nạn nhân bí mật soạn thảo di chúc mới chuyển 80% tài sản vào Quỹ Âm nhạc và tước quyền thừa kế do nghi ngờ vợ ngoại tình.',
    isCorrect: false,
  },
  {
    id: 'MOTIVE-03',
    suspectId: 'SUSPECT-03',
    title: 'Đe dọa vạch trần đạo nhạc & Tước thẻ nghệ sĩ',
    description:
      'Bản concerto đoạt giải quốc tế bị phát hiện chép trộm từ di cảo của cố nhạc sĩ Minh Triết và sắp bị công khai trước truyền thông.',
    isCorrect: false,
  },
  {
    id: 'MOTIVE-04',
    suspectId: 'OTHER',
    title: 'Tư thù cá nhân & Đố kỵ danh tiếng nghệ thuật',
    description:
      'Sự khắc nghiệt, chuyên quyền và độc đoán của Nhạc trưởng Hoàng Long đã tích tụ nỗi căm phẫn kéo dài trong tập thể dàn nhạc.',
    isCorrect: false,
  },
];

export const VerdictScreen: React.FC<VerdictScreenProps> = ({
  onBackToBoard,
  onBackToScene,
  onResetGame,
  className = '',
}) => {
  // Kết nối GameStateContext nếu có
  let contextState: ReturnType<typeof useGameState> | null = null;
  try {
    contextState = useGameState();
  } catch {
    contextState = null;
  }

  const suspects: ISuspect[] = contextState?.suspects || mockSuspects;
  const allEvidences: IEvidence[] = contextState?.evidenceList || mockEvidences;

  // Lấy các chứng cứ đã thu thập hoặc toàn bộ chứng cứ
  const availableEvidences: IEvidence[] = useMemo(() => {
    if (contextState?.discoveredEvidences && contextState.discoveredEvidences.length > 0) {
      return contextState.discoveredEvidences;
    }
    return allEvidences;
  }, [contextState?.discoveredEvidences, allEvidences]);

  // Lựa chọn của người chơi
  const [selectedCulpritId, setSelectedCulpritId] = useState<string>('');
  const [selectedMotiveId, setSelectedMotiveId] = useState<string>('');
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);

  // Trạng thái kết quả phán quyết
  const [hasDeliveredVerdict, setHasDeliveredVerdict] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'verdict' | 'analysis' | 'timeline' | 'confession'>('verdict');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Âm thanh
  const [muted, setMuted] = useState<boolean>(() => isAudioMuted());
  const handleToggleMute = () => {
    const next = toggleAudioMute();
    setMuted(next);
  };

  // Toggle chọn chứng cứ
  const toggleEvidence = (evidenceId: string) => {
    playClick();
    setSelectedEvidenceIds((prev) =>
      prev.includes(evidenceId) ? prev.filter((id) => id !== evidenceId) : [...prev, evidenceId]
    );
  };

  // Chọn nhanh tất cả chứng cứ then chốt (Hỗ trợ demo / BGK)
  const handleSelectKeyDemo = () => {
    playClick();
    setSelectedCulpritId('SUSPECT-02');
    setSelectedMotiveId('MOTIVE-01');
    setSelectedEvidenceIds(['EVD-01', 'EVD-02', 'EVD-03', 'EVD-04', 'EVD-05', 'EVD-06']);
  };

  // Hiệu ứng pháo giấy ăn mừng
  const launchConfetti = useCallback(() => {
    // Đợt 1: Bắn pháo chùm từ giữa
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#fde047'],
    });

    // Đợt 2: Pháo bắn chéo hai cánh gà
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#eab308', '#f97316', '#a855f7'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#eab308', '#f97316', '#a855f7'],
      });
    }, 250);

    // Đợt 3: Mưa sao vàng rực rỡ
    setTimeout(() => {
      confetti({
        particleCount: 110,
        spread: 100,
        origin: { y: 0.4 },
        shapes: ['star', 'circle'],
        colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#ffffff'],
      });
    }, 500);
  }, []);

  // Tính toán điểm số và Xếp hạng Thám tử (Rank S / A / B)
  const evaluation = useMemo(() => {
    if (!hasDeliveredVerdict) return null;

    const isCorrectCulprit = selectedCulpritId === mockVerdict.culpritId;
    const isCorrectMotive = selectedMotiveId === 'MOTIVE-01';

    // Đếm số chứng cứ then chốt trúng khớp
    const keyMatched = selectedEvidenceIds.filter((id) => mockVerdict.keyEvidenceIds.includes(id));
    const keyMatchedCount = keyMatched.length;

    // Kiểm tra chứng cứ then chốt thời gian
    const hasTimelineEvidence =
      selectedEvidenceIds.includes('EVD-02') ||
      selectedEvidenceIds.includes('EVD-04') ||
      selectedEvidenceIds.includes('EVD-06');

    // Kiểm tra chứng cứ độc chất & vật lý
    const hasMurderWeapon = selectedEvidenceIds.includes('EVD-01');
    const hasPhysicalProof = selectedEvidenceIds.includes('EVD-03');

    let totalScore = 0;
    // Điểm hung thủ (tối đa 45)
    if (isCorrectCulprit) totalScore += 45;

    // Điểm động cơ (tối đa 20)
    if (isCorrectMotive) totalScore += 20;

    // Điểm chứng cứ then chốt (tối đa 25 điểm: 5đ/chứng cứ mấu chốt, max 25)
    totalScore += Math.min(25, keyMatchedCount * 5);

    // Điểm mâu thuẫn thời gian (tối đa 10)
    if (hasTimelineEvidence) totalScore += 10;

    // Xác định Rank S / A / B
    let rank: 'Rank S' | 'Rank A' | 'Rank B' | 'Rank C';
    let rankTitle: string;
    let rankColor: string;
    let rankBadgeBg: string;

    if (isCorrectCulprit && totalScore >= 90) {
      rank = 'Rank S';
      rankTitle = 'Thám Tử Huyền Thoại (Master Detective)';
      rankColor = 'text-amber-400';
      rankBadgeBg = 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500';
    } else if (isCorrectCulprit && totalScore >= 70) {
      rank = 'Rank A';
      rankTitle = 'Điều Tra Viên Xuất Sắc (Senior Investigator)';
      rankColor = 'text-indigo-400';
      rankBadgeBg = 'bg-indigo-950/60 border-indigo-500';
    } else if (isCorrectCulprit) {
      rank = 'Rank B';
      rankTitle = 'Thám Tử Tập Sự (Novice Detective)';
      rankColor = 'text-sky-400';
      rankBadgeBg = 'bg-sky-950/60 border-sky-500';
    } else {
      rank = 'Rank C';
      rankTitle = 'Án Oan Chưa Sáng Tỏ (Case Unsolved)';
      rankColor = 'text-rose-500';
      rankBadgeBg = 'bg-rose-950/60 border-rose-500';
    }

    return {
      isCorrectCulprit,
      isCorrectMotive,
      keyMatchedCount,
      totalScore,
      rank,
      rankTitle,
      rankColor,
      rankBadgeBg,
      hasTimelineEvidence,
      hasMurderWeapon,
      hasPhysicalProof,
    };
  }, [hasDeliveredVerdict, selectedCulpritId, selectedMotiveId, selectedEvidenceIds]);

  // Xử lý bấm nút "Tuyên Án"
  const handleDeliverVerdict = () => {
    setErrorMessage(null);

    if (!selectedCulpritId) {
      setErrorMessage('Vui lòng chỉ định một Hung thủ mà bạn nghi vấn nhất!');
      playContradiction();
      return;
    }

    if (!selectedMotiveId) {
      setErrorMessage('Vui lòng chọn Động cơ thúc đẩy kẻ thủ ác gây án!');
      playContradiction();
      return;
    }

    if (selectedEvidenceIds.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một Bằng chứng mấu chốt để chứng minh phán quyết!');
      playContradiction();
      return;
    }

    playClick();
    setIsEvaluating(true);

    setTimeout(() => {
      setIsEvaluating(false);
      setHasDeliveredVerdict(true);
      setActiveTab('analysis');

      // Đồng bộ vào GameStateContext nếu có
      if (contextState?.submitVerdict) {
        const motiveObj = MOTIVE_OPTIONS.find((m) => m.id === selectedMotiveId);
        contextState.submitVerdict(selectedCulpritId, selectedEvidenceIds, motiveObj?.title);
      }

      // Kiểm tra kết quả để phát âm thanh & pháo hoa
      const isCorrect = selectedCulpritId === mockVerdict.culpritId;
      if (isCorrect) {
        playSuccess();
        launchConfetti();
      } else {
        playContradiction();
      }
    }, 700);
  };

  // Làm lại từ đầu / Điều tra lại
  const handleReset = () => {
    playClick();
    setHasDeliveredVerdict(false);
    setSelectedCulpritId('');
    setSelectedMotiveId('');
    setSelectedEvidenceIds([]);
    setErrorMessage(null);
    setActiveTab('verdict');
    if (onResetGame) onResetGame();
  };

  const selectedCulprit = suspects.find((s) => s.id === selectedCulpritId);
  const selectedMotive = MOTIVE_OPTIONS.find((m) => m.id === selectedMotiveId);

  return (
    <div
      className={`min-h-screen bg-neutral-950 text-neutral-100 font-inter flex flex-col selection:bg-amber-500/30 selection:text-amber-200 ${className}`}
    >
      {/* HEADER BAR */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-special text-neutral-100 tracking-wide">
                PHIÊN TÒA PHÁN QUYẾT & KẾT TỘI
              </h1>
              <span className="text-xs px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300 font-courier">
                FINAL VERDICT
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-courier">
              Vụ Án: <span className="text-neutral-200">{mockCase.title}</span> — Nạn nhân:{' '}
              <span className="text-amber-300">{mockCase.victim.name}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectKeyDemo}
            title="Tự động điền đáp án chuẩn xác để kiểm tra nhanh tính năng chấm điểm và pháo giấy"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold bg-neutral-800/80 hover:bg-neutral-700 text-amber-400 border border-amber-500/30 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Điền Mẫu (Demo BGK)
          </button>

          <button
            onClick={handleToggleMute}
            className="p-2 rounded-lg bg-neutral-800/70 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 transition"
            title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {onBackToScene && (
            <button
              onClick={() => {
                playClick();
                onBackToScene();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              Hiện Trường
            </button>
          )}

          {onBackToBoard && (
            <button
              onClick={() => {
                playClick();
                onBackToBoard();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              Bảng Manh Mối
            </button>
          )}
        </div>
      </header>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-500/50 px-4 py-2.5 text-rose-200 text-xs sm:text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 text-xs underline font-courier ml-4"
          >
            Đã hiểu
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col gap-6">
        {/* RESULT PRESENTATION (WHEN VERDICT DELIVERED) */}
        {hasDeliveredVerdict && evaluation && (
          <div className="space-y-6 animate-fadeIn">
            {/* BIG BANNER RANK & OUTCOME */}
            <div
              className={`rounded-2xl border p-6 relative overflow-hidden backdrop-blur-md shadow-2xl ${
                evaluation.isCorrectCulprit
                  ? 'bg-neutral-900/90 border-amber-500/40 shadow-amber-950/30'
                  : 'bg-neutral-900/90 border-rose-500/40 shadow-rose-950/30'
              }`}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 z-10 relative">
                {/* Left: Status icon & Text */}
                <div className="flex items-center gap-5 text-center md:text-left">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
                      evaluation.isCorrectCulprit
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-amber-500/20'
                        : 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-rose-500/20'
                    }`}
                  >
                    {evaluation.isCorrectCulprit ? (
                      <CheckCircle2 className="w-10 h-10 animate-bounce" />
                    ) : (
                      <XCircle className="w-10 h-10 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                      <span
                        className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          evaluation.isCorrectCulprit
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {evaluation.isCorrectCulprit ? 'PHÁN QUYẾT CHÍNH XÁC' : 'PHÁN QUYẾT CHƯA CHÍNH XÁC'}
                      </span>
                      <span className="text-xs text-neutral-400 font-courier">Điểm số: {evaluation.totalScore}/100</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold font-special tracking-wide text-neutral-100">
                      {evaluation.isCorrectCulprit
                        ? `VẠCH TRẦN THỦ PHẠM: ${mockVerdict.culpritName}`
                        : `THỦ PHẠM THỰC SỰ LÀ: ${mockVerdict.culpritName}`}
                    </h2>

                    <p className="text-xs sm:text-sm text-neutral-300 font-courier mt-1 max-w-2xl">
                      {evaluation.isCorrectCulprit
                        ? 'Bạn đã xâu chuỗi hoàn hảo chứng cứ hiện trường, bóc trần kế hoạch tạo ngoại phạm giả lúc 22:15 và đưa kẻ thủ ác ra trước ánh sáng pháp lý!'
                        : 'Lập luận của bạn đã bị kẻ thủ ác đánh lạc hướng bởi hiện trường ngụy tạo. Hãy xem lại mâu thuẫn thời gian then chốt lúc 22:15.'}
                    </p>
                  </div>
                </div>

                {/* Right: RANK BADGE (RANK S / A / B) */}
                <div className="flex flex-col items-center md:items-end shrink-0">
                  <div
                    className={`px-6 py-4 rounded-xl border flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 ${evaluation.rankBadgeBg}`}
                  >
                    <div className="flex items-center gap-2">
                      <Award className={`w-6 h-6 ${evaluation.rankColor}`} />
                      <span className={`text-4xl sm:text-5xl font-black font-special ${evaluation.rankColor} tracking-wider`}>
                        {evaluation.rank}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold tracking-wide text-neutral-200 mt-1 uppercase text-center">
                      {evaluation.rankTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {evaluation.isCorrectCulprit && (
                      <button
                        onClick={launchConfetti}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Bắn Pháo Giấy Nữa
                      </button>
                    )}
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Phán Quyết Lại
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative background watermark */}
              <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none select-none font-special text-9xl font-black text-neutral-100">
                VERDICT
              </div>
            </div>

            {/* NAVIGATION TABS FOR RESULT ANALYSIS */}
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto font-courier text-xs sm:text-sm">
              <button
                onClick={() => {
                  playClick();
                  setActiveTab('analysis');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'analysis'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                }`}
              >
                <FileText className="w-4 h-4" />
                Hồ Sơ Phân Tích Suy Luận
              </button>

              <button
                onClick={() => {
                  playClick();
                  setActiveTab('timeline');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'timeline'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                }`}
              >
                <Clock className="w-4 h-4" />
                Mâu Thuẫn Mốc 22:15
              </button>

              <button
                onClick={() => {
                  playClick();
                  setActiveTab('confession');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'confession'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                }`}
              >
                <Skull className="w-4 h-4" />
                Phương Thức & Lời Thú Nhận
              </button>
            </div>

            {/* TAB 1: DETAILED DEDUCTION ANALYSIS */}
            {activeTab === 'analysis' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Comprehensive Case Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Summary Breakdown Box */}
                  <div className="p-6 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-4">
                    <div className="flex items-center gap-2 text-amber-400 font-special text-lg border-b border-neutral-800 pb-2">
                      <Scale className="w-5 h-5" />
                      <span>PHÂN TÍCH SUY LUẬN TOÀN DIỆN VỀ 3 NGHI PHẠM</span>
                    </div>

                    <div className="text-xs sm:text-sm text-neutral-300 space-y-4 leading-relaxed font-courier">
                      {/* Suspect 1 */}
                      <div className="p-3.5 rounded-lg bg-neutral-950/60 border border-neutral-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-neutral-100">1. Quỳnh Nga (Vợ Nạn Nhân / Ca Sĩ Opera):</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                            NGOẠI PHẠM RÕ RÀNG
                          </span>
                        </div>
                        <p className="text-neutral-400 text-xs">
                          Dù có động cơ về khoản thừa kế di chúc 80% và mâu thuẫn hôn nhân, nhưng lúc 22:15 cô đang ở phòng
                          phục trang tầng 2 thử đầm dạ hội với thợ may Lan Anh và chuyên viên trang điểm Minh Châu từ 22:05
                          đến 22:25. Hai nhân chứng độc lập này đã hoàn toàn loại trừ khả năng Quỳnh Nga có mặt ở phòng nhạc trưởng.
                        </p>
                      </div>

                      {/* Suspect 3 */}
                      <div className="p-3.5 rounded-lg bg-neutral-950/60 border border-neutral-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-neutral-100">2. Tuấn Kiệt (Nghệ Sĩ Vĩ Cầm Solo):</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                            NGOẠI PHẠM GIẢ NHƯNG KHÔNG PHẢI HUNG THỦ
                          </span>
                        </div>
                        <p className="text-neutral-400 text-xs">
                          Có động cơ lo sợ bị tước thẻ nghệ sĩ và vạch trần đạo nhạc. Tuấn Kiệt dùng loa Bluetooth phát bài
                          Danse Macabre để tạo ngoại phạm giả. Tuy nhiên, anh ta chỉ bước vào phòng lúc 22:22 để trộm tài
                          liệu thì phát hiện Hoàng Long đã tắt thở từ trước, quá hoảng sợ nên đã tháo chạy mà chưa gây ra vụ án.
                        </p>
                      </div>

                      {/* Suspect 2 (Culprit) */}
                      <div className="p-3.5 rounded-lg bg-neutral-950/80 border border-amber-500/40 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-amber-300">
                            3. Huy Hoàng (Trợ Lý Riêng — HUNG THỦ THỰC SỰ):
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50">
                            CHÂN TƯỚNG TỘI ÁC
                          </span>
                        </div>
                        <p className="text-neutral-300 text-xs leading-relaxed">
                          Huy Hoàng là người duy nhất nắm lịch trình và trực tiếp chuẩn bị ấm trà hoa cúc nhiễm Kali Xianua
                          (EVD-01). Mảnh vải len navy và cúc áo vest rách kẹp trong tay nạn nhân (EVD-03) khớp hoàn hảo với
                          áo vest của anh ta. Mâu thuẫn chết người nằm ở lời khai: Huy Hoàng khai lúc 22:15 đi ngang qua vẫn nghe
                          tiếng nạn nhân gọi điện thoại to tiếng; nhưng cước viễn thông (EVD-06) xác nhận cuộc gọi kết thúc lúc 22:08
                          và đồng hồ Patek Philippe (EVD-02) bị vỡ kẹt kim lúc 22:15 trong lúc hai bên xô xát dữ dội.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deduction Comparison Scorecard */}
                  <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                    <h3 className="text-sm font-semibold font-mono text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-amber-400" />
                      Bảng Đánh Giá Quyết Định Của Bạn
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        className={`p-3 rounded-lg border text-xs font-mono flex flex-col justify-between ${
                          evaluation.isCorrectCulprit
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        <span className="text-neutral-400 block mb-1">Hung Thủ Chọn:</span>
                        <span className="font-bold text-sm">
                          {selectedCulprit ? selectedCulprit.name : 'Chưa chọn'}
                        </span>
                        <span className="mt-2 text-[11px]">
                          {evaluation.isCorrectCulprit ? '✓ Khớp chính xác (+45đ)' : '✗ Sai thủ phạm (+0đ)'}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-lg border text-xs font-mono flex flex-col justify-between ${
                          evaluation.isCorrectMotive
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        <span className="text-neutral-400 block mb-1">Động Cơ Chọn:</span>
                        <span className="font-bold truncate text-xs" title={selectedMotive?.title}>
                          {selectedMotive ? selectedMotive.title : 'Chưa chọn'}
                        </span>
                        <span className="mt-2 text-[11px]">
                          {evaluation.isCorrectMotive ? '✓ Khớp động cơ gốc (+20đ)' : '✗ Sai động cơ (+0đ)'}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-lg border text-xs font-mono flex flex-col justify-between ${
                          evaluation.keyMatchedCount >= 3
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        <span className="text-neutral-400 block mb-1">Chứng Cứ Mấu Chốt:</span>
                        <span className="font-bold text-sm">
                          {evaluation.keyMatchedCount}/{mockVerdict.keyEvidenceIds.length} chứng cứ then chốt
                        </span>
                        <span className="mt-2 text-[11px]">
                          +{Math.min(25, evaluation.keyMatchedCount * 5)}đ chứng cứ & +
                          {evaluation.hasTimelineEvidence ? '10đ' : '0đ'} mâu thuẫn thời gian
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 1 Col: Commendation Letter & Badges */}
                <div className="space-y-6">
                  {/* Police Commendation Letter */}
                  <div className="p-6 rounded-xl bg-neutral-900/90 border border-neutral-700 relative shadow-xl font-courier">
                    <div className="border-b border-neutral-800 pb-3 mb-4 text-center">
                      <div className="text-[10px] tracking-widest uppercase text-amber-400 font-bold">
                        BỘ CÔNG AN — CỤC CẢNH SÁT HÌNH SỰ
                      </div>
                      <h4 className="text-sm font-bold font-special text-neutral-100 tracking-wide mt-1">
                        THƯ BIỂU DƯƠNG THÁM TỬ ĐIỀU TRA
                      </h4>
                    </div>

                    <div className="text-xs text-neutral-300 leading-relaxed space-y-3">
                      <p>
                        Kính gửi Ban Chuyên Án & Thám Tử Trưởng,
                      </p>
                      <p>
                        Căn cứ vào kết luận điều tra và phán quyết thuyết phục đối với vụ án sát hại Nhạc trưởng Hoàng Long
                        tại Nhà hát Lớn, Cơ quan Điều tra trân trọng ghi nhận công lao xuất sắc trong việc phục dựng hiện trường
                        và bẻ gãy chứng cứ ngoại phạm tinh vi của hung thủ Huy Hoàng.
                      </p>
                      <div className="p-3 rounded bg-neutral-950 border border-neutral-800 text-[11px] text-amber-300/90 italic">
                        &quot;Một lập luận sắc sảo, kết hợp hoàn hảo giữa pháp y, cơ cấu đồng hồ cơ khí và viễn thông hiện đại.
                        Công lý đã được thực thi trọn vẹn.&quot;
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                      <div>
                        <span>Hà Nội, 00:30</span>
                        <div className="text-[10px] text-neutral-500">Đã đóng dấu mật</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-neutral-200">Đại tá Trần Hữu Nghị</span>
                        <div className="text-[10px] text-neutral-500">Thủ trưởng Cơ quan CSĐT</div>
                      </div>
                    </div>
                  </div>

                  {/* Detective Seal / Badge */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-amber-500/30 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                      <Award className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400 uppercase font-mono">Huy Hiệu Thám Tử</div>
                      <div className="text-base font-bold text-amber-300 font-special">{evaluation.rankTitle}</div>
                      <div className="text-xs text-neutral-400 font-courier">Điểm chuyên án: {evaluation.totalScore}/100</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TIMELINE CONFLICT BREAKDOWN */}
            {activeTab === 'timeline' && (
              <div className="p-6 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-6 animate-fadeIn font-courier">
                <div className="flex items-center gap-2 text-amber-400 font-special text-lg border-b border-neutral-800 pb-2">
                  <Clock className="w-5 h-5" />
                  <span>MÂU THUẪN MỐC THỜI GIAN 22:15 ĐẬP TAN LỜI KHAI NGOẠI PHẠM</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Claimed Alibi */}
                  <div className="p-5 rounded-xl bg-neutral-950/70 border border-rose-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase">
                      <AlertTriangle className="w-4 h-4" />
                      Lời Khai Ngụy Tạo Của Huy Hoàng
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed italic">
                      &quot;{mockVerdict.timelineConflict.claimedAlibi}&quot;
                    </p>
                    <div className="pt-2 text-[11px] text-rose-300/80">
                      → Mục đích: Dời mốc thời gian tử vong của nạn nhân ra sau 22:15 để tạo chứng cứ ngoại phạm giả mạo khi hắn
                      đang ở lối thoát hiểm.
                    </div>
                  </div>

                  {/* Objective Hard Facts */}
                  <div className="p-5 rounded-xl bg-neutral-950/70 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      Sự Thật Khách Quan Đã Bị Vạch Trần
                    </div>
                    <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                      <li>
                        • <strong className="text-emerald-300">22:08:</strong> Cuộc gọi viễn thông cuối cùng của Nhạc trưởng kết thúc.
                        Từ 22:09 hoàn toàn không có bất kỳ cuộc gọi nào (EVD-06).
                      </li>
                      <li>
                        • <strong className="text-emerald-300">22:12:</strong> Camera ghi nhận bóng người mặc vest navy bưng khay trà
                        vào phòng (EVD-04).
                      </li>
                      <li>
                        • <strong className="text-emerald-300">22:15:</strong> Đồng hồ Patek Philippe trên tay nạn nhân vỡ nát do xô
                        xát khi trúng độc Kali Xianua, giật đứt cúc áo của Huy Hoàng (EVD-02, EVD-03).
                      </li>
                      <li>
                        • <strong className="text-emerald-300">22:17:</strong> Kẻ thủ ác vội vã tháo chạy mang theo hồ sơ kiểm toán
                        3,2 tỷ bị xé (EVD-05).
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                  <strong>Kết luận giám định thời gian:</strong> {mockVerdict.timelineConflict.explanation}
                </div>
              </div>
            )}

            {/* TAB 3: METHOD & FULL CONFESSION */}
            {activeTab === 'confession' && (
              <div className="p-6 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-6 animate-fadeIn font-courier">
                <div className="flex items-center gap-2 text-amber-400 font-special text-lg border-b border-neutral-800 pb-2">
                  <Skull className="w-5 h-5" />
                  <span>PHƯƠNG THỨC GÂY ÁN & BIÊN BẢN HỎI CUNG THỦ PHẠM</span>
                </div>

                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-2 font-mono">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Phương Thức Thủ Ác Chi Tiết:
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {mockVerdict.method}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-2 font-mono">
                    <Gavel className="w-4 h-4 text-rose-400" />
                    Phán Quyết Kết Án Của Tòa Án Nhân Dân:
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-300 font-bold leading-relaxed">
                    {mockVerdict.conclusion}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VERDICT FORM (WHEN VERDICT NOT DELIVERED YET) */}
        {!hasDeliveredVerdict && (
          <div className="space-y-8 animate-fadeIn">
            {/* Step indicators / Guidance */}
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-special text-neutral-100 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-amber-400" />
                  LẬP HỒ SƠ TUYÊN ÁN VỤ ÁN
                </h2>
                <p className="text-xs text-neutral-400 font-courier mt-1">
                  Hãy cân nhắc toàn bộ manh mối và mâu thuẫn thời gian để chọn đúng 3 yếu tố trụ cột của vụ án.
                </p>
              </div>

              {/* Progress counter */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <span
                  className={`px-3 py-1 rounded-full border ${
                    selectedCulpritId
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  1. Hung Thủ: {selectedCulpritId ? '✓ Đã chọn' : 'Chưa'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full border ${
                    selectedMotiveId
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  2. Động Cơ: {selectedMotiveId ? '✓ Đã chọn' : 'Chưa'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full border ${
                    selectedEvidenceIds.length > 0
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  3. Bằng Chứng ({selectedEvidenceIds.length})
                </span>
              </div>
            </div>

            {/* SECTION 1: CHỌN HUNG THỦ (CULPRIT SELECTION) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">
                    1
                  </div>
                  <h3 className="text-base font-bold font-special text-neutral-100 tracking-wide uppercase">
                    CHỈ ĐỊNH HUNG THỦ (CHỌN 1 TRONG 3 NGHI PHẠM)
                  </h3>
                </div>
                <span className="text-xs text-neutral-400 font-courier hidden sm:inline">
                  Ai là kẻ đã ra tay sát hại Nhạc trưởng Hoàng Long?
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suspects.map((suspect) => {
                  const isSelected = selectedCulpritId === suspect.id;
                  return (
                    <div
                      key={suspect.id}
                      onClick={() => {
                        playClick();
                        setSelectedCulpritId(suspect.id);
                      }}
                      className={`group relative rounded-xl p-5 border cursor-pointer transition-all duration-200 backdrop-blur-sm flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/50 scale-[1.02]'
                          : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-neutral-950 flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="w-3 h-3" />
                          ĐÃ CHỈ ĐỊNH
                        </div>
                      )}

                      <div>
                        {/* Avatar & Basic Info */}
                        <div className="flex items-center gap-3.5 mb-3">
                          <div className="relative">
                            <img
                              src={suspect.avatar}
                              alt={suspect.name}
                              className={`w-14 h-14 rounded-full object-cover border-2 transition ${
                                isSelected ? 'border-amber-400' : 'border-neutral-700 group-hover:border-neutral-500'
                              }`}
                            />
                            <span
                              className={`absolute -bottom-1 -right-1 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                suspect.suspicionLevel === 'high'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-600'
                                  : 'bg-amber-950 text-amber-300 border border-amber-600'
                              }`}
                            >
                              {suspect.suspicionLevel === 'high' ? 'CAO' : 'TRUNG BÌNH'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-neutral-100 font-special tracking-wide group-hover:text-amber-300 transition">
                              {suspect.name}
                            </h4>
                            <p className="text-xs text-neutral-400 font-courier">{suspect.role}</p>
                            <span className="text-[11px] text-neutral-500 font-courier">{suspect.age} tuổi</span>
                          </div>
                        </div>

                        {/* Alibi & Details */}
                        <div className="text-xs text-neutral-300 font-courier space-y-2 mt-2 pt-2 border-t border-neutral-800">
                          <div>
                            <span className="text-neutral-400 font-semibold block text-[11px]">Ngoại phạm khai báo:</span>
                            <p className="text-neutral-300 text-[11px] leading-relaxed line-clamp-2">
                              {suspect.alibi}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-500">Mã: {suspect.id}</span>
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            isSelected ? 'text-amber-400' : 'text-neutral-400 group-hover:text-neutral-200'
                          }`}
                        >
                          {isSelected ? 'Đã Chọn Hung Thủ' : 'Chọn Nghi Phạm'}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 2: CHỌN ĐỘNG CƠ (MOTIVE SELECTION) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">
                    2
                  </div>
                  <h3 className="text-base font-bold font-special text-neutral-100 tracking-wide uppercase">
                    XÁC ĐỊNH ĐỘNG CƠ GÂY ÁN MẤU CHỐT
                  </h3>
                </div>
                <span className="text-xs text-neutral-400 font-courier hidden sm:inline">
                  Động cơ chính thúc đẩy hành vi sát hại là gì?
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOTIVE_OPTIONS.map((motive) => {
                  const isSelected = selectedMotiveId === motive.id;
                  return (
                    <div
                      key={motive.id}
                      onClick={() => {
                        playClick();
                        setSelectedMotiveId(motive.id);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 backdrop-blur-sm flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/40 scale-[1.01]'
                          : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500 text-neutral-950'
                              : 'border-neutral-600 bg-neutral-800'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-neutral-950" />}
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-bold font-special tracking-wide ${
                              isSelected ? 'text-amber-300' : 'text-neutral-200'
                            }`}
                          >
                            {motive.title}
                          </h4>
                          <p className="text-xs text-neutral-400 font-courier mt-1.5 leading-relaxed">
                            {motive.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                        <span>{motive.id}</span>
                        {isSelected && <span className="text-amber-400 font-bold">✓ ĐÃ CHỌN ĐỘNG CƠ NÀY</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 3: CHỌN BẰNG CHỨNG MẤU CHỐT (KEY EVIDENCE SELECTION) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">
                    3
                  </div>
                  <h3 className="text-base font-bold font-special text-neutral-100 tracking-wide uppercase">
                    CHỌN BẰNG CHỨNG MẤU CHỐT (ĐÃ CHỌN: {selectedEvidenceIds.length})
                  </h3>
                </div>
                <span className="text-xs text-neutral-400 font-courier hidden sm:inline">
                  Tích chọn các vật chứng vạch trần độc chất và mâu thuẫn thời gian
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableEvidences.map((evidence) => {
                  const isSelected = selectedEvidenceIds.includes(evidence.id);
                  return (
                    <div
                      key={evidence.id}
                      onClick={() => toggleEvidence(evidence.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 backdrop-blur-sm flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500 shadow-md shadow-amber-950/30 scale-[1.01]'
                          : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                      }`}
                    >
                      <div>
                        {/* Title & Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {evidence.id}
                          </span>
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                              isSelected
                                ? 'bg-amber-500 border-amber-400 text-neutral-950'
                                : 'bg-neutral-800 border-neutral-600'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <h4
                          className={`text-sm font-bold font-special leading-snug ${
                            isSelected ? 'text-amber-300' : 'text-neutral-100'
                          }`}
                        >
                          {evidence.title}
                        </h4>

                        <p className="text-xs text-neutral-400 font-courier mt-2 line-clamp-3 leading-relaxed">
                          {evidence.details || evidence.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                        <span className="truncate max-w-[180px]">{evidence.locationFound}</span>
                        {isSelected && <span className="text-amber-400 font-semibold shrink-0">✓ Đã ghim</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ACTION SECTION: BUTTON TUYÊN ÁN */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-neutral-400 font-courier text-center sm:text-left">
                {selectedCulpritId && selectedMotiveId && selectedEvidenceIds.length > 0 ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã chuẩn bị đầy đủ 3 trụ cột chứng cứ. Bạn có thể tiến hành Tuyên Án!
                  </span>
                ) : (
                  <span className="text-amber-400/90 flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    Vui lòng chọn Hung thủ, Động cơ và ít nhất 1 Bằng chứng mấu chốt.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDeliverVerdict}
                  disabled={isEvaluating}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-special text-base font-bold uppercase tracking-wider text-neutral-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 disabled:opacity-50 transition shadow-lg shadow-amber-500/25"
                >
                  <Gavel className={`w-5 h-5 ${isEvaluating ? 'animate-spin' : ''}`} />
                  {isEvaluating ? 'ĐANG PHÂN TÍCH SUY LUẬN...' : 'TUYÊN ÁN'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerdictScreen;
