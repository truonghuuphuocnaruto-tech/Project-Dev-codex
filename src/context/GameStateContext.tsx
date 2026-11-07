import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  ICase,
  IEvidence,
  ISuspect,
  IHotspot,
  IBoardNode,
  IConnection,
  IDialogueOption,
  ConnectionType,
} from '../types/game';
import { mockCase, mockEvidences, mockBoardNodes, mockConnections } from '../data/mockCase';
import {
  playTypewriter,
  playPageFlip,
  playEvidenceCollect,
  playPin,
  playStringConnect,
  playMysteryPiano,
  playContradiction,
  playSuccess,
  playClick,
  toggleAudioMute,
  isAudioMuted,
} from '../utils/audio';

export type GameScreen =
  | 'intro'
  | 'crime-scene'
  | 'interrogation'
  | 'pinboard'
  | 'verdict'
  | 'case-file';

export interface IVerdictResult {
  isCorrect: boolean;
  score: number;
  rank: string;
  feedback: string;
  culpritName: string;
  actualCulprit: string;
  unlockedTimeline: boolean;
}

export interface IGameStateContext {
  // Case Data & Navigation
  caseData: ICase;
  currentScreen: GameScreen;
  setCurrentScreen: (screen: GameScreen) => void;

  // Evidence Management
  evidenceList: IEvidence[];
  discoveredEvidenceIds: string[];
  discoveredEvidences: IEvidence[];
  selectedEvidence: IEvidence | null;
  setSelectedEvidence: (evidence: IEvidence | null) => void;
  discoverEvidence: (evidenceId: string) => boolean;
  isEvidenceDiscovered: (evidenceId: string) => boolean;

  // Crime Scene Hotspots
  hotspots: IHotspot[];
  examineHotspot: (hotspotId: string) => { evidenceId?: string; message: string };

  // Suspects & Interrogation
  suspects: ISuspect[];
  selectedSuspectId: string | null;
  setSelectedSuspectId: (id: string | null) => void;
  selectedSuspect: ISuspect | null;
  suspectNotes: Record<string, string[]>;
  addSuspectNote: (suspectId: string, note: string) => void;
  dialogueHistory: Record<string, string[]>;
  currentDialogueNodes: Record<string, string>;
  contradictionsFound: Record<string, boolean>;
  chooseDialogueOption: (suspectId: string, option: IDialogueOption) => void;
  presentEvidence: (
    suspectId: string,
    evidenceId: string
  ) => { success: boolean; message: string; contradiction?: boolean; unlockedEvidenceId?: string };

  // Detective Pinboard & Red Strings
  boardNodes: IBoardNode[];
  connections: IConnection[];
  selectedBoardNodeId: string | null;
  setSelectedBoardNodeId: (nodeId: string | null) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  togglePinNode: (nodeId: string) => void;
  connectNodes: (
    fromId: string,
    toId: string,
    type?: ConnectionType,
    label?: string,
    description?: string
  ) => boolean;
  removeConnection: (connectionId: string) => void;
  addBoardNode: (node: Omit<IBoardNode, 'id'>) => string;

  // Demo / Auto-solve Mode cho BGK
  isDemoMode: boolean;
  triggerDemoAutoSolve: () => void;
  resetGame: () => void;

  // Verdict & Evaluation
  verdictSubmitted: boolean;
  verdictResult: IVerdictResult | null;
  submitVerdict: (
    culpritId: string,
    selectedEvidenceIds: string[],
    motiveText?: string
  ) => IVerdictResult;

  // Audio Controls
  isMuted: boolean;
  toggleMute: () => boolean;
  playSfx: {
    typewriter: () => void;
    pageFlip: () => void;
    evidence: () => void;
    pin: () => void;
    string: () => void;
    mystery: () => void;
    contradiction: () => void;
    success: () => void;
    click: () => void;
  };
}

const INITIAL_SUSPECT_NOTES: Record<string, string[]> = {
  'SUSPECT-01': [
    'Ngoại phạm: Khai lúc 22:15 đang ở phòng phục trang tầng 2 thử đầm với thợ may Lan Anh và chuyên viên Minh Châu.',
    'Động cơ: Nạn nhân bí mật lập di chúc mới chuyển 80% tài sản vào Quỹ Bảo tồn và ép ly hôn.',
  ],
  'SUSPECT-02': [
    'Ngoại phạm: Khai lúc 22:15 ngồi phòng âm thanh tầng 3 in tài liệu, nghe thấy tiếng nạn nhân to tiếng qua điện thoại.',
    'Động cơ: Biển thủ 3,2 tỷ ngân sách lưu diễn, bị Hoàng Long phát hiện và ra tối hậu thư hạn chót 24:00 đêm nay.',
    'Là người duy nhất chuẩn bị và mang trà hoa cúc vào phòng làm việc của Nhạc trưởng lúc 22:12.',
  ],
  'SUSPECT-03': [
    'Ngoại phạm: Khai lúc 22:15 đang ở phòng tập riêng sau cánh gà say sưa luyện bản "Danse Macabre".',
    'Động cơ: Hoàng Long phát hiện bản concerto đoạt giải bị chép trộm từ nhạc sĩ Minh Triết, dọa sẽ tước thẻ nghệ sĩ vĩnh viễn.',
  ],
};

const INITIAL_DISCOVERED_EVIDENCES = ['EVD-01', 'EVD-02', 'EVD-03', 'EVD-06'];

const GameStateContext = createContext<IGameStateContext | null>(null);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Navigation State
  const [currentScreen, setCurrentScreenState] = useState<GameScreen>('intro');

  const setCurrentScreen = useCallback((screen: GameScreen) => {
    playPageFlip();
    setCurrentScreenState(screen);
  }, []);

  // 2. Evidence State
  const [discoveredEvidenceIds, setDiscoveredEvidenceIds] = useState<string[]>(
    INITIAL_DISCOVERED_EVIDENCES
  );
  const [selectedEvidence, setSelectedEvidence] = useState<IEvidence | null>(null);

  // 3. Crime Scene Hotspots
  const [hotspots, setHotspots] = useState<IHotspot[]>(() =>
    mockCase.hotspots.map((h) => ({
      ...h,
      discovered: h.evidenceId ? INITIAL_DISCOVERED_EVIDENCES.includes(h.evidenceId) : h.discovered,
    }))
  );

  // 4. Suspects & Interrogation
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>('SUSPECT-02');
  const [suspectNotes, setSuspectNotes] = useState<Record<string, string[]>>(INITIAL_SUSPECT_NOTES);
  const [currentDialogueNodes, setCurrentDialogueNodes] = useState<Record<string, string>>({
    'SUSPECT-01': 'DLG-QN-01',
    'SUSPECT-02': 'DLG-HH-01',
    'SUSPECT-03': 'DLG-TK-01',
  });
  const [dialogueHistory, setDialogueHistory] = useState<Record<string, string[]>>({
    'SUSPECT-01': [],
    'SUSPECT-02': [],
    'SUSPECT-03': [],
  });
  const [contradictionsFound, setContradictionsFound] = useState<Record<string, boolean>>({
    'SUSPECT-01': false,
    'SUSPECT-02': false,
    'SUSPECT-03': false,
  });

  // 5. Pinboard State
  const [boardNodes, setBoardNodes] = useState<IBoardNode[]>(mockBoardNodes);
  const [connections, setConnections] = useState<IConnection[]>(mockConnections.slice(0, 4));
  const [selectedBoardNodeId, setSelectedBoardNodeId] = useState<string | null>(null);

  // 6. Demo Mode & Verdict
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [verdictSubmitted, setVerdictSubmitted] = useState<boolean>(false);
  const [verdictResult, setVerdictResult] = useState<IVerdictResult | null>(null);

  // 7. Audio Mute State
  const [muted, setMuted] = useState<boolean>(isAudioMuted());

  const handleToggleMute = useCallback(() => {
    const next = toggleAudioMute();
    setMuted(next);
    return next;
  }, []);

  // Helper check evidence discovered
  const isEvidenceDiscovered = useCallback(
    (id: string) => discoveredEvidenceIds.includes(id),
    [discoveredEvidenceIds]
  );

  const discoveredEvidences = useMemo(() => {
    return mockCase.evidence.filter((ev) => discoveredEvidenceIds.includes(ev.id));
  }, [discoveredEvidenceIds]);

  // Discover new evidence action
  const discoverEvidence = useCallback(
    (evidenceId: string): boolean => {
      if (discoveredEvidenceIds.includes(evidenceId)) {
        return false;
      }
      playEvidenceCollect();
      setDiscoveredEvidenceIds((prev) => [...prev, evidenceId]);

      // Update matching hotspot if any
      setHotspots((prev) =>
        prev.map((h) => (h.evidenceId === evidenceId ? { ...h, discovered: true } : h))
      );

      return true;
    },
    [discoveredEvidenceIds]
  );

  // Examine Hotspot on Crime Scene
  const examineHotspot = useCallback(
    (hotspotId: string) => {
      const target = hotspots.find((h) => h.id === hotspotId);
      if (!target) {
        return { message: 'Không tìm thấy vị trí chỉ định.' };
      }

      setHotspots((prev) =>
        prev.map((h) => (h.id === hotspotId ? { ...h, discovered: true } : h))
      );

      if (target.evidenceId) {
        discoverEvidence(target.evidenceId);
        const ev = mockCase.evidence.find((e) => e.id === target.evidenceId);
        return {
          evidenceId: target.evidenceId,
          message: `Thu thập thành công: ${ev?.title || target.title}`,
        };
      }

      playClick();
      return { message: target.description };
    },
    [hotspots, discoverEvidence]
  );

  // Selected Suspect object
  const selectedSuspect = useMemo(() => {
    return mockCase.suspects.find((s) => s.id === selectedSuspectId) || null;
  }, [selectedSuspectId]);

  // Add suspect note
  const addSuspectNote = useCallback((suspectId: string, note: string) => {
    setSuspectNotes((prev) => {
      const existing = prev[suspectId] || [];
      if (existing.includes(note)) return prev;
      return {
        ...prev,
        [suspectId]: [...existing, note],
      };
    });
  }, []);

  // Interrogation dialogue choice
  const chooseDialogueOption = useCallback(
    (suspectId: string, option: IDialogueOption) => {
      playTypewriter();

      if (option.unlockEvidenceId) {
        discoverEvidence(option.unlockEvidenceId);
      }

      if (option.triggerContradiction) {
        playContradiction();
        setContradictionsFound((prev) => ({ ...prev, [suspectId]: true }));
      }

      if (option.nextNodeId) {
        setCurrentDialogueNodes((prev) => ({ ...prev, [suspectId]: option.nextNodeId! }));
      }

      setDialogueHistory((prev) => ({
        ...prev,
        [suspectId]: [...(prev[suspectId] || []), option.id],
      }));
    },
    [discoverEvidence]
  );

  // Present evidence during interrogation
  const presentEvidence = useCallback(
    (suspectId: string, evidenceId: string) => {
      playClick();

      // Trường hợp đối chất Trợ lý Huy Hoàng (SUSPECT-02 - Thủ phạm)
      if (suspectId === 'SUSPECT-02') {
        if (evidenceId === 'EVD-02') {
          // Đồng hồ Patek vỡ lúc 22:15
          playContradiction();
          playMysteryPiano();
          setContradictionsFound((prev) => ({ ...prev, [suspectId]: true }));
          addSuspectNote(
            suspectId,
            'MÂU THUẪN THEN CHỐT: Đồng hồ nạn nhân vỡ kẹt bánh răng lúc 22:15 do xô xát khi chất độc phát tác, chứng minh Hoàng Long ngã gục lúc 22:15. Lời khai nghe thấy Nhạc trưởng nói chuyện điện thoại lúc 22:15 là hoàn toàn giả mạo!'
          );
          return {
            success: true,
            contradiction: true,
            message:
              'MÂU THUẪN BỊ BÓC TRẦN! Đồng hồ nạn nhân vỡ nát dừng đúng 22:15 do va đập khi gục ngã. Lúc đó nạn nhân đã ngừng thở, không thể nào nói chuyện điện thoại!',
          };
        }

        if (evidenceId === 'EVD-06') {
          // Cước viễn thông rỗng
          playContradiction();
          playMysteryPiano();
          setContradictionsFound((prev) => ({ ...prev, [suspectId]: true }));
          addSuspectNote(
            suspectId,
            'BÁC BỎ LỜI KHAI: Lịch sử cuộc gọi kết thúc từ 22:08. Khẳng định không có bất kỳ cuộc điện thoại nào lúc 22:15.'
          );
          return {
            success: true,
            contradiction: true,
            message:
              'LỜI KHAI BỊ BÁC BỎ! Điện thoại của Nhạc trưởng không hề phát sinh cuộc gọi nào sau 22:08. Huy Hoàng đã nói dối!',
          };
        }

        if (evidenceId === 'EVD-03') {
          // Mẩu vải và cúc áo vest
          playMysteryPiano();
          addSuspectNote(
            suspectId,
            'VẬT CHỨNG TRÙNG KHỚP: Cúc áo mạ vàng và sợi len navy kẹp chặt trong tay nạn nhân trùng khớp với áo vest bị rách của Huy Hoàng.'
          );
          return {
            success: true,
            message:
              'CHỨNG CỨ XÁC ĐÁNG! Cúc áo trong tay nạn nhân khớp hoàn toàn với áo vest của Huy Hoàng. Hắn biến sắc và lắp bắp!',
          };
        }

        if (evidenceId === 'EVD-04') {
          // Thẻ từ phòng âm thanh
          playContradiction();
          addSuspectNote(
            suspectId,
            'GIẢ MẠO NGOẠI PHẠM: Không hề có dữ liệu quẹt thẻ của Huy Hoàng tại phòng âm thanh tầng 3 lúc 22:15. Lệnh in tài liệu được gửi từ xa.'
          );
          return {
            success: true,
            contradiction: true,
            message:
              'BÁC BỎ NGOẠI PHẠM! Phòng âm thanh không ghi nhận quẹt thẻ từ của Huy Hoàng lúc 22:15. Lệnh in được kích hoạt từ xa!',
          };
        }

        if (evidenceId === 'EVD-05') {
          // Báo cáo kiểm toán 3,2 tỷ
          playMysteryPiano();
          addSuspectNote(
            suspectId,
            'ĐỘNG CƠ GIẾT NGƯỜI: Huy Hoàng biển thủ 3,2 tỷ ngân sách dàn nhạc, bị Hoàng Long ra tối hậu thư phải tự thú trước 24:00 đêm nay.'
          );
          return {
            success: true,
            message:
              'ĐỘNG CƠ RÕ RÀNG! Hồ sơ kiểm toán 3,2 tỷ bị xé trong thùng rác chính là nguyên nhân khiến Huy Hoàng ra tay sát hại bịt đầu mối!',
          };
        }
      }

      // Trường hợp đối chất Vợ Quỳnh Nga (SUSPECT-01)
      if (suspectId === 'SUSPECT-01') {
        if (evidenceId === 'EVD-04' || evidenceId === 'EVD-02') {
          addSuspectNote(
            suspectId,
            'NGOẠI PHẠM BẤT KHẢ XÂM PHẠM: Hai nhân chứng độc lập xác nhận Quỳnh Nga ở phòng phục trang tầng 2 suốt từ 22:05 đến 22:25.'
          );
          return {
            success: true,
            message:
              'Ngoại phạm của Quỳnh Nga hoàn toàn vững chắc. Cô không thể có mặt tại hiện trường lúc 22:15.',
          };
        }
      }

      // Trường hợp đối chất Nghệ sĩ vĩ cầm Tuấn Kiệt (SUSPECT-03)
      if (suspectId === 'SUSPECT-03') {
        if (evidenceId === 'EVD-04' || evidenceId === 'EVD-06') {
          playMysteryPiano();
          addSuspectNote(
            suspectId,
            'LỜI THÚ NHẬN: Tuấn Kiệt thừa nhận phát đoạn thu âm Danse Macabre qua loa Bluetooth và đến phòng nạn nhân lúc 22:22 để trộm bản thảo nhưng nạn nhân đã chết từ trước.'
          );
          return {
            success: true,
            message:
              'Tuấn Kiệt suy sụp thừa nhận: "Tôi đến phòng lúc 22:22 để trộm tập nhạc, nhưng thấy thầy đã chết ngạt từ trước nên hoảng sợ bỏ chạy!"',
          };
        }
      }

      return {
        success: false,
        message: 'Nghi phạm im lặng trước bằng chứng này hoặc chứng cứ chưa làm sáng tỏ mâu thuẫn trực tiếp.',
      };
    },
    [addSuspectNote]
  );

  // Pinboard: update node position
  const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setBoardNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, x, y } : node))
    );
  }, []);

  // Pinboard: toggle pinned state
  const togglePinNode = useCallback((nodeId: string) => {
    playPin();
    setBoardNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, pinned: !node.pinned } : node))
    );
  }, []);

  // Pinboard: connect two nodes with red string
  const connectNodes = useCallback(
    (
      fromId: string,
      toId: string,
      type: ConnectionType = 'corroborates',
      label: string = 'Liên kết suy luận',
      description?: string
    ): boolean => {
      if (fromId === toId) return false;

      // Check if already exists in either direction
      const exists = connections.some(
        (c) =>
          (c.fromNodeId === fromId && c.toNodeId === toId) ||
          (c.fromNodeId === toId && c.toNodeId === fromId)
      );

      if (exists) return false;

      // Tìm connection khớp với mẫu chuẩn để lấy label/type chuẩn
      const matchingPreset = mockCase.connections.find(
        (c) =>
          (c.fromNodeId === fromId && c.toNodeId === toId) ||
          (c.fromNodeId === toId && c.toNodeId === fromId)
      );

      const finalType = matchingPreset ? matchingPreset.type : type;
      const finalLabel = matchingPreset ? matchingPreset.label : label;
      const finalDesc = matchingPreset ? matchingPreset.description : description;

      const newConnection: IConnection = {
        id: `CONN-USER-${Date.now()}`,
        fromNodeId: fromId,
        toNodeId: toId,
        type: finalType,
        label: finalLabel,
        description: finalDesc,
      };

      playStringConnect();
      setConnections((prev) => [...prev, newConnection]);
      return true;
    },
    [connections]
  );

  // Pinboard: remove connection
  const removeConnection = useCallback((connectionId: string) => {
    playClick();
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
  }, []);

  // Pinboard: add custom node
  const addBoardNode = useCallback((node: Omit<IBoardNode, 'id'>): string => {
    const id = `NODE-CUSTOM-${Date.now()}`;
    const newNode: IBoardNode = { ...node, id };
    playPin();
    setBoardNodes((prev) => [...prev, newNode]);
    return id;
  }, []);

  // DEMO / AUTO-SOLVE MODE DÀNH CHO BAN GIÁM KHẢO (BGK FAST-TRACK)
  const triggerDemoAutoSolve = useCallback(() => {
    setIsDemoMode(true);

    // 1. Mở khóa toàn bộ 6 chứng cứ then chốt
    const allEvidenceIds = mockEvidences.map((e) => e.id);
    setDiscoveredEvidenceIds(allEvidenceIds);

    // 2. Mở khóa toàn bộ điểm nóng tại hiện trường
    setHotspots(mockCase.hotspots.map((h) => ({ ...h, discovered: true })));

    // 3. Khởi tạo toàn bộ sơ đồ bảng ghim với vị trí tối ưu
    setBoardNodes(mockBoardNodes.map((node) => ({ ...node, pinned: true })));

    // 4. Nối toàn bộ 10 đường dây chỉ đỏ suy luận logic hoàn chỉnh
    setConnections(mockConnections);

    // 5. Đánh dấu mâu thuẫn lời khai đã được bóc trần
    setContradictionsFound({
      'SUSPECT-01': false,
      'SUSPECT-02': true,
      'SUSPECT-03': true,
    });

    // 6. Cập nhật đầy đủ hồ sơ nhật ký suy luận vụ án
    setSuspectNotes({
      'SUSPECT-01': [
        'Ngoại phạm: Được 2 nhân chứng độc lập xác nhận ở phòng phục trang tầng 2 suốt từ 22:05 đến 22:25.',
        'Động cơ: Bị tước thừa kế và ép ly hôn, nhưng chọn khởi kiện dân sự thay vì manh động.',
        'Kết luận: Loại trừ diện tình nghi.',
      ],
      'SUSPECT-02': [
        'THỦ PHẠM CHÍNH: Trợ lý Huy Hoàng.',
        'Động cơ: Thâm hụt 3,2 tỷ ngân sách dàn nhạc bị phát hiện, đối mặt tối hậu thư 24:00.',
        'Phương thức: Pha Kali Xianua nồng độ cao vào ấm trà hoa cúc mang vào lúc 22:12.',
        'MÂU THUẪN TỬ THẦN 22:15: Khai nghe điện thoại lúc 22:15, nhưng đồng hồ cơ dừng ở 22:15 do va đập khi nạn nhân ngạt thở gục ngã và lịch sử cuộc gọi rỗng từ 22:08.',
        'Vật chứng kẹp trong tay nạn nhân: Cúc áo mạ vàng và mảnh vải len navy rách từ áo vest của Huy Hoàng.',
      ],
      'SUSPECT-03': [
        'Động cơ: Sợ bị phanh phui đạo văn bản giao hưởng của cố nhạc sĩ Minh Triết.',
        'Hành vi: Dùng loa Bluetooth phát nhạc tạo ngoại phạm giả để lẻn vào trộm bản thảo lúc 22:22.',
        'Kết luận: Đến sau khi nạn nhân đã chết lúc 22:15, không phải hung thủ.',
      ],
    });

    // Phát âm thanh cao trào kịch tính
    playMysteryPiano();
    setTimeout(() => {
      playSuccess();
    }, 450);
  }, []);

  // Reset Game về trạng thái ban đầu
  const resetGame = useCallback(() => {
    setIsDemoMode(false);
    setCurrentScreenState('intro');
    setDiscoveredEvidenceIds(INITIAL_DISCOVERED_EVIDENCES);
    setSelectedEvidence(null);
    setHotspots(
      mockCase.hotspots.map((h) => ({
        ...h,
        discovered: h.evidenceId ? INITIAL_DISCOVERED_EVIDENCES.includes(h.evidenceId) : h.discovered,
      }))
    );
    setSelectedSuspectId('SUSPECT-02');
    setSuspectNotes(INITIAL_SUSPECT_NOTES);
    setCurrentDialogueNodes({
      'SUSPECT-01': 'DLG-QN-01',
      'SUSPECT-02': 'DLG-HH-01',
      'SUSPECT-03': 'DLG-TK-01',
    });
    setDialogueHistory({
      'SUSPECT-01': [],
      'SUSPECT-02': [],
      'SUSPECT-03': [],
    });
    setContradictionsFound({
      'SUSPECT-01': false,
      'SUSPECT-02': false,
      'SUSPECT-03': false,
    });
    setBoardNodes(mockBoardNodes);
    setConnections(mockConnections.slice(0, 4));
    setSelectedBoardNodeId(null);
    setVerdictSubmitted(false);
    setVerdictResult(null);
    playPageFlip();
  }, []);

  // Submit verdict & evaluate score
  const submitVerdict = useCallback(
    (culpritId: string, selectedEvidenceIds: string[], _motiveText?: string): IVerdictResult => {
      const isCorrect = culpritId === mockCase.verdict.culpritId;
      const keyEvids = mockCase.verdict.keyEvidenceIds;
      const matchedKeyEvids = selectedEvidenceIds.filter((id) => keyEvids.includes(id));

      let score = 0;
      if (isCorrect) score += 50;

      // Điểm cộng theo số chứng cứ mấu chốt được chọn đúng (tối đa 40 điểm)
      score += Math.min(40, matchedKeyEvids.length * 8);

      // Điểm mâu thuẫn thời gian (nếu chọn EVD-02 hoặc EVD-06)
      const hasTimelineConflict =
        selectedEvidenceIds.includes('EVD-02') || selectedEvidenceIds.includes('EVD-06');
      if (hasTimelineConflict) score += 10;

      let rank = 'Thám Tử Tập Sự (Novice Detective)';
      if (score >= 90) rank = 'Thám Tử Bậc Thầy (Master Detective)';
      else if (score >= 70) rank = 'Điều Tra Viên Xuất Sắc (Senior Investigator)';
      else if (score >= 50) rank = 'Thám Tử Thực Tập (Detective Trainee)';

      const feedback = isCorrect
        ? `XUẤT SẮC! Bạn đã vạch trần chính xác thủ phạm là ${mockCase.verdict.culpritName}. Mâu thuẫn mốc thời gian 22:15 giữa lời khai ngụy tạo và chiếc đồng hồ Patek Philippe vỡ cùng cước viễn thông rỗng đã hoàn toàn đánh bại kế hoạch thủ ác.`
        : `Phán quyết chưa chính xác! Thủ phạm thực sự đã lợi dụng kẽ hở thời gian để đánh lạc hướng bạn. Hãy kiểm tra lại chiếc đồng hồ cơ vỡ lúc 22:15 và mẩu cúc áo trong tay nạn nhân.`;

      if (isCorrect) {
        playSuccess();
      } else {
        playContradiction();
      }

      const result: IVerdictResult = {
        isCorrect,
        score,
        rank,
        feedback,
        culpritName:
          mockCase.suspects.find((s) => s.id === culpritId)?.name || 'Không xác định',
        actualCulprit: mockCase.verdict.culpritName,
        unlockedTimeline: hasTimelineConflict,
      };

      setVerdictSubmitted(true);
      setVerdictResult(result);
      return result;
    },
    []
  );

  // Sfx convenience object
  const playSfx = useMemo(
    () => ({
      typewriter: playTypewriter,
      pageFlip: playPageFlip,
      evidence: playEvidenceCollect,
      pin: playPin,
      string: playStringConnect,
      mystery: playMysteryPiano,
      contradiction: playContradiction,
      success: playSuccess,
      click: playClick,
    }),
    []
  );

  const value = useMemo<IGameStateContext>(
    () => ({
      caseData: mockCase,
      currentScreen,
      setCurrentScreen,
      evidenceList: mockCase.evidence,
      discoveredEvidenceIds,
      discoveredEvidences,
      selectedEvidence,
      setSelectedEvidence,
      discoverEvidence,
      isEvidenceDiscovered,
      hotspots,
      examineHotspot,
      suspects: mockCase.suspects,
      selectedSuspectId,
      setSelectedSuspectId,
      selectedSuspect,
      suspectNotes,
      addSuspectNote,
      dialogueHistory,
      currentDialogueNodes,
      contradictionsFound,
      chooseDialogueOption,
      presentEvidence,
      boardNodes,
      connections,
      selectedBoardNodeId,
      setSelectedBoardNodeId,
      updateNodePosition,
      togglePinNode,
      connectNodes,
      removeConnection,
      addBoardNode,
      isDemoMode,
      triggerDemoAutoSolve,
      resetGame,
      verdictSubmitted,
      verdictResult,
      submitVerdict,
      isMuted: muted,
      toggleMute: handleToggleMute,
      playSfx,
    }),
    [
      currentScreen,
      setCurrentScreen,
      discoveredEvidenceIds,
      discoveredEvidences,
      selectedEvidence,
      discoverEvidence,
      isEvidenceDiscovered,
      hotspots,
      examineHotspot,
      selectedSuspectId,
      selectedSuspect,
      suspectNotes,
      addSuspectNote,
      dialogueHistory,
      currentDialogueNodes,
      contradictionsFound,
      chooseDialogueOption,
      presentEvidence,
      boardNodes,
      connections,
      selectedBoardNodeId,
      updateNodePosition,
      togglePinNode,
      connectNodes,
      removeConnection,
      addBoardNode,
      isDemoMode,
      triggerDemoAutoSolve,
      resetGame,
      verdictSubmitted,
      verdictResult,
      submitVerdict,
      muted,
      handleToggleMute,
      playSfx,
    ]
  );

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
};

export const useGameState = (): IGameStateContext => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
