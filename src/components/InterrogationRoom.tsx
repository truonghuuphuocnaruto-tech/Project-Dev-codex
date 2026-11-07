import React, { useState, useMemo } from 'react';
import {
  Users,
  ShieldAlert,
  FileText,
  Volume2,
  VolumeX,
  Search,
  Clock,
  Sparkles,
  HelpCircle,
  X,
  ChevronRight,
  Flame,
  Scale,
  Mic,
  Activity,
  Eye,
  Lock,
  RotateCcw,
  BookOpen,
  Radio,
  Fingerprint,
} from 'lucide-react';
import {
  playClick,
  playTypewriter,
  playContradiction,
  playMysteryPiano,
  playSuccess,
  isAudioMuted,
  toggleAudioMute,
} from '../utils/audio';
import {
  IEvidence,
  ISuspect,
  IDialogueOption,
  IDialogueNode,
} from '../types/game';
import {
  mockSuspects,
  mockEvidences,
  mockDialogues,
} from '../data/mockCase';
import { useGameState } from '../context/GameStateContext';

export interface InterrogationRoomProps {
  initialSuspectId?: string;
  onNavigateToBoard?: () => void;
  onNavigateToScene?: () => void;
  onContradictionFound?: (suspectId: string, evidenceId: string) => void;
  className?: string;
}

// Psychological tension state calculation
interface ITensionState {
  heartRate: number; // bpm
  status: 'Bình tĩnh' | 'Dao động' | 'Căng thẳng' | 'Hoảng loạn' | 'Suy sụp';
  color: string;
}

export const InterrogationRoom: React.FC<InterrogationRoomProps> = ({
  initialSuspectId = 'SUSPECT-02',
  onNavigateToBoard,
  onNavigateToScene,
  onContradictionFound,
  className = '',
}) => {
  // Try to safely access GameStateContext if available
  let contextState: ReturnType<typeof useGameState> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contextState = useGameState();
  } catch {
    contextState = null;
  }

  // --- AUDIO STATE ---
  const [muted, setMuted] = useState<boolean>(() => isAudioMuted());
  const handleToggleMute = () => {
    const next = toggleAudioMute();
    setMuted(next);
  };

  // --- SUSPECT SELECTION ---
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(
    contextState?.selectedSuspectId || initialSuspectId
  );

  // Fallback local suspects if not using context
  const localSuspects = useMemo<ISuspect[]>(() => {
    return contextState ? contextState.suspects : mockSuspects;
  }, [contextState]);

  const activeSuspects = contextState ? contextState.suspects : localSuspects;
  const currentSuspect = useMemo(() => {
    return (
      activeSuspects.find((s) => s.id === selectedSuspectId) ||
      activeSuspects[0]
    );
  }, [activeSuspects, selectedSuspectId]);

  // Sync with context if selection changes
  const handleSelectSuspect = (suspectId: string) => {
    playClick();
    setSelectedSuspectId(suspectId);
    if (contextState) {
      contextState.setSelectedSuspectId(suspectId);
    }
  };

  // --- VIEW TAB (Interrogation vs Dossier) ---
  const [activeTab, setActiveTab] = useState<'dialogue' | 'dossier'>('dialogue');

  // --- CONTRADICTIONS & SUSPICION STATE ---
  const [contradictions, setContradictions] = useState<Record<string, boolean>>(() => {
    return contextState?.contradictionsFound || {};
  });

  // Dynamic suspicion levels that update upon presenting contradictory evidence
  const [dynamicSuspicion, setDynamicSuspicion] = useState<
    Record<string, 'low' | 'medium' | 'high' | 'critical'>
  >({
    'SUSPECT-01': 'medium',
    'SUSPECT-02': 'high',
    'SUSPECT-03': 'medium',
  });

  // Suspect notes
  const [notes, setNotes] = useState<Record<string, string[]>>(() => {
    return (
      contextState?.suspectNotes || {
        'SUSPECT-01': [
          'Khai rằng ở phòng phục trang tầng 2 lúc 22:15 thử đầm dạ hội.',
          'Có thợ may Lan Anh và chuyên viên Minh Châu làm chứng.',
        ],
        'SUSPECT-02': [
          'Người duy nhất chuẩn bị trà hoa cúc cho Nhạc trưởng.',
          'Khai rằng nghe thấy tiếng điện thoại của nạn nhân lúc 22:15.',
        ],
        'SUSPECT-03': [
          'Bị nạn nhân đe dọa tước thẻ nghệ sĩ vì đạo nhạc Minh Triết.',
          'Khai rằng say sưa chơi vĩ cầm trong phòng tập lúc 22:15.',
        ],
      }
    );
  });

  // --- DIALOGUE BRANCHING ENGINE ---
  const [dialogueNodes, setDialogueNodes] = useState<Record<string, string>>(() => {
    return (
      contextState?.currentDialogueNodes || {
        'SUSPECT-01': 'DLG-QN-01',
        'SUSPECT-02': 'DLG-HH-01',
        'SUSPECT-03': 'DLG-TK-01',
      }
    );
  });

  const currentNodeId = dialogueNodes[selectedSuspectId] || currentSuspect.initialDialogueId;
  const currentNode: IDialogueNode =
    mockDialogues[currentNodeId] || {
      id: currentNodeId,
      speaker: currentSuspect.name,
      text: 'Tôi sẵn sàng trả lời các câu hỏi của điều tra viên.',
      options: [],
    };

  // Dialogue History transcript per suspect
  const [transcript, setTranscript] = useState<
    Record<string, Array<{ speaker: string; text: string; isQuestion?: boolean }>>
  >({
    'SUSPECT-01': [
      {
        speaker: 'Điều tra viên',
        text: 'Bắt đầu phiên thẩm vấn sơ bộ Ca sĩ Quỳnh Nga.',
        isQuestion: true,
      },
      {
        speaker: 'Quỳnh Nga',
        text: mockDialogues['DLG-QN-01']?.text || 'Tôi sẵn sàng hợp tác.',
      },
    ],
    'SUSPECT-02': [
      {
        speaker: 'Điều tra viên',
        text: 'Bắt đầu phiên thẩm vấn Trợ lý Huy Hoàng về vụ án mạng.',
        isQuestion: true,
      },
      {
        speaker: 'Huy Hoàng',
        text: mockDialogues['DLG-HH-01']?.text || 'Tôi sẵn sàng trả lời.',
      },
    ],
    'SUSPECT-03': [
      {
        speaker: 'Điều tra viên',
        text: 'Bắt đầu phiên thẩm vấn Nghệ sĩ vĩ cầm Tuấn Kiệt.',
        isQuestion: true,
      },
      {
        speaker: 'Tuấn Kiệt',
        text: mockDialogues['DLG-TK-01']?.text || 'Tôi rất bàng hoàng.',
      },
    ],
  });

  // --- EVIDENCE MANAGEMENT ---
  const discoveredEvidenceIds: string[] = useMemo(() => {
    if (contextState) {
      return contextState.discoveredEvidenceIds;
    }
    // Standalone default: player has discovered essential clues
    return ['EVD-01', 'EVD-02', 'EVD-03', 'EVD-04', 'EVD-05', 'EVD-06'];
  }, [contextState]);

  const availableEvidences: IEvidence[] = useMemo(() => {
    if (contextState) {
      return contextState.evidenceList.filter((e) =>
        contextState.discoveredEvidenceIds.includes(e.id)
      );
    }
    return mockEvidences;
  }, [contextState]);

  // --- PRESENT EVIDENCE MODAL STATE ---
  const [isPresentModalOpen, setIsPresentModalOpen] = useState<boolean>(false);
  const [selectedEvidenceForPresent, setSelectedEvidenceForPresent] = useState<IEvidence | null>(
    null
  );
  const [evidenceSearchTerm, setEvidenceSearchTerm] = useState<string>('');
  const [evidenceFilterType, setEvidenceFilterType] = useState<string>('all');

  // Confrontation / Objection Banner & Drama Effect
  const [objectionAlert, setObjectionAlert] = useState<{
    show: boolean;
    success: boolean;
    title: string;
    message: string;
    unlockedClue?: string;
  } | null>(null);

  // Reset interrogation branch back to initial node
  const handleResetDialogue = () => {
    playClick();
    const initialNodeId = currentSuspect.initialDialogueId;
    setDialogueNodes((prev) => ({
      ...prev,
      [selectedSuspectId]: initialNodeId,
    }));
    const initialText = mockDialogues[initialNodeId]?.text || 'Tôi sẵn sàng hợp tác.';
    setTranscript((prev) => ({
      ...prev,
      [selectedSuspectId]: [
        {
          speaker: 'Điều tra viên',
          text: `Thiết lập lại phiên hỏi cung với ${currentSuspect.name}.`,
          isQuestion: true,
        },
        {
          speaker: currentSuspect.name,
          text: initialText,
        },
      ],
    }));
  };

  // Handling dialogue options
  const handleSelectOption = (option: IDialogueOption) => {
    // Check if evidence requirement is fulfilled
    if (option.requiredEvidenceId && !discoveredEvidenceIds.includes(option.requiredEvidenceId)) {
      playClick();
      alert(`Bạn cần thu thập chứng cứ [${option.requiredEvidenceId}] trước khi hỏi câu này!`);
      return;
    }

    playTypewriter();

    // Context synchronization if available
    if (contextState) {
      contextState.chooseDialogueOption(selectedSuspectId, option);
    }

    // Append to transcript
    setTranscript((prev) => {
      const currentList = prev[selectedSuspectId] || [];
      const updated = [
        ...currentList,
        { speaker: 'Điều tra viên', text: option.text, isQuestion: true },
      ];
      if (option.nextNodeId && mockDialogues[option.nextNodeId]) {
        updated.push({
          speaker: mockDialogues[option.nextNodeId].speaker,
          text: mockDialogues[option.nextNodeId].text,
        });
      }
      return {
        ...prev,
        [selectedSuspectId]: updated,
      };
    });

    // Contradiction trigger
    if (option.triggerContradiction) {
      playContradiction();
      setContradictions((prev) => ({ ...prev, [selectedSuspectId]: true }));
      if (selectedSuspectId === 'SUSPECT-02') {
        setDynamicSuspicion((prev) => ({ ...prev, [selectedSuspectId]: 'critical' }));
      }
      if (onContradictionFound) {
        onContradictionFound(selectedSuspectId, option.requiredEvidenceId || 'CONTRADICTION');
      }
    }

    // Advance dialogue node
    if (option.nextNodeId) {
      setDialogueNodes((prev) => ({
        ...prev,
        [selectedSuspectId]: option.nextNodeId!,
      }));
    }
  };

  // --- PRESENT EVIDENCE (TRƯNG BẰNG CHỨNG) LOGIC ---
  const handleConfirmPresentEvidence = () => {
    if (!selectedEvidenceForPresent) return;
    const ev = selectedEvidenceForPresent;
    setIsPresentModalOpen(false);

    // Call context if available
    if (contextState) {
      const result = contextState.presentEvidence(selectedSuspectId, ev.id);
      if (result.contradiction) {
        setContradictions((prev) => ({ ...prev, [selectedSuspectId]: true }));
      }
    }

    // Detailed confrontation branching logic
    if (selectedSuspectId === 'SUSPECT-02') {
      // Huy Hoàng is the culprit!
      if (ev.id === 'EVD-02') {
        // Đồng hồ vỡ 22:15
        playContradiction();
        playMysteryPiano();
        setContradictions((prev) => ({ ...prev, [selectedSuspectId]: true }));
        setDynamicSuspicion((prev) => ({ ...prev, [selectedSuspectId]: 'critical' }));

        const clue =
          'VẬT CHỨNG QUYẾT ĐỊNH: Kim đồng hồ nạn nhân vỡ kẹt tại 22:15 do va đập lúc ngã gục. Nạn nhân đã tử vong tại mốc này, chứng minh lời khai nghe tiếng nói chuyện điện thoại lúc 22:15 của Huy Hoàng là hoàn toàn ngụy tạo!';

        setNotes((prev) => ({
          ...prev,
          [selectedSuspectId]: [...(prev[selectedSuspectId] || []), clue],
        }));

        setObjectionAlert({
          show: true,
          success: true,
          title: 'MÂU THUẪN THEN CHỐT ĐÃ BỊ BÓC TRẦN! (OBJECTION)',
          message:
            'Đồng hồ Patek Philippe của Nhạc trưởng vỡ nát dừng đúng 22:15 khi xô xát vì trúng độc. Nạn nhân không thể nào còn nói chuyện điện thoại như Huy Hoàng đã khai man!',
          unlockedClue: clue,
        });

        // Switch dialogue to confession branch
        setDialogueNodes((prev) => ({ ...prev, [selectedSuspectId]: 'DLG-HH-06' }));
        setTranscript((prev) => ({
          ...prev,
          [selectedSuspectId]: [
            ...(prev[selectedSuspectId] || []),
            {
              speaker: 'Điều tra viên',
              text: `[TRƯNG BẰNG CHỨNG: ${ev.title}] - Đồng hồ nạn nhân vỡ đúng 22:15! Lời khai của anh hoàn toàn mâu thuẫn!`,
              isQuestion: true,
            },
            {
              speaker: 'Huy Hoàng',
              text: mockDialogues['DLG-HH-06']?.text || 'Đủ rồi! Các người đã biết hết rồi...',
            },
          ],
        }));

        if (onContradictionFound) onContradictionFound(selectedSuspectId, ev.id);
        return;
      }

      if (ev.id === 'EVD-06') {
        // Cước viễn thông
        playContradiction();
        playMysteryPiano();
        setContradictions((prev) => ({ ...prev, [selectedSuspectId]: true }));
        setDynamicSuspicion((prev) => ({ ...prev, [selectedSuspectId]: 'critical' }));

        const clue =
          'BÁC BỎ NGOẠI PHẠM: Lịch sử cuộc gọi kết thúc lúc 22:08. Khẳng định không có cuộc gọi nào lúc 22:15!';
        setNotes((prev) => ({
          ...prev,
          [selectedSuspectId]: [...(prev[selectedSuspectId] || []), clue],
        }));

        setObjectionAlert({
          show: true,
          success: true,
          title: 'LỜI KHAI HOÀN TOÀN BỊ PHỦ NHẬN!',
          message:
            'Dữ liệu viễn thông xác nhận điện thoại của Nhạc trưởng im lặng hoàn toàn sau 22:08. Lời khai của Huy Hoàng hoàn toàn bịa đặt!',
          unlockedClue: clue,
        });

        setDialogueNodes((prev) => ({ ...prev, [selectedSuspectId]: 'DLG-HH-05' }));
        setTranscript((prev) => ({
          ...prev,
          [selectedSuspectId]: [
            ...(prev[selectedSuspectId] || []),
            {
              speaker: 'Điều tra viên',
              text: `[TRƯNG BẰNG CHỨNG: ${ev.title}] - Dữ liệu viễn thông không có cuộc gọi nào sau 22:08!`,
              isQuestion: true,
            },
            {
              speaker: 'Huy Hoàng',
              text: mockDialogues['DLG-HH-05']?.text || 'Không có cuộc gọi nào ư...?!',
            },
          ],
        }));
        if (onContradictionFound) onContradictionFound(selectedSuspectId, ev.id);
        return;
      }

      if (ev.id === 'EVD-03') {
        // Cúc áo và mẩu vải
        playMysteryPiano();
        const clue =
          'TRÙNG KHỚP VẬT CHỨNG: Cúc áo mạ vàng và sợi len navy trong tay nạn nhân trùng khớp với áo vest bị rách của Huy Hoàng.';
        setNotes((prev) => ({
          ...prev,
          [selectedSuspectId]: [...(prev[selectedSuspectId] || []), clue],
        }));

        setObjectionAlert({
          show: true,
          success: true,
          title: 'VẬT CHỨNG TRÙNG KHỚP!',
          message:
            'Cúc áo và sợi len trong lòng bàn tay co quắp của Hoàng Long trùng khớp 100% với áo vest của Huy Hoàng!',
          unlockedClue: clue,
        });

        setDialogueNodes((prev) => ({ ...prev, [selectedSuspectId]: 'DLG-HH-03' }));
        return;
      }

      if (ev.id === 'EVD-05') {
        // Báo cáo kiểm toán 3,2 tỷ
        playMysteryPiano();
        const clue =
          'ĐỘNG CƠ SÁT HẠI: Báo cáo kiểm toán phát hiện Huy Hoàng biển thủ 3,2 tỷ. Hoàng Long ra hạn chót tự thú trước 24:00.';
        setNotes((prev) => ({
          ...prev,
          [selectedSuspectId]: [...(prev[selectedSuspectId] || []), clue],
        }));

        setObjectionAlert({
          show: true,
          success: true,
          title: 'ĐỘNG CƠ GIẾT NGƯỜI RÕ RÀNG!',
          message:
            'Hồ sơ kiểm toán 3,2 tỷ bị xé vội chứng minh động cơ giết người bịt đầu mối khẩn cấp của Huy Hoàng.',
          unlockedClue: clue,
        });
        return;
      }

      if (ev.id === 'EVD-04') {
        // Thẻ từ phòng âm thanh
        playContradiction();
        const clue =
          'GIẢ MẠO NGOẠI PHẠM: Không hề có lịch sử quẹt thẻ từ của Huy Hoàng tại phòng âm thanh tầng 3 lúc 22:15.';
        setNotes((prev) => ({
          ...prev,
          [selectedSuspectId]: [...(prev[selectedSuspectId] || []), clue],
        }));

        setObjectionAlert({
          show: true,
          success: true,
          title: 'NGOẠI PHẠM BỊ SỤP ĐỔ!',
          message:
            'Nhật ký quẹt thẻ từ không có tên Huy Hoàng ở phòng âm thanh. Lệnh in đã được hắn kích hoạt từ xa!',
          unlockedClue: clue,
        });

        setDialogueNodes((prev) => ({ ...prev, [selectedSuspectId]: 'DLG-HH-04' }));
        return;
      }
    }

    if (selectedSuspectId === 'SUSPECT-03') {
      // Tuấn Kiệt
      if (ev.id === 'EVD-04' || ev.id === 'EVD-06' || ev.id === 'EVD-02') {
        playMysteryPiano();
        setDynamicSuspicion((prev) => ({ ...prev, [selectedSuspectId]: 'low' }));
        const clue =
          'LỜI THÚ NHẬN: Tuấn Kiệt thừa nhận phát thu âm vĩ cầm qua loa Bluetooth để sang trộm tập nhạc, nhưng phát hiện nạn nhân đã chết trước đó lúc 22:22 và hoảng sợ bỏ chạy.';
        setNotes((prev) => ({
          ...prev,
          [selectedSuspectId]: [...(prev[selectedSuspectId] || []), clue],
        }));

        setObjectionAlert({
          show: true,
          success: true,
          title: 'BÓC TRẦN BÍ MẬT CỦA TUẤN KIỆT!',
          message:
            'Tuấn Kiệt suy sụp thừa nhận đã dùng loa Bluetooth ngụy tạo tiếng vĩ cầm. Tuy nhiên anh ta không phải thủ phạm mà là nhân chứng thấy nạn nhân đã chết lúc 22:22!',
          unlockedClue: clue,
        });

        setDialogueNodes((prev) => ({ ...prev, [selectedSuspectId]: 'DLG-TK-04' }));
        return;
      }
    }

    if (selectedSuspectId === 'SUSPECT-01') {
      // Quỳnh Nga
      if (ev.id === 'EVD-04' || ev.id === 'EVD-02') {
        playSuccess();
        setDynamicSuspicion((prev) => ({ ...prev, [selectedSuspectId]: 'low' }));
        const clue =
          'NGOẠI PHẠM BẤT KHẢ XÂM PHẠM: Hai nhân chứng độc lập xác nhận Quỳnh Nga ở phòng phục trang tầng 2 suốt từ 22:05 đến 22:25.';
        setNotes((prev) => ({
          ...prev,
          [selectedSuspectId]: [...(prev[selectedSuspectId] || []), clue],
        }));

        setObjectionAlert({
          show: true,
          success: true,
          title: 'NGOẠI PHẠM ĐƯỢC LÀM RÕ!',
          message:
            'Vật chứng khớp với lời khai của Quỳnh Nga. Cô được loại khỏi diện nghi can số 1.',
          unlockedClue: clue,
        });
        return;
      }
    }

    // Default deflection
    playClick();
    setObjectionAlert({
      show: true,
      success: false,
      title: 'CHỨNG CỨ KHÔNG MÂU THUẪN TRỰC TIẾP',
      message: `${currentSuspect.name} im lặng hoặc lắc đầu: "Vật chứng này không liên quan trực tiếp đến lời khai của tôi vào thời điểm 22:15." Hãy tìm vật chứng khác!`,
    });
  };

  // Psychological Tension level calculation
  const tension: ITensionState = useMemo(() => {
    const isContradicted = !!contradictions[selectedSuspectId];
    const suspicion = dynamicSuspicion[selectedSuspectId];

    if (selectedSuspectId === 'SUSPECT-02') {
      if (isContradicted || suspicion === 'critical') {
        return { heartRate: 148, status: 'Suy sụp', color: 'text-red-500' };
      }
      return { heartRate: 112, status: 'Căng thẳng', color: 'text-amber-500' };
    }

    if (selectedSuspectId === 'SUSPECT-03') {
      if (isContradicted) {
        return { heartRate: 98, status: 'Dao động', color: 'text-amber-400' };
      }
      return { heartRate: 85, status: 'Bình tĩnh', color: 'text-emerald-400' };
    }

    // SUSPECT-01
    if (suspicion === 'low') {
      return { heartRate: 72, status: 'Bình tĩnh', color: 'text-emerald-400' };
    }
    return { heartRate: 88, status: 'Dao động', color: 'text-sky-400' };
  }, [selectedSuspectId, contradictions, dynamicSuspicion]);

  // Filtered evidence in Present Modal
  const filteredEvidences = useMemo(() => {
    return availableEvidences.filter((e) => {
      const matchType = evidenceFilterType === 'all' || e.type === evidenceFilterType;
      const matchSearch =
        e.title.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
        e.locationFound.toLowerCase().includes(evidenceSearchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [availableEvidences, evidenceFilterType, evidenceSearchTerm]);

  return (
    <div
      className={`min-h-screen bg-neutral-950 text-neutral-100 font-inter flex flex-col select-none ${className}`}
    >
      {/* --- TOP BAR: AMBIENCE & INVESTIGATION STATUS --- */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-700/60 text-red-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-red-500 font-bold font-courier flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                ĐANG GHI ÂM HỎI CUNG // TAPE #04
              </span>
              <span className="text-neutral-500 text-xs">|</span>
              <span className="text-xs text-neutral-400 font-courier">MỐC ÁN: 22:15 - 22:30</span>
            </div>
            <h1 className="text-lg font-bold font-special text-neutral-100 tracking-wide">
              PHÒNG THẨM VẤN & ĐỐI CHẤT NGHỆ SĨ
            </h1>
          </div>
        </div>

        {/* Global navigation & controls */}
        <div className="flex items-center gap-3">
          {onNavigateToScene && (
            <button
              onClick={() => {
                playClick();
                onNavigateToScene();
              }}
              className="px-3 py-1.5 text-xs font-courier bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Khám Nghiệm Hiện Trường
            </button>
          )}

          {onNavigateToBoard && (
            <button
              onClick={() => {
                playClick();
                onNavigateToBoard();
              }}
              className="px-3 py-1.5 text-xs font-courier bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Bảng Chỉ Đỏ Suy Luận
            </button>
          )}

          <button
            onClick={handleToggleMute}
            className="p-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
            title={muted ? 'Bật âm thanh trinh thám' : 'Tắt âm thanh'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: 3 SUSPECTS SELECTOR & TENSION MONITOR */}
        <aside className="w-full lg:w-80 bg-neutral-900 border-r border-neutral-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-courier tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              3 Nghi Phạm Trọng Điểm ({activeSuspects.length})
            </h2>
            <span className="text-[10px] font-courier bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">
              CLICK ĐỂ CHỌN
            </span>
          </div>

          {/* SUSPECT LIST */}
          <div className="space-y-3">
            {activeSuspects.map((suspect) => {
              const isSelected = suspect.id === selectedSuspectId;
              const isContradicted = !!contradictions[suspect.id];
              const suspicion = dynamicSuspicion[suspect.id] || suspect.suspicionLevel;

              return (
                <div
                  key={suspect.id}
                  onClick={() => handleSelectSuspect(suspect.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-neutral-800 border-amber-500 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/40'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/40'
                  }`}
                >
                  {/* Contradiction Ribbon */}
                  {isContradicted && (
                    <div className="absolute top-0 right-0 bg-red-600 text-[9px] uppercase font-bold px-2 py-0.5 text-white font-courier rounded-bl shadow">
                      ĐÃ VẠCH TRẦN
                    </div>
                  )}

                  <div className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-neutral-950 shrink-0 border border-neutral-700">
                      <img
                        src={suspect.avatar}
                        alt={suspect.name}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isSelected ? 'scale-105 contrast-125' : 'grayscale opacity-75'
                        }`}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-sm text-neutral-100 truncate">
                          {suspect.name}
                        </h3>
                        <span className="text-[11px] text-neutral-400 font-courier">
                          {suspect.age} tuổi
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{suspect.role}</p>

                      {/* Suspicion badge */}
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-courier uppercase font-semibold ${
                            suspicion === 'critical'
                              ? 'bg-red-950 text-red-400 border border-red-700 animate-pulse'
                              : suspicion === 'high'
                              ? 'bg-orange-950 text-orange-400 border border-orange-700'
                              : suspicion === 'medium'
                              ? 'bg-amber-950 text-amber-400 border border-amber-700'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          }`}
                        >
                          {suspicion === 'critical'
                            ? 'CỰC KỲ KHẢ NGHI'
                            : suspicion === 'high'
                            ? 'NGHI CAN SỐ 1'
                            : suspicion === 'medium'
                            ? 'CẦN ĐỐI CHẤT'
                            : 'NGOẠI PHẠM VỮNG'}
                        </span>

                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'text-amber-400 translate-x-1' : 'text-neutral-600'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PSYCHOLOGICAL STATE & DETECTIVE TAPE */}
          <div className="mt-auto bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 font-courier">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                TÂM LÝ NGHI PHẠM
              </span>
              <span className={`font-bold ${tension.color}`}>{tension.status}</span>
            </div>

            <div className="flex items-baseline justify-between text-neutral-200">
              <span className="text-2xl font-bold font-mono tracking-wider">
                {tension.heartRate}{' '}
                <span className="text-xs font-normal text-neutral-400 font-courier">BPM</span>
              </span>
              <span className="text-[11px] text-neutral-400">
                {contradictions[selectedSuspectId] ? 'Phát hiện nói dối!' : 'Huyết áp ổn định'}
              </span>
            </div>

            {/* Heart rate visual bar */}
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  tension.heartRate > 120
                    ? 'bg-red-500 w-[95%]'
                    : tension.heartRate > 95
                    ? 'bg-amber-500 w-[65%]'
                    : 'bg-emerald-500 w-[40%]'
                }`}
              />
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: INTERROGATION STAGE & DOSSIER */}
        <main className="flex-1 flex flex-col bg-neutral-950 overflow-hidden relative">
          {/* STAGE HEADER: TABS (Thẩm Vấn / Hồ Sơ) */}
          <div className="px-6 py-3 border-b border-neutral-800 bg-neutral-900/40 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  playClick();
                  setActiveTab('dialogue');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-courier uppercase font-bold transition ${
                  activeTab === 'dialogue'
                    ? 'bg-amber-500 text-neutral-950 shadow'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                Thẩm Vấn Trực Tiếp
              </button>

              <button
                onClick={() => {
                  playClick();
                  setActiveTab('dossier');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-courier uppercase font-bold transition ${
                  activeTab === 'dossier'
                    ? 'bg-amber-500 text-neutral-950 shadow'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Hồ Sơ & Lời Khai ({currentSuspect.name})
              </button>
            </div>

            {/* PRESENT EVIDENCE ACTION BUTTON */}
            <button
              onClick={() => {
                playClick();
                setIsPresentModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white rounded font-courier text-xs font-bold tracking-wider uppercase shadow-lg shadow-red-950/40 border border-red-500/50 transition-all transform hover:scale-105 active:scale-95"
            >
              <Scale className="w-4 h-4 text-amber-200 animate-bounce" />
              <span>Trưng Bằng Chứng (Present Evidence)</span>
            </button>
          </div>

          {/* TAB 1: DIALOGUE & BRANCHING INTERROGATION */}
          {activeTab === 'dialogue' && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* SUSPECT VISUAL SPOTLIGHT */}
              <div className="w-full lg:w-5/12 bg-neutral-950 p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-neutral-800 relative">
                {/* Vintage Spotlight Circle */}
                <div className="absolute w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

                <div className="relative w-48 h-60 rounded-lg overflow-hidden border-2 border-neutral-700 shadow-2xl bg-neutral-900 group">
                  <img
                    src={currentSuspect.avatar}
                    alt={currentSuspect.name}
                    className="w-full h-full object-cover object-center filter contrast-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />

                  {/* Stamp */}
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <span className="text-[11px] font-courier uppercase font-bold tracking-widest text-neutral-300 bg-neutral-950/80 px-2 py-0.5 rounded border border-neutral-700 block">
                      {currentSuspect.name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-courier block mt-0.5">
                      {currentSuspect.role}
                    </span>
                  </div>
                </div>

                {/* Motive & Alibi Quick Peek */}
                <div className="w-full max-w-sm mt-4 bg-neutral-900/60 border border-neutral-800 rounded p-3 text-xs space-y-1.5 font-courier">
                  <div className="text-neutral-400">
                    <span className="text-amber-400 font-bold">Ngoại phạm: </span>
                    <span className="text-neutral-300">{currentSuspect.alibi}</span>
                  </div>
                  <div className="text-neutral-400">
                    <span className="text-red-400 font-bold">Động cơ: </span>
                    <span className="text-neutral-300">{currentSuspect.motive}</span>
                  </div>
                </div>

                {/* Reset Branch Button */}
                <button
                  onClick={handleResetDialogue}
                  className="mt-3 text-[11px] font-courier text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  Hỏi lại từ đầu (Reset nhánh thoại)
                </button>
              </div>

              {/* DIALOGUE TRANSCRIPT & OPTIONS */}
              <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden">
                {/* Scrollable Conversation Log */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 font-courier">
                  {(transcript[selectedSuspectId] || []).map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.isQuestion ? 'items-end' : 'items-start'
                      } max-w-2xl ${msg.isQuestion ? 'ml-auto' : 'mr-auto'}`}
                    >
                      <span className="text-[10px] text-neutral-500 uppercase font-bold mb-1">
                        {msg.speaker}
                      </span>
                      <div
                        className={`p-3 rounded-lg text-sm leading-relaxed ${
                          msg.isQuestion
                            ? 'bg-amber-950/60 text-amber-200 border border-amber-700/50 rounded-tr-none'
                            : 'bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-none shadow'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* BRANCHING QUESTIONS CARDS */}
                <div className="p-4 border-t border-neutral-800 bg-neutral-900/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-courier uppercase font-bold text-neutral-400 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      Lựa Chọn Câu Hỏi Phân Nhánh ({currentNode.options.length}):
                    </span>
                    <span className="text-[10px] text-neutral-500 font-courier">
                      MÃ THOẠI: {currentNode.id}
                    </span>
                  </div>

                  {currentNode.options.length === 0 ? (
                    <div className="bg-neutral-950 border border-neutral-800 rounded p-4 text-center">
                      <p className="text-xs text-neutral-400 font-courier mb-2">
                        Đã khai thác hết nhánh câu hỏi này với {currentSuspect.name}.
                      </p>
                      <button
                        onClick={handleResetDialogue}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-courier rounded transition inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Bắt đầu lại phiên thẩm vấn
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {currentNode.options.map((opt) => {
                        const isLocked = Boolean(
                          opt.requiredEvidenceId &&
                              !discoveredEvidenceIds.includes(opt.requiredEvidenceId)
                          );

                          return (
                            <button
                            key={opt.id}
                            disabled={isLocked}
                            onClick={() => handleSelectOption(opt)}
                            className={`w-full text-left p-3 rounded-md border text-xs font-courier transition-all flex items-start justify-between gap-3 ${
                              isLocked
                                ? 'bg-neutral-950/50 border-neutral-800 text-neutral-600 cursor-not-allowed'
                                : opt.triggerContradiction
                                ? 'bg-red-950/40 border-red-800/80 hover:bg-red-900/50 text-red-200 hover:border-red-600'
                                : 'bg-neutral-800/80 border-neutral-700 hover:bg-neutral-700 hover:border-amber-500 text-neutral-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-amber-500 font-bold shrink-0 mt-0.5">➤</span>
                              <span>{opt.text}</span>
                            </div>

                            {isLocked ? (
                              <span className="shrink-0 flex items-center gap-1 text-[10px] bg-neutral-900 px-2 py-0.5 rounded text-neutral-500 border border-neutral-800">
                                <Lock className="w-3 h-3" />
                                Cần: {opt.requiredEvidenceId}
                              </span>
                            ) : opt.triggerContradiction ? (
                              <span className="shrink-0 flex items-center gap-1 text-[10px] bg-red-950 px-2 py-0.5 rounded text-red-400 border border-red-700 animate-pulse">
                                <Flame className="w-3 h-3" />
                                Mâu thuẫn
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUSPECT DOSSIER & INVESTIGATION NOTES */}
          {activeTab === 'dossier' && (
            <div className="flex-1 p-6 overflow-y-auto bg-neutral-950 font-courier space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* HEADER PROFILE */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-32 h-40 rounded border border-neutral-700 overflow-hidden bg-neutral-950 shrink-0">
                    <img
                      src={currentSuspect.avatar}
                      alt={currentSuspect.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold font-special text-neutral-100">
                        {currentSuspect.name}
                      </h2>
                      <span className="text-xs bg-neutral-800 px-2.5 py-1 rounded text-neutral-300">
                        {currentSuspect.age} tuổi
                      </span>
                    </div>

                    <p className="text-amber-400 text-xs font-bold">{currentSuspect.role}</p>

                    <p className="text-xs text-neutral-300 leading-relaxed pt-2 border-t border-neutral-800">
                      {currentSuspect.bio}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                      <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                        <span className="text-[10px] text-neutral-500 uppercase block font-bold">
                          Quan hệ với nạn nhân:
                        </span>
                        <span className="text-xs text-neutral-300">
                          {currentSuspect.relationToVictim}
                        </span>
                      </div>

                      <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                        <span className="text-[10px] text-neutral-500 uppercase block font-bold">
                          Trạng thái nghi vấn:
                        </span>
                        <span className="text-xs text-amber-400 font-bold uppercase">
                          {dynamicSuspicion[currentSuspect.id] || currentSuspect.suspicionLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MOTIVE & ALIBI DOSSIER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-900/70 border border-neutral-800 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      Động Cơ Gây Án (Motive)
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded border border-neutral-800/80">
                      {currentSuspect.motive}
                    </p>
                  </div>

                  <div className="bg-neutral-900/70 border border-neutral-800 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Ngoại Phạm Khai Báo (22:15)
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded border border-neutral-800/80">
                      {currentSuspect.alibi}
                    </p>
                  </div>
                </div>

                {/* DETECTIVE NOTES COLLECTED */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Biên Bản Ghi Chú & Manh Mối Thu Thập Được ({notes[currentSuspect.id]?.length || 0})
                  </h3>

                  <div className="space-y-2">
                    {(notes[currentSuspect.id] || []).map((note, index) => (
                      <div
                        key={index}
                        className="bg-neutral-950 p-3 rounded border border-neutral-800 text-xs text-neutral-200 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="text-amber-500 font-bold shrink-0">#{index + 1}</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- DRAMATIC OBJECTION / CONTRADICTION ALERT POPUP --- */}
      {objectionAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`max-w-lg w-full p-6 rounded-xl border-2 shadow-2xl font-courier relative ${
              objectionAlert.success
                ? 'bg-neutral-950 border-red-600 shadow-red-950/60 ring-2 ring-red-500/50'
                : 'bg-neutral-950 border-neutral-700'
            }`}
          >
            {objectionAlert.success && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white font-bold text-xs uppercase px-4 py-1 rounded-full tracking-widest shadow flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                VẠCH TRẦN MÂU THUẪN (OBJECTION)
              </div>
            )}

            <div className="text-center mt-2 mb-4">
              <h3
                className={`text-base font-bold uppercase tracking-wider ${
                  objectionAlert.success ? 'text-red-400' : 'text-neutral-300'
                }`}
              >
                {objectionAlert.title}
              </h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-4 bg-neutral-900 p-4 rounded border border-neutral-800">
              {objectionAlert.message}
            </p>

            {objectionAlert.unlockedClue && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800/80 rounded text-xs text-red-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 block">Mở Khóa Manh Mối Ẩn:</span>
                  <span>{objectionAlert.unlockedClue}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => {
                  playClick();
                  setObjectionAlert(null);
                }}
                className={`px-5 py-2 rounded text-xs font-bold uppercase font-courier transition ${
                  objectionAlert.success
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                }`}
              >
                Đã Rõ (Tiếp Tục Hỏi Cung)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PRESENT EVIDENCE MODAL (TRƯNG BẰNG CHỨNG) --- */}
      {isPresentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-3xl w-full max-h-[85vh] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl flex flex-col overflow-hidden font-courier">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-neutral-100 uppercase tracking-wider">
                  Trưng Vật Chứng Đối Chất // Nghi Phạm: {currentSuspect.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  playClick();
                  setIsPresentModalOpen(false);
                }}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm vật chứng theo tên, vị trí..."
                  value={evidenceSearchTerm}
                  onChange={(e) => setEvidenceSearchTerm(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded pl-9 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Type filter buttons */}
              <div className="flex items-center gap-1.5 text-[11px]">
                {['all', 'physical', 'document', 'digital', 'forensic'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      playClick();
                      setEvidenceFilterType(type);
                    }}
                    className={`px-2.5 py-1 rounded transition uppercase ${
                      evidenceFilterType === type
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {type === 'all'
                      ? 'Tất cả'
                      : type === 'physical'
                      ? 'Vật lý'
                      : type === 'document'
                      ? 'Tài liệu'
                      : type === 'digital'
                      ? 'Số'
                      : 'Pháp y'}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: Evidence Grid & Detail Pane */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Evidence selection list */}
              <div className="w-full md:w-1/2 p-4 overflow-y-auto space-y-2 border-b md:border-b-0 md:border-r border-neutral-800">
                {filteredEvidences.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    Không tìm thấy vật chứng phù hợp.
                  </div>
                ) : (
                  filteredEvidences.map((ev) => {
                    const isSelected = selectedEvidenceForPresent?.id === ev.id;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => {
                          playClick();
                          setSelectedEvidenceForPresent(ev);
                        }}
                        className={`p-3 rounded border text-xs cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-950/60 border-amber-500 text-neutral-100 ring-1 ring-amber-500'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-amber-400 font-courier">
                            [{ev.id}]
                          </span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                            {ev.type}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-neutral-100 mb-1">{ev.title}</h4>
                        <p className="text-[11px] text-neutral-400 line-clamp-2">
                          {ev.description}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected evidence inspect pane */}
              <div className="w-full md:w-1/2 p-4 bg-neutral-950 flex flex-col justify-between overflow-y-auto">
                {selectedEvidenceForPresent ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <span className="text-xs font-bold text-amber-400 font-courier">
                        CHI TIẾT VẬT CHỨNG [{selectedEvidenceForPresent.id}]
                      </span>
                      <span className="text-[10px] text-neutral-400 font-courier">
                        Nơi tìm: {selectedEvidenceForPresent.locationFound}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-neutral-100">
                      {selectedEvidenceForPresent.title}
                    </h4>

                    <div className="bg-neutral-900 p-3 rounded border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
                      {selectedEvidenceForPresent.details || selectedEvidenceForPresent.description}
                    </div>

                    <div className="p-3 bg-red-950/30 border border-red-900/40 rounded text-xs text-neutral-400">
                      <span className="font-bold text-amber-400 block mb-1">
                        Gợi ý đối chất:
                      </span>
                      Hãy đối chiếu mốc thời gian vỡ kim, dữ liệu viễn thông hoặc dấu vết vật thể
                      trên người nạn nhân để vạch trần mâu thuẫn ngoại phạm 22:15.
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 text-xs">
                    <Fingerprint className="w-10 h-10 mb-2 opacity-40 text-amber-500" />
                    <span>Chọn một vật chứng ở danh sách bên trái để kiểm tra và đối chất.</span>
                  </div>
                )}

                {/* Confirm Button */}
                <div className="pt-4 border-t border-neutral-800 mt-4">
                  <button
                    disabled={!selectedEvidenceForPresent}
                    onClick={handleConfirmPresentEvidence}
                    className={`w-full py-2.5 rounded font-courier text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                      selectedEvidenceForPresent
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50'
                        : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <Scale className="w-4 h-4" />
                    Xác Nhận Trưng Vật Chứng Này Đối Chất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterrogationRoom;
