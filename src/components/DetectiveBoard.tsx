import React, { useState, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Link2,
  Plus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Eye,
  X,
  Volume2,
  VolumeX,
  ShieldAlert,
  Flame,
  FileText,
  Camera,
  ChevronRight,
  Search,
  Users,
} from 'lucide-react';
import {
  IBoardNode,
  IConnection,
  BoardNodeType,
  ConnectionType,
} from '../types/game';
import {
  mockConnections,
} from '../data/mockCase';
import {
  playClick,
  playPin,
  playStringConnect,
  playMysteryPiano,
  playSuccess,
  playContradiction,
  playTypewriter,
  playPageFlip,
  isAudioMuted,
  toggleAudioMute,
} from '../utils/audio';

// Định nghĩa mở rộng cho thẻ trên bảng điều tra
export interface IExtendedBoardNode extends IBoardNode {
  category?: 'polaroid' | 'note';
  imageUrl?: string;
  stamp?: string;
  tagColor?: string;
  subtitle?: string;
  evidenceCode?: string;
}

// Định nghĩa liên kết suy luận chuẩn xác (Deduction Pair Knowledge Base)
export interface IDeductionPairRule {
  id: string;
  nodeAId: string;
  nodeBId: string;
  title: string;
  connectionType: ConnectionType;
  label: string;
  insight: string;
  importance: 'critical' | 'high' | 'medium';
  isCulpritKey?: boolean;
}

// 10 Cặp liên kết suy luận cốt lõi của Vụ án 'Bản Giao Hưởng Đoạt Mệnh'
export const DEDUCTION_RULES: IDeductionPairRule[] = [
  {
    id: 'DED-01',
    nodeAId: 'NODE-VICTIM',
    nodeBId: 'NODE-CRITICAL-TIME',
    title: 'Thời Khắc Tử Thần 22:15',
    connectionType: 'timeline',
    label: 'Thời điểm ngã gục',
    insight:
      'Đồng hồ cơ Patek Philippe của Nhạc trưởng Hoàng Long bị va đập gãy kim đúng 22:15 khi ông gục ngã vì trúng độc Kali Xianua. Thời khắc này ấn định cột mốc tử vong chuẩn xác.',
    importance: 'critical',
  },
  {
    id: 'DED-02',
    nodeAId: 'NODE-SUSPECT-HH',
    nodeBId: 'NODE-CRITICAL-TIME',
    title: 'Mâu Thuẫn Ngoại Phạm Của Huy Hoàng',
    connectionType: 'contradicts',
    label: 'Mâu thuẫn ngoại phạm 22:15',
    insight:
      'Huy Hoàng khai lúc 22:15 đi ngang phòng vẫn nghe tiếng Nhạc trưởng đang to tiếng nói chuyện điện thoại. Nhưng Hoàng Long đã ngạt thở gục ngã từ 22:15 và điện thoại không hề có cuộc gọi nào sau 22:08!',
    importance: 'critical',
    isCulpritKey: true,
  },
  {
    id: 'DED-03',
    nodeAId: 'NODE-CRITICAL-TIME',
    nodeBId: 'NODE-EVD-PHONE',
    title: 'Bóc Trần Bằng Cước Viễn Thông',
    connectionType: 'contradicts',
    label: 'Bác bỏ cước gọi',
    insight:
      'Lịch sử cuộc gọi iPhone của Hoàng Long dừng hẳn từ 22:08. Khẳng định lời khai "nạn nhân đang nói chuyện điện thoại lúc 22:15" của Huy Hoàng là hoàn toàn ngụy tạo nhằm thoát tội.',
    importance: 'critical',
    isCulpritKey: true,
  },
  {
    id: 'DED-04',
    nodeAId: 'NODE-CRITICAL-TIME',
    nodeBId: 'NODE-EVD-WATCH',
    title: 'Chứng Cứ Cơ Học Đồng Hồ Patek',
    connectionType: 'corroborates',
    label: 'Xác nhận cơ học',
    insight:
      'Mặt kính sapphire và bánh răng cơ học bị vỡ kẹt tại 22:15 do va chạm mạnh với cạnh bàn gỗ trong lúc xô xát, hoàn toàn khớp với vết bầm mu bàn tay của nạn nhân.',
    importance: 'high',
  },
  {
    id: 'DED-05',
    nodeAId: 'NODE-SUSPECT-HH',
    nodeBId: 'NODE-EVD-BUTTON',
    title: 'Dấu Vết Vật Chứng Áo Vest Huy Hoàng',
    connectionType: 'corroborates',
    label: 'Dấu vết vật chứng',
    insight:
      'Cúc áo kim loại mạ vàng và sợi len navy kẹp chặt trong tay nạn nhân trùng khớp hoàn toàn với áo vest trợ lý của Huy Hoàng bị rách vạt phải. Hung thủ chính là người giằng co với Hoàng Long!',
    importance: 'critical',
    isCulpritKey: true,
  },
  {
    id: 'DED-06',
    nodeAId: 'NODE-SUSPECT-HH',
    nodeBId: 'NODE-EVD-TEA',
    title: 'Phương Thức Đầu Độc Bằng Trà Hoa Cúc',
    connectionType: 'suspects',
    label: 'Phương thức đầu độc',
    insight:
      'Huy Hoàng là người duy nhất nắm thói quen uống trà hoa cúc của Hoàng Long, đã pha Kali Xianua nồng độ cực cao vào tách và mang vào phòng lúc 22:12 theo camera an ninh.',
    importance: 'critical',
    isCulpritKey: true,
  },
  {
    id: 'DED-07',
    nodeAId: 'NODE-SUSPECT-HH',
    nodeBId: 'NODE-EVD-AUDIT',
    title: 'Động Cơ Sát Hại: Biển Thủ 3,2 Tỷ',
    connectionType: 'motive',
    label: 'Động cơ sát hại',
    insight:
      'Hồ sơ kiểm toán bị xé vụn trong thùng rác cầu thang: Hoàng Long phát hiện Huy Hoàng thụt két 3,2 tỷ và ra tối hậu thư hạn chót 24:00 đêm nay phải tự thú nếu không sẽ báo cảnh sát.',
    importance: 'critical',
    isCulpritKey: true,
  },
  {
    id: 'DED-08',
    nodeAId: 'NODE-SUSPECT-HH',
    nodeBId: 'NODE-EVD-LOGS',
    title: 'Camera & Thẻ Từ Bác Bỏ Ngoại Phạm',
    connectionType: 'contradicts',
    label: 'Mâu thuẫn thẻ từ & Camera',
    insight:
      'Huy Hoàng khai ngồi trong phòng âm thanh tầng 3 lúc 22:15, nhưng thẻ từ không hề có dữ liệu quẹt cửa. Lệnh in thực chất được kích hoạt từ xa qua mạng nội bộ để ngụy tạo chứng cứ ngoại phạm.',
    importance: 'high',
    isCulpritKey: true,
  },
  {
    id: 'DED-09',
    nodeAId: 'NODE-SUSPECT-QN',
    nodeBId: 'NODE-CRITICAL-TIME',
    title: 'Ngoại Phạm Vững Chắc Của Quỳnh Nga',
    connectionType: 'corroborates',
    label: 'Ngoại phạm xác thực',
    insight:
      'Hai nhân chứng độc lập xác nhận Quỳnh Nga ở phòng phục trang tầng 2 suốt từ 22:05 đến 22:25. Dù có mâu thuẫn ly hôn và quyền thừa kế, cô hoàn toàn bị loại trừ khỏi diện nghi can gây án.',
    importance: 'medium',
  },
  {
    id: 'DED-10',
    nodeAId: 'NODE-SUSPECT-TK',
    nodeBId: 'NODE-VICTIM',
    title: 'Hành Vi Của Violinist Tuấn Kiệt',
    connectionType: 'corroborates',
    label: 'Đến sau khi nạn nhân chết',
    insight:
      'Tuấn Kiệt dùng loa Bluetooth phát bản nhạc tạo ngoại phạm rồi lẻn vào phòng nạn nhân lúc 22:22 để trộm bản concerto đạo nhái. Hắn phát hiện thầy đã tắt thở từ trước nên hoảng sợ bỏ chạy.',
    importance: 'medium',
  },
];

// Danh sách ban đầu 11 thẻ ghim đa dạng (Polaroid + Note cards)
const INITIAL_EXTENDED_NODES: IExtendedBoardNode[] = [
  {
    id: 'NODE-VICTIM',
    type: 'victim',
    title: 'Nhạc Trưởng Hoàng Long',
    subtitle: 'Nạn nhân 52 tuổi - Sáng lập dàn nhạc',
    description:
      'Tử vong do ngộ độc Kali Xianua cấp tính trong phòng làm việc lúc 22:13 - 22:15. Bàn tay nắm chặt cúc áo kim loại.',
    x: 480,
    y: 40,
    referenceId: 'VICTIM-HOANG-LONG',
    pinned: true,
    category: 'polaroid',
    imageUrl:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=350&auto=format&fit=crop&q=80',
    stamp: 'NẠN NHÂN',
    tagColor: 'bg-rose-950 text-rose-200 border-rose-800',
  },
  {
    id: 'NODE-SUSPECT-QN',
    type: 'suspect',
    title: 'Ca Sĩ Quỳnh Nga',
    subtitle: 'Vợ nạn nhân - Giọng nữ cao Solo',
    description:
      'Động cơ: Bị tước quyền thừa kế 80% tài sản và ép ly hôn. Ngoại phạm lúc 22:15 có 2 nhân chứng độc lập xác nhận.',
    x: 100,
    y: 180,
    referenceId: 'SUSPECT-01',
    category: 'polaroid',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=350&auto=format&fit=crop&q=80',
    stamp: 'VỢ NẠN NHÂN',
    tagColor: 'bg-indigo-950 text-indigo-200 border-indigo-800',
  },
  {
    id: 'NODE-SUSPECT-HH',
    type: 'suspect',
    title: 'Trợ Lý Huy Hoàng',
    subtitle: 'Quản lý lịch trình & Hậu cần riêng',
    description:
      'Động cơ: Thâm hụt 3,2 tỷ ngân sách dàn nhạc. Khai nghe điện thoại lúc 22:15 nhưng dữ liệu hoàn toàn đối lập.',
    x: 480,
    y: 280,
    referenceId: 'SUSPECT-02',
    isContradiction: true,
    category: 'polaroid',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=350&auto=format&fit=crop&q=80',
    stamp: 'THỦ PHẠM CHÍNH',
    tagColor: 'bg-red-950 text-red-300 border-red-700 animate-pulse',
  },
  {
    id: 'NODE-SUSPECT-TK',
    type: 'suspect',
    title: 'Violinist Tuấn Kiệt',
    subtitle: 'Nghệ sĩ vĩ cầm lĩnh xướng',
    description:
      'Động cơ: Sợ lộ tẩy đạo nhạc bản Concerto. Phát nhạc qua loa Bluetooth ngụy tạo ngoại phạm, đến hiện trường lúc 22:22.',
    x: 870,
    y: 180,
    referenceId: 'SUSPECT-03',
    category: 'polaroid',
    imageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=350&auto=format&fit=crop&q=80',
    stamp: 'HỌC TRÒ CƯNG',
    tagColor: 'bg-amber-950 text-amber-200 border-amber-800',
  },
  {
    id: 'NODE-CRITICAL-TIME',
    type: 'timeline',
    title: 'MỐC TỬ THẦN: 22:15',
    subtitle: 'Thời khắc xung đột ngã gục',
    description:
      'Đồng hồ cơ dừng kim tại 22:15 do va đập với chân bàn. Bác bỏ hoàn toàn mọi lời khai ngoại phạm quanh mốc giờ này!',
    x: 480,
    y: 540,
    isContradiction: true,
    category: 'note',
    stamp: 'MÂU THUẪN',
    tagColor: 'bg-red-900 text-red-200 border-red-600',
  },
  {
    id: 'NODE-EVD-TEA',
    type: 'evidence',
    title: 'Tách Trà Độc (EVD-01)',
    subtitle: 'Chứa cặn Kali Xianua',
    description:
      'Mảnh vỡ sứ men ngọc vương vãi trên thảm. Huy Hoàng là người duy nhất pha và mang vào phòng lúc 22:12.',
    x: 270,
    y: 450,
    referenceId: 'EVD-01',
    category: 'polaroid',
    imageUrl:
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=350&auto=format&fit=crop&q=80',
    stamp: 'ĐỘC CHẤT KCN',
    evidenceCode: 'EVD-01',
    tagColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
  {
    id: 'NODE-EVD-WATCH',
    type: 'evidence',
    title: 'Đồng Hồ Vỡ Kim (EVD-02)',
    subtitle: 'Patek Philippe dừng lúc 22:15',
    description:
      'Bánh răng gãy do va đập mạnh xuống sàn gỗ. Khớp hoàn toàn với vết thương nén ép trên mu bàn tay trái của nạn nhân.',
    x: 270,
    y: 680,
    referenceId: 'EVD-02',
    category: 'polaroid',
    imageUrl:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=350&auto=format&fit=crop&q=80',
    stamp: 'DỪNG 22:15',
    evidenceCode: 'EVD-02',
    tagColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
  },
  {
    id: 'NODE-EVD-BUTTON',
    type: 'evidence',
    title: 'Cúc Áo & Vải Navy (EVD-03)',
    subtitle: 'Kẹp trong bàn tay nạn nhân',
    description:
      'Cúc áo mạ vàng và sợi len navy kẹp chặt trong tay nạn nhân, trùng khớp hoàn toàn với áo vest trợ lý của Huy Hoàng.',
    x: 700,
    y: 450,
    referenceId: 'EVD-03',
    category: 'polaroid',
    imageUrl:
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=350&auto=format&fit=crop&q=80',
    stamp: 'ÁO HUY HOÀNG',
    evidenceCode: 'EVD-03',
    tagColor: 'bg-purple-950 text-purple-300 border-purple-800',
  },
  {
    id: 'NODE-EVD-LOGS',
    type: 'evidence',
    title: 'Thẻ Từ & Camera (EVD-04)',
    subtitle: 'Dữ liệu hành lang & phòng âm thanh',
    description:
      'Không có dữ liệu quẹt thẻ của Huy Hoàng tại phòng âm thanh lúc 22:15; camera bắt quả tang hành tung đáng ngờ ở cánh gà.',
    x: 80,
    y: 500,
    referenceId: 'EVD-04',
    category: 'note',
    stamp: 'KHÔNG QUẸT THẺ',
    evidenceCode: 'EVD-04',
    tagColor: 'bg-slate-900 text-slate-200 border-slate-700',
  },
  {
    id: 'NODE-EVD-AUDIT',
    type: 'motive',
    title: 'Kiểm Toán 3,2 Tỷ (EVD-05)',
    subtitle: 'Tài liệu bị xé trong thùng rác',
    description:
      'Hoàng Long ra tối hậu thư hạn chót 24:00 đêm nay yêu cầu Huy Hoàng tự thú biển thủ 3,2 tỷ trước khi báo cảnh sát.',
    x: 880,
    y: 480,
    referenceId: 'EVD-05',
    category: 'note',
    stamp: 'ĐỘNG CƠ 3,2 TỶ',
    evidenceCode: 'EVD-05',
    tagColor: 'bg-amber-950 text-amber-300 border-amber-800',
  },
  {
    id: 'NODE-EVD-PHONE',
    type: 'contradiction',
    title: 'Cước Viễn Thông (EVD-06)',
    subtitle: 'Lịch sử cuộc gọi rỗng từ 22:08',
    description:
      'Cuộc gọi cuối của Hoàng Long kết thúc lúc 22:08. Khẳng định lời khai Huy Hoàng nghe thấy nạn nhân gọi điện lúc 22:15 là bịa đặt!',
    x: 480,
    y: 770,
    referenceId: 'EVD-06',
    isContradiction: true,
    category: 'note',
    stamp: 'RỖNG TỪ 22:08',
    evidenceCode: 'EVD-06',
    tagColor: 'bg-rose-950 text-rose-300 border-rose-800',
  },
];

export interface DetectiveBoardProps {
  onNavigateToScene?: () => void;
  onNavigateToInterrogation?: () => void;
  onNavigateToVerdict?: () => void;
  className?: string;
}

export const DetectiveBoard: React.FC<DetectiveBoardProps> = ({
  onNavigateToScene,
  onNavigateToInterrogation,
  onNavigateToVerdict,
  className = '',
}) => {
  // Trạng thái các node trên bảng ghim
  const [nodes, setNodes] = useState<IExtendedBoardNode[]>(INITIAL_EXTENDED_NODES);

  // Trạng thái các đường nối dây chỉ đỏ
  const [connections, setConnections] = useState<IConnection[]>(() => [
    mockConnections[0], // VICTIM -> CRITICAL-TIME
    mockConnections[1], // SUSPECT-HH -> CRITICAL-TIME
  ]);

  // Trạng thái chọn thẻ để nối dây (Click chọn 2 thẻ)
  const [selectedFirstNodeId, setSelectedFirstNodeId] = useState<string | null>(null);

  // Trạng thái thẻ đang xem chi tiết (Inspect Modal)
  const [inspectedNode, setInspectedNode] = useState<IExtendedBoardNode | null>(null);

  // Trạng thái manh mối suy luận mới mở khóa (Popup Modal)
  const [unlockedInsightModal, setUnlockedInsightModal] = useState<IDeductionPairRule | null>(null);

  // Mở/Đóng khay tổng hợp suy luận (Deduction Drawer)
  const [isDeductionDrawerOpen, setIsDeductionDrawerOpen] = useState<boolean>(false);

  // Modal thêm ghi chú mới
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState<boolean>(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeDesc, setNewNodeDesc] = useState('');
  const [newNodeType, setNewNodeType] = useState<BoardNodeType>('evidence');
  const [newNodeCategory, setNewNodeCategory] = useState<'polaroid' | 'note'>('note');

  // Lọc hiển thị thẻ
  const [filterType, setFilterType] = useState<string>('all');

  // Trạng thái Zoom
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Trạng thái âm thanh
  const [muted, setMuted] = useState<boolean>(() => isAudioMuted());

  // Kéo thả thẻ (Drag & Drop State)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    nodeInitialX: number;
    nodeInitialY: number;
    hasMoved: boolean;
  } | null>(null);

  const boardContainerRef = useRef<HTMLDivElement>(null);

  // Toggle Mute Audio
  const handleToggleMute = () => {
    const next = toggleAudioMute();
    setMuted(next);
  };

  // Tính toán các liên kết đã tạo xem có khớp với quy tắc suy luận chuẩn xác không
  const unlockedDeductionIds = useMemo(() => {
    const ids = new Set<string>();
    connections.forEach((conn) => {
      const match = DEDUCTION_RULES.find(
        (r) =>
          (r.nodeAId === conn.fromNodeId && r.nodeBId === conn.toNodeId) ||
          (r.nodeAId === conn.toNodeId && r.nodeBId === conn.fromNodeId)
      );
      if (match) {
        ids.add(match.id);
      }
    });
    return Array.from(ids);
  }, [connections]);

  // Kiểm tra 1 đường nối cụ thể có phải là suy luận chuẩn xác hay không
  const getDeductionRuleForConnection = useCallback(
    (conn: IConnection): IDeductionPairRule | undefined => {
      return DEDUCTION_RULES.find(
        (r) =>
          (r.nodeAId === conn.fromNodeId && r.nodeBId === conn.toNodeId) ||
          (r.nodeAId === conn.toNodeId && r.nodeBId === conn.fromNodeId)
      );
    },
    []
  );

  // Kiểm tra 1 thẻ có nằm trong các liên kết suy luận chính xác không
  const isNodeHighlighted = useCallback(
    (nodeId: string): boolean => {
      return connections.some((conn) => {
        const isMatched =
          (conn.fromNodeId === nodeId || conn.toNodeId === nodeId) &&
          DEDUCTION_RULES.some(
            (r) =>
              (r.nodeAId === conn.fromNodeId && r.nodeBId === conn.toNodeId) ||
              (r.nodeAId === conn.toNodeId && r.nodeBId === conn.fromNodeId)
          );
        return isMatched;
      });
    },
    [connections]
  );

  // Tính tọa độ trung tâm gắn ghim của mỗi node
  const getNodePinCoordinates = useCallback(
    (nodeId: string): { x: number; y: number } => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return { x: 0, y: 0 };
      const cardWidth = 190;
      // Vị trí ghim thumbtack nằm ở phía trên chính giữa thẻ
      return {
        x: node.x + cardWidth / 2,
        y: node.y + 16,
      };
    },
    [nodes]
  );

  // Kéo thả thẻ ghi chú hoặc polaroid
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    nodeId: string,
    initialX: number,
    initialY: number
  ) => {
    // Ngăn chặn nếu bấm vào nút phụ
    if ((e.target as HTMLElement).closest('.prevent-drag')) return;

    e.preventDefault();
    setDraggingNodeId(nodeId);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      nodeInitialX: initialX,
      nodeInitialY: initialY,
      hasMoved: false,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragStartRef.current) return;
      const dx = (moveEvent.clientX - dragStartRef.current.startX) / zoomLevel;
      const dy = (moveEvent.clientY - dragStartRef.current.startY) / zoomLevel;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragStartRef.current.hasMoved = true;
      }

      const nextX = Math.max(10, Math.min(1050, dragStartRef.current.nodeInitialX + dx));
      const nextY = Math.max(10, Math.min(880, dragStartRef.current.nodeInitialY + dy));

      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, x: nextX, y: nextY } : n))
      );
    };

    const handlePointerUp = () => {
      if (dragStartRef.current && dragStartRef.current.hasMoved) {
        playPin();
      }
      setDraggingNodeId(null);
      dragStartRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // CLICK CHỌN 2 THẺ ĐỂ NỐI DÂY CHỈ ĐỎ (RED STRING SVG)
  const handleCardClick = (nodeId: string) => {
    // Nếu vừa kéo rê thẻ thì không kích hoạt sự kiện click
    if (dragStartRef.current && dragStartRef.current.hasMoved) return;

    playClick();

    // Trường hợp 1: Chưa chọn thẻ nào làm điểm mốc thứ 1
    if (!selectedFirstNodeId) {
      setSelectedFirstNodeId(nodeId);
      playPin();
      return;
    }

    // Trường hợp 2: Bấm lại vào chính thẻ đang chọn -> Hủy chọn
    if (selectedFirstNodeId === nodeId) {
      setSelectedFirstNodeId(null);
      return;
    }

    // Trường hợp 3: Bấm vào thẻ thứ 2 khác thẻ 1 -> NỐI DÂY CHỈ ĐỎ
    const nodeAId = selectedFirstNodeId;
    const nodeBId = nodeId;

    // Kiểm tra xem đã có đường nối giữa 2 thẻ này chưa
    const alreadyConnected = connections.some(
      (c) =>
        (c.fromNodeId === nodeAId && c.toNodeId === nodeBId) ||
        (c.fromNodeId === nodeBId && c.toNodeId === nodeAId)
    );

    if (alreadyConnected) {
      setSelectedFirstNodeId(null);
      return;
    }

    // Kiểm tra xem cặp liên kết này có phải suy luận chuẩn xác không
    const matchingRule = DEDUCTION_RULES.find(
      (r) =>
        (r.nodeAId === nodeAId && r.nodeBId === nodeBId) ||
        (r.nodeAId === nodeBId && r.nodeBId === nodeAId)
    );

    const newConnection: IConnection = {
      id: `CONN-${Date.now()}`,
      fromNodeId: nodeAId,
      toNodeId: nodeBId,
      label: matchingRule ? matchingRule.label : 'Liên kết suy luận',
      type: matchingRule ? matchingRule.connectionType : 'corroborates',
      description: matchingRule ? matchingRule.insight : 'Đường chỉ đỏ do thám tử giăng nối.',
    };

    setConnections((prev) => [...prev, newConnection]);
    setSelectedFirstNodeId(null);

    // XỬ LÝ KHI SUY LUẬN CHÍNH XÁC: Kích hoạt âm thanh, pháo hoa và mở khóa Insight
    if (matchingRule) {
      if (matchingRule.connectionType === 'contradicts') {
        playContradiction();
      } else {
        playStringConnect();
      }
      setTimeout(() => {
        playSuccess();
        playMysteryPiano();
      }, 150);

      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#ef4444', '#f59e0b', '#fbbf24', '#ffffff', '#b91c1c'],
      });

      setUnlockedInsightModal(matchingRule);
    } else {
      playStringConnect();
    }
  };

  // Xóa đường nối chỉ đỏ
  const handleRemoveConnection = (connectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
  };

  // Demo Fast-track: Tự động liên kết toàn bộ 10 suy luận then chốt
  const handleAutoSolveDemo = () => {
    playTypewriter();
    setTimeout(() => {
      playSuccess();
    }, 200);

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#ef4444', '#10b981', '#38bdf8', '#ffffff'],
    });

    // Cập nhật toàn bộ các kết nối chuẩn xác
    const allKeyConnections: IConnection[] = DEDUCTION_RULES.map((rule, idx) => ({
      id: `CONN-DEMO-${idx + 1}`,
      fromNodeId: rule.nodeAId,
      toNodeId: rule.nodeBId,
      label: rule.label,
      type: rule.connectionType,
      description: rule.insight,
    }));

    setConnections(allKeyConnections);
  };

  // Reset bảng về trạng thái sơ đồ nguyên bản
  const handleResetBoard = () => {
    playClick();
    setNodes(INITIAL_EXTENDED_NODES);
    setConnections([mockConnections[0], mockConnections[1]]);
    setSelectedFirstNodeId(null);
  };

  // Thêm ghi chú mới vào bảng ghim
  const handleCreateNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeTitle.trim()) return;

    playPin();
    const newId = `NODE-CUSTOM-${Date.now()}`;
    const newCard: IExtendedBoardNode = {
      id: newId,
      type: newNodeType,
      title: newNodeTitle.trim(),
      subtitle: 'Ghi chú bổ sung của thám tử',
      description: newNodeDesc.trim() || 'Chưa có mô tả chi tiết.',
      x: 350 + Math.floor(Math.random() * 80),
      y: 350 + Math.floor(Math.random() * 80),
      category: newNodeCategory,
      stamp: newNodeType === 'contradiction' ? 'MÂU THUẪN MỚI' : 'GHI CHÚ RIÊNG',
      tagColor: 'bg-amber-950 text-amber-300 border-amber-800',
    };

    setNodes((prev) => [...prev, newCard]);
    setNewNodeTitle('');
    setNewNodeDesc('');
    setIsAddNoteModalOpen(false);
  };

  // Lọc danh sách thẻ hiển thị
  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return nodes;
    if (filterType === 'polaroid') return nodes.filter((n) => n.category === 'polaroid');
    if (filterType === 'note') return nodes.filter((n) => n.category === 'note');
    if (filterType === 'suspect') return nodes.filter((n) => n.type === 'suspect' || n.type === 'victim');
    if (filterType === 'evidence') return nodes.filter((n) => n.type === 'evidence');
    return nodes;
  }, [nodes, filterType]);

  const selectedFirstNode = nodes.find((n) => n.id === selectedFirstNodeId);

  return (
    <div
      className={`relative w-full min-h-screen bg-[#140b07] text-neutral-100 font-inter select-none overflow-hidden flex flex-col ${className}`}
    >
      {/* 1. THANH CÔNG CỤ & TIÊU ĐỀ HỒ SƠ ĐIỀU TRA */}
      <header className="relative z-30 bg-[#20120b]/95 backdrop-blur border-b border-[#3e2417] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Tên hồ sơ & Phù hiệu Cảnh sát */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-700/80 flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-wider px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-700/50 uppercase font-bold">
                HỒ SƠ VỤ ÁN #001
              </span>
              <span className="text-[11px] font-mono text-amber-500/90 tracking-wide">
                BẢN GIAO HƯỞNG ĐOẠT MỆNH
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold font-special text-amber-100 tracking-wide flex items-center gap-2">
              Bảng Ghim Manh Mối Trinh Thám
              <span className="text-xs font-normal font-courier text-amber-400/80 hidden sm:inline">
                (Detective Pinboard)
              </span>
            </h1>
          </div>
        </div>

        {/* Thống kê tiến độ suy luận & Các nút hành động chính */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Huy hiệu đếm số liên kết suy luận chính xác đã mở */}
          <button
            onClick={() => {
              playPageFlip();
              setIsDeductionDrawerOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-600/70 text-amber-200 hover:bg-amber-900/80 transition shadow hover:shadow-amber-900/30 group"
            title="Nhấp để xem danh sách suy luận đã mở khóa"
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider leading-none">
                Suy Luận Mở Khóa
              </div>
              <div className="text-xs font-bold font-courier">
                {unlockedDeductionIds.length} / {DEDUCTION_RULES.length} Manh Mối (
                {Math.round((unlockedDeductionIds.length / DEDUCTION_RULES.length) * 100)}%)
              </div>
            </div>
          </button>

          {/* Nút Thêm Ghi Chú mới */}
          <button
            onClick={() => {
              playClick();
              setIsAddNoteModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 text-xs font-medium transition shadow"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Thêm Ghi Chú</span>
          </button>

          {/* Nút Demo BGK / Tự Động Giải Mã */}
          <button
            onClick={handleAutoSolveDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-900 to-amber-900 hover:from-red-800 hover:to-amber-800 border border-amber-500/70 text-amber-200 text-xs font-bold transition shadow-lg shadow-red-950/50"
            title="Dành cho BGK: Tự động hoàn thiện 10 đường chỉ đỏ suy luận logic"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Fast-Track BGK</span>
          </button>

          {/* Nút Đặt Lại Sơ Đồ */}
          <button
            onClick={handleResetBoard}
            className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white transition"
            title="Đặt lại bảng ghim ban đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Nút Âm Thanh */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white transition"
            title={muted ? 'Bật âm thanh trinh thám' : 'Tắt âm thanh'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Nút chuyển màn hình đến Hiện Trường nếu có */}
          {onNavigateToScene && (
            <button
              onClick={onNavigateToScene}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 text-xs font-medium transition shadow"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Hiện Trường</span>
            </button>
          )}

          {/* Nút chuyển màn hình đến Thẩm Vấn nếu có */}
          {onNavigateToInterrogation && (
            <button
              onClick={onNavigateToInterrogation}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 text-xs font-medium transition shadow"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Thẩm Vấn</span>
            </button>
          )}

          {/* Nút chuyển màn hình đến Phán Quyết nếu có prop callback */}
          {onNavigateToVerdict && (
            <button
              onClick={onNavigateToVerdict}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition shadow-md hover:shadow-red-700/50"
            >
              <span>Phán Quyết</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* 2. THANH BÁO TRẠNG THÁI NỐI DÂY & BỘ LỌC THẺ */}
      <div className="relative z-20 bg-[#1a0e08]/90 border-b border-[#351e13] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Chỉ báo trạng thái Click 2 thẻ để nối dây chỉ đỏ */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
              selectedFirstNodeId
                ? 'bg-red-950/90 text-red-200 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
                : 'bg-stone-900/80 text-stone-400 border-stone-700'
            }`}
          >
            <Link2 className={`w-3.5 h-3.5 ${selectedFirstNodeId ? 'text-red-400 animate-spin' : 'text-stone-500'}`} />
            {selectedFirstNode ? (
              <span className="font-courier">
                Đã ghim mốc 1: <strong className="text-white font-bold">{selectedFirstNode.title}</strong> → Nhấp vào thẻ thứ 2 để giăng dây chỉ đỏ!
              </span>
            ) : (
              <span className="font-courier">
                Chế độ nối chỉ đỏ: Nhấp vào <strong>thẻ thứ nhất</strong>, sau đó nhấp vào <strong>thẻ thứ hai</strong>
              </span>
            )}
          </div>

          {selectedFirstNodeId && (
            <button
              onClick={() => {
                playClick();
                setSelectedFirstNodeId(null);
              }}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-mono border border-stone-600"
            >
              Hủy chọn
            </button>
          )}
        </div>

        {/* Bộ lọc loại thẻ trên bảng */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="text-stone-400 text-[11px] mr-1 hidden sm:inline">Phân loại:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'polaroid', label: 'Ảnh Polaroid' },
            { id: 'note', label: 'Thẻ Ghi Chú' },
            { id: 'suspect', label: 'Nghi Phạm' },
            { id: 'evidence', label: 'Vật Chứng' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playClick();
                setFilterType(item.id);
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                filterType === item.id
                  ? 'bg-amber-800 text-white font-bold shadow'
                  : 'bg-stone-900/80 hover:bg-stone-800 text-stone-400 border border-stone-800'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Điều chỉnh Zoom */}
          <div className="flex items-center gap-0.5 ml-2 pl-2 border-l border-stone-700">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.1))}
              className="p-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-stone-400 w-9 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
              className="p-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC BẢNG GỖ ĐIỀU TRA (CORK & WOOD PINBOARD CANVAS) */}
      <div
        ref={boardContainerRef}
        className="relative flex-1 w-full overflow-auto bg-[#1a0e08] cursor-crosshair"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 40%, rgba(95, 46, 18, 0.25) 0%, rgba(15, 8, 4, 0.95) 100%),
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      >
        {/* Khung viền gỗ sồi cổ điển quanh bảng */}
        <div
          className="relative min-w-[1200px] min-h-[960px] p-6"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Góc kim loại đồng mạ cố định 4 góc bảng */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-600/70 pointer-events-none" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-600/70 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-600/70 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-600/70 pointer-events-none" />

          {/* Lớp SVG VẼ DÂY CHỈ ĐỎ (RED STRING SVG CANVAS) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            style={{ width: '1200px', height: '960px' }}
          >
            <defs>
              {/* Bóng đổ vật lý của dây chỉ đỏ */}
              <filter id="string-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.75" />
              </filter>
              {/* Ánh sáng vàng rực rỡ khi suy luận chính xác */}
              <filter id="insight-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Dây đang kéo tạm thời từ thẻ thứ 1 (nếu có thẻ đang chọn) */}
            {connections.map((conn) => {
              const start = getNodePinCoordinates(conn.fromNodeId);
              const end = getNodePinCoordinates(conn.toNodeId);
              if (!start.x || !end.x) return null;

              // Tính toán độ cong võng tự nhiên của sợi chỉ (Catenary curve approximation)
              const dx = end.x - start.x;
              const dy = end.y - start.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const sag = Math.min(45, Math.max(12, dist * 0.08));

              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2 + sag;

              const pathData = `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;

              // Kiểm tra xem đây có phải là liên kết suy luận chuẩn xác không
              const deductionRule = getDeductionRuleForConnection(conn);
              const isCorrectDeduction = Boolean(deductionRule);

              return (
                <g key={conn.id} className="pointer-events-auto">
                  {/* Bóng của sợi chỉ dưới mặt bảng */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#000000"
                    strokeWidth={isCorrectDeduction ? 5 : 3.5}
                    strokeOpacity={0.6}
                    transform="translate(1, 4)"
                    strokeLinecap="round"
                  />

                  {/* Vòng hào quang vàng rực nếu là suy luận chuẩn xác */}
                  {isCorrectDeduction && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth={6}
                      strokeOpacity={0.6}
                      filter="url(#insight-glow)"
                    />
                  )}

                  {/* Thân dây chỉ đỏ chính (Crimson Red Yarn) */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isCorrectDeduction ? '#ef4444' : '#dc2626'}
                    strokeWidth={isCorrectDeduction ? 3.5 : 2.5}
                    strokeLinecap="round"
                    strokeDasharray={isCorrectDeduction ? 'none' : '6 1'}
                    className="cursor-pointer transition-all hover:stroke-amber-400"
                    onClick={() => {
                      playPageFlip();
                      if (deductionRule) {
                        setUnlockedInsightModal(deductionRule);
                      }
                    }}
                  />

                  {/* Nút Ghim Thumbtack ở 2 đầu dây */}
                  <circle cx={start.x} cy={start.y} r={5} fill="#b91c1c" stroke="#fca5a5" strokeWidth={1.5} />
                  <circle cx={end.x} cy={end.y} r={5} fill="#b91c1c" stroke="#fca5a5" strokeWidth={1.5} />

                  {/* Thẻ đính nhãn ghi chú treo trên dây chỉ đỏ */}
                  <foreignObject
                    x={midX - 75}
                    y={midY - 14}
                    width={150}
                    height={36}
                    className="overflow-visible pointer-events-auto"
                  >
                    <div className="flex items-center justify-center">
                      <div
                        onClick={() => {
                          playClick();
                          if (deductionRule) {
                            setUnlockedInsightModal(deductionRule);
                          }
                        }}
                        className={`group relative flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono shadow-md cursor-pointer border transition-all ${
                          isCorrectDeduction
                            ? 'bg-amber-950/90 text-amber-200 border-amber-500 shadow-amber-900/50 hover:bg-amber-900'
                            : 'bg-red-950/90 text-red-200 border-red-700/80 hover:bg-red-900'
                        }`}
                      >
                        {isCorrectDeduction && <Sparkles className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />}
                        <span className="truncate max-w-[100px] font-bold">
                          {conn.label || 'Liên kết'}
                        </span>
                        <button
                          onClick={(e) => handleRemoveConnection(conn.id, e)}
                          className="w-3.5 h-3.5 rounded-full bg-black/40 hover:bg-red-600 flex items-center justify-center text-stone-300 hover:text-white ml-0.5"
                          title="Cắt dây chỉ đỏ này"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {/* CÁC THẺ GHI CHÚ VÀ ẢNH POLAROID TRÊN BẢNG GHIM */}
          <div className="relative z-20">
            {filteredNodes.map((node) => {
              const isSelected = selectedFirstNodeId === node.id;
              const isHighlighted = isNodeHighlighted(node.id);
              const isDragging = draggingNodeId === node.id;

              return (
                <div
                  key={node.id}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '190px',
                  }}
                  onPointerDown={(e) => handlePointerDown(e, node.id, node.x, node.y)}
                  onClick={() => handleCardClick(node.id)}
                  className={`absolute cursor-grab active:cursor-grabbing transition-shadow duration-150 select-none ${
                    isDragging ? 'z-50 scale-105 shadow-2xl' : 'z-20'
                  }`}
                >
                  {/* ĐINH GHIM THUMBTACK ĐỎ (Pushpin) */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                        isSelected
                          ? 'bg-red-600 ring-4 ring-red-400 scale-125 animate-bounce'
                          : 'bg-gradient-to-br from-red-600 to-rose-950 border border-red-300'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-white/70 shadow-inner" />
                    </div>
                    {/* Bóng đổ của thân kim */}
                    <div className="w-1 h-2 bg-black/50 blur-[0.5px] -mt-0.5" />
                  </div>

                  {/* HIỂN THỊ THẺ POLAROID HOẶC THẺ GHI CHÚ GIẤY VÀNG */}
                  {node.category === 'polaroid' ? (
                    /* --- ẢNH POLAROID --- */
                    <div
                      className={`relative bg-neutral-100 text-neutral-900 rounded-sm p-2 pb-4 shadow-[0_12px_28px_rgba(0,0,0,0.65)] border transition-all ${
                        isSelected
                          ? 'ring-4 ring-red-500 border-red-400 scale-[1.03] shadow-red-950/80'
                          : isHighlighted
                          ? 'ring-2 ring-amber-400 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.45)]'
                          : 'border-neutral-300 hover:border-amber-400/80 hover:shadow-xl'
                      }`}
                    >
                      {/* Băng dính hoặc Nhãn phân loại */}
                      {node.stamp && (
                        <div className="absolute -top-2 -right-2 z-10 rotate-6">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider rounded border shadow uppercase ${
                              node.tagColor || 'bg-red-900 text-red-100 border-red-700'
                            }`}
                          >
                            {node.stamp}
                          </span>
                        </div>
                      )}

                      {/* Khung ảnh Polaroid với bộ lọc màu vintage */}
                      <div className="relative w-full h-32 bg-stone-900 rounded-sm overflow-hidden mb-2 group">
                        {node.imageUrl ? (
                          <img
                            src={node.imageUrl}
                            alt={node.title}
                            className="w-full h-full object-cover filter contrast-105 brightness-95 group-hover:scale-105 transition-transform duration-300"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-800 text-stone-500">
                            <Camera className="w-8 h-8 mb-1" />
                            <span className="text-[10px] font-mono">Ảnh Hiện Trường</span>
                          </div>
                        )}

                        {/* Nút xem chi tiết ảnh */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClick();
                            setInspectedNode(node);
                          }}
                          className="prevent-drag absolute bottom-1 right-1 p-1 bg-black/70 hover:bg-black rounded text-white opacity-80 hover:opacity-100 transition"
                          title="Xem ảnh cận cảnh"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Chú thích viết tay phong cách Polaroid */}
                      <div className="text-center px-1">
                        <h3 className="font-special text-sm font-bold text-neutral-900 tracking-tight leading-snug truncate">
                          {node.title}
                        </h3>
                        {node.subtitle && (
                          <p className="text-[10px] font-courier text-neutral-600 truncate mt-0.5">
                            {node.subtitle}
                          </p>
                        )}
                        <p className="text-[11px] font-serif text-neutral-800 line-clamp-2 mt-1 leading-tight text-left italic">
                          "{node.description}"
                        </p>
                      </div>

                      {/* Nút thao tác nhanh trên thẻ */}
                      <div className="mt-2 pt-1 border-t border-neutral-300 flex items-center justify-between text-[10px] text-neutral-600 font-mono">
                        <span className="text-red-700 font-bold">
                          {isSelected ? '● Đang chọn' : 'Nhấp để nối'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClick();
                            setInspectedNode(node);
                          }}
                          className="prevent-drag hover:text-black font-semibold underline flex items-center gap-0.5"
                        >
                          Chi tiết <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* --- THẺ GHI CHÚ GIẤY VÀNG (Sticky / Index Note) --- */
                    <div
                      className={`relative bg-[#fef9c3] text-stone-900 rounded p-3 shadow-[0_10px_25px_rgba(0,0,0,0.6)] border transition-all ${
                        isSelected
                          ? 'ring-4 ring-red-500 border-red-500 scale-[1.03] shadow-red-950/80'
                          : isHighlighted
                          ? 'ring-2 ring-amber-400 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.45)]'
                          : 'border-amber-200/90 hover:border-amber-400 hover:shadow-xl'
                      }`}
                      style={{
                        backgroundImage: `repeating-linear-gradient(transparent, transparent 18px, rgba(0, 0, 0, 0.06) 19px, rgba(0, 0, 0, 0.06) 20px)`,
                      }}
                    >
                      {/* Băng dính dán ở góc */}
                      <div className="absolute -top-2 left-3 w-8 h-3.5 bg-neutral-200/80 -rotate-6 shadow-sm border-t border-b border-neutral-300/60 pointer-events-none" />

                      {/* Nhãn tem đỏ cảnh báo */}
                      {node.stamp && (
                        <div className="flex justify-end mb-1">
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-bold font-mono tracking-wider rounded border shadow-sm uppercase ${
                              node.tagColor || 'bg-amber-900 text-amber-100 border-amber-700'
                            }`}
                          >
                            {node.stamp}
                          </span>
                        </div>
                      )}

                      {/* Tiêu đề đánh máy Máy Chữ (Typewriter) */}
                      <div className="flex items-start gap-1.5 mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-stone-600 shrink-0 mt-0.5" />
                        <h3 className="font-special text-xs font-bold text-stone-900 leading-tight">
                          {node.title}
                        </h3>
                      </div>

                      {/* Nội dung ghi chú */}
                      <p className="font-courier text-[11px] text-stone-800 leading-snug line-clamp-3 mb-2">
                        {node.description}
                      </p>

                      {/* Chân thẻ ghi chú */}
                      <div className="pt-1.5 border-t border-stone-300/80 flex items-center justify-between text-[10px] font-mono text-stone-600">
                        <span className="text-red-700 font-bold">
                          {isSelected ? '● Đang chọn' : 'Nhấp để nối'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClick();
                            setInspectedNode(node);
                          }}
                          className="prevent-drag hover:text-stone-950 font-semibold underline flex items-center gap-0.5"
                        >
                          Xem xét <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. MODAL MỞ KHÓA SUY LUẬN CHÍNH XÁC (DEDUCTION INSIGHT POPUP) */}
      {unlockedInsightModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#2a170e] to-[#1a0e08] border-2 border-amber-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.35)] text-neutral-100">
            {/* Phù hiệu thành tựu suy luận */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-inner">
                <Sparkles className="w-7 h-7 text-amber-400 animate-spin" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/50">
                  ✨ MỞ KHÓA MANH MỐI SUY LUẬN CHÍNH XÁC
                </span>
                <h2 className="text-xl font-bold font-special text-amber-100 mt-1">
                  {unlockedInsightModal.title}
                </h2>
              </div>
            </div>

            {/* Khung nối 2 đầu thẻ */}
            <div className="bg-[#140b07] border border-[#3e2417] rounded-xl p-3 mb-4 flex items-center justify-between text-xs font-courier">
              <div className="flex items-center gap-2 text-stone-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="font-bold">
                  {nodes.find((n) => n.id === unlockedInsightModal.nodeAId)?.title ||
                    unlockedInsightModal.nodeAId}
                </span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                <Link2 className="w-3.5 h-3.5" />
                <span>{unlockedInsightModal.label}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <span className="font-bold">
                  {nodes.find((n) => n.id === unlockedInsightModal.nodeBId)?.title ||
                    unlockedInsightModal.nodeBId}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              </div>
            </div>

            {/* Nội dung diễn giải trinh thám chi tiết */}
            <div className="bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6">
              <div className="text-xs font-mono uppercase text-amber-300/80 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Nhật Ký Suy Luận Điều Tra:
              </div>
              <p className="text-sm font-serif text-amber-100/90 leading-relaxed italic">
                "{unlockedInsightModal.insight}"
              </p>
            </div>

            {/* Thông báo nếu là bằng chứng then chốt chỉ điểm hung thủ Huy Hoàng */}
            {unlockedInsightModal.isCulpritKey && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-950/80 border border-red-600/70 text-red-200 text-xs font-mono flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  <strong>CHỨNG CỨ THEN CHỐT:</strong> Bác bỏ hoàn toàn ngoại phạm của Huy Hoàng, tiến thẳng tới cáo trạng kết tội!
                </span>
              </div>
            )}

            {/* Nút hành động trong Modal */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  playClick();
                  setUnlockedInsightModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-600/40"
              >
                Ghi Nhận Vào Hồ Sơ (Đóng)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. KHAY TỔNG HỢP TOÀN BỘ SUY LUẬN (DEDUCTION DRAWER) */}
      {isDeductionDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="relative w-full max-w-md h-full bg-[#1e1009] border-l border-[#402315] shadow-2xl flex flex-col p-5 text-neutral-100">
            {/* Tiêu đề khay */}
            <div className="flex items-center justify-between pb-4 border-b border-[#3e2417] mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold font-special text-amber-200">
                  Sổ Tay Manh Mối Suy Luận
                </h2>
              </div>
              <button
                onClick={() => {
                  playClick();
                  setIsDeductionDrawerOpen(false);
                }}
                className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thanh tiến trình phá án */}
            <div className="mb-4 bg-[#140b07] p-3 rounded-xl border border-[#3e2417]">
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-amber-400">Tiến độ xâu chuỗi sự thật</span>
                <span className="font-bold text-white">
                  {unlockedDeductionIds.length} / {DEDUCTION_RULES.length}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400 transition-all duration-500"
                  style={{
                    width: `${(unlockedDeductionIds.length / DEDUCTION_RULES.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Danh sách 10 quy tắc suy luận */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {DEDUCTION_RULES.map((rule, idx) => {
                const isUnlocked = unlockedDeductionIds.includes(rule.id);
                const nodeA = nodes.find((n) => n.id === rule.nodeAId);
                const nodeB = nodes.find((n) => n.id === rule.nodeBId);

                return (
                  <div
                    key={rule.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isUnlocked
                        ? 'bg-amber-950/40 border-amber-500/70 shadow-sm'
                        : 'bg-stone-900/60 border-stone-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-stone-300">
                        MANH MỐI #{idx + 1}
                      </span>
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã Mở Khóa
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-stone-500">
                          Chưa xâu chuỗi
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold font-special text-amber-100 mb-1">
                      {rule.title}
                    </h4>

                    <div className="text-[11px] font-courier text-stone-400 mb-2 flex items-center gap-1">
                      <span className="text-stone-300 font-bold">{nodeA?.title || rule.nodeAId}</span>
                      <span className="text-red-400">↔</span>
                      <span className="text-stone-300 font-bold">{nodeB?.title || rule.nodeBId}</span>
                    </div>

                    {isUnlocked ? (
                      <p className="text-xs font-serif text-stone-300 leading-relaxed italic bg-black/30 p-2 rounded">
                        "{rule.insight}"
                      </p>
                    ) : (
                      <p className="text-xs font-mono text-stone-500 italic">
                        [Nối 2 thẻ manh mối tương ứng trên bảng bằng dây chỉ đỏ để giải mã thông điệp này]
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chân khay: Nút tiến tới phán quyết nếu đã hoàn thành đa số suy luận */}
            <div className="pt-4 border-t border-[#3e2417] mt-3">
              <button
                onClick={() => {
                  playSuccess();
                  if (onNavigateToVerdict) onNavigateToVerdict();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
              >
                Tiến Tới Phòng Phán Quyết Thủ Phạm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL KIỂM TRA CẬN CẢNH THẺ (INSPECTION MODAL) */}
      {inspectedNode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#23140c] border border-amber-600/70 rounded-2xl p-6 text-neutral-100 shadow-2xl">
            <button
              onClick={() => {
                playClick();
                setInspectedNode(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Chi tiết ảnh hoặc ghi chú */}
            {inspectedNode.imageUrl && (
              <div className="w-full h-52 rounded-xl overflow-hidden mb-4 border border-stone-700">
                <img
                  src={inspectedNode.imageUrl}
                  alt={inspectedNode.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                {inspectedNode.stamp || inspectedNode.type}
              </span>
              <h3 className="text-xl font-bold font-special text-amber-100 mt-1">
                {inspectedNode.title}
              </h3>
              {inspectedNode.subtitle && (
                <p className="text-xs font-courier text-stone-400 mt-0.5">
                  {inspectedNode.subtitle}
                </p>
              )}
            </div>

            <div className="bg-[#140b07] p-3 rounded-xl border border-stone-800 mb-4">
              <p className="text-xs font-serif text-stone-300 leading-relaxed italic">
                "{inspectedNode.description}"
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedFirstNodeId(inspectedNode.id);
                  setInspectedNode(null);
                  playPin();
                }}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition"
              >
                Ghim Để Nối Dây
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL THÊM GHI CHÚ THÁM TỬ MỚI */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <form
            onSubmit={handleCreateNewNote}
            className="relative w-full max-w-md bg-[#23140c] border border-amber-600/70 rounded-2xl p-6 text-neutral-100 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#3e2417] mb-4">
              <h3 className="text-lg font-bold font-special text-amber-200">
                Thêm Thẻ Manh Mối Mới
              </h3>
              <button
                type="button"
                onClick={() => setIsAddNoteModalOpen(false)}
                className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-stone-300 mb-1">
                  Định Dạng Thẻ:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewNodeCategory('note')}
                    className={`flex-1 py-1.5 rounded-lg border font-mono transition ${
                      newNodeCategory === 'note'
                        ? 'bg-amber-900 border-amber-500 text-white font-bold'
                        : 'bg-stone-900 border-stone-700 text-stone-400'
                    }`}
                  >
                    Thẻ Giấy Vàng
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewNodeCategory('polaroid')}
                    className={`flex-1 py-1.5 rounded-lg border font-mono transition ${
                      newNodeCategory === 'polaroid'
                        ? 'bg-amber-900 border-amber-500 text-white font-bold'
                        : 'bg-stone-900 border-stone-700 text-stone-400'
                    }`}
                  >
                    Ảnh Polaroid
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-stone-300 mb-1">
                  Phân Loại Manh Mối:
                </label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as BoardNodeType)}
                  className="w-full bg-[#140b07] border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="evidence">Vật Chứng (Evidence)</option>
                  <option value="timeline">Mốc Thời Gian (Timeline)</option>
                  <option value="motive">Động Cơ (Motive)</option>
                  <option value="contradiction">Mâu Thuẫn (Contradiction)</option>
                </select>
                </div>

                <div>
                <label className="block font-mono text-stone-300 mb-1">
                  Tiêu Đề Manh Mối:
                </label>
                <input
                  type="text"
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  placeholder="Ví dụ: Dấu chân bùn ở ban công..."
                  className="w-full bg-[#140b07] border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-special"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-stone-300 mb-1">
                  Nội Dung Ghi Chú:
                </label>
                <textarea
                  value={newNodeDesc}
                  onChange={(e) => setNewNodeDesc(e.target.value)}
                  placeholder="Ghi lại nhận định, mốc thời gian hoặc nghi vấn..."
                  rows={3}
                  className="w-full bg-[#140b07] border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-courier"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setIsAddNoteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider"
              >
                Ghim Lên Bảng
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DetectiveBoard;
