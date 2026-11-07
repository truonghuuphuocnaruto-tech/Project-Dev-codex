import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Eye,
  Sparkles,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  Briefcase,
  HelpCircle,
  CheckCircle2,
  Clock,
  Skull,
  FileText,
  Wine,
  ZoomIn,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import {
  playClick,
  playEvidenceCollect,
  playMysteryPiano,
  playPageFlip,
  playSuccess,
  isAudioMuted,
  toggleAudioMute,
} from '../utils/audio';
import { IEvidence } from '../types/game';

// Custom Evidence definition for Crime Scene
export interface ISceneEvidence extends IEvidence {
  detailedImage?: string;
  chemicalAnalysis?: string;
  timeMark?: string;
  foundInHotspot: string;
}

export interface ICrimeHotspot {
  id: string;
  title: string;
  category: 'poison' | 'timeline' | 'document' | 'physical';
  description: string;
  detailedAnalysis: string;
  clueHint: string;
  x: number; // Tọa độ % ngang (0 - 100)
  y: number; // Tọa độ % dọc (0 - 100)
  evidence: ISceneEvidence;
  requiresUv?: boolean;
}

// 4 điểm hotspot trọng tâm theo yêu cầu đề bài và bổ sung
const SCENE_HOTSPOTS: ICrimeHotspot[] = [
  {
    id: 'HOTSPOT-WINE-GLASS',
    title: 'Ly Rượu Vỡ Nhiễm Độc',
    category: 'poison',
    description: 'Ly rượu vang pha lê vỡ nát trên thảm nhung, vết rượu đỏ thẫm đọng cặn tinh thể màu trắng đục.',
    detailedAnalysis:
      'Mảnh vỡ chân ly pha lê vương vãi cạnh vũng vang Bordeaux chưa kịp khô. Giám định sơ bộ phát hiện mùi hạnh nhân đắng nồng nặc và cặn trắng không tan hoàn toàn - dấu hiệu kinh điển của muối Kali Xianua (KCN) nồng độ chí mạng. Cú ngã mạnh của nạn nhân đã làm đổ vỡ chiếc ly.',
    clueHint: 'Kiểm tra cặn bột trắng đọng ở đáy mảnh vỡ lớn nhất.',
    x: 34,
    y: 72,
    evidence: {
      id: 'EVD-01',
      title: 'Mảnh Ly Rượu Vỡ Nhiễm Kali Xianua',
      type: 'physical',
      description: 'Mảnh pha lê vỡ còn dính cặn rượu vang đỏ và bột độc chất Kali Xianua.',
      details:
        'Phân tích quang phổ huỳnh quang xác nhận nồng độ Kali Xianua vượt ngưỡng gây tử vong gấp 8 lần. Chất độc hòa tan trực tiếp vào ly vang của Nhạc trưởng Hoàng Long trước giờ công diễn.',
      locationFound: 'Thảm nhung đỏ cạnh bàn trang điểm nhạc trưởng',
      icon: 'Wine',
      isKeyEvidence: true,
      discoveredAt: '22:35',
      relatedSuspectId: 'SUSPECT-02',
      chemicalAnalysis: 'Dương tính với KCN (Kali Xianua) - 250mg/L',
      timeMark: '22:15 - 22:20',
      foundInHotspot: 'HOTSPOT-WINE-GLASS',
    },
  },
  {
    id: 'HOTSPOT-TORN-SCORE',
    title: 'Bản Thảo Bị Xé Rách',
    category: 'document',
    description: 'Bản thảo tổng phổ giao hưởng viết tay bị xé toạc, vứt vội vã cạnh sọt rác bằng đồng.',
    detailedAnalysis:
      'Tập ký âm tổng phổ giao hưởng "Vũ Điệu Tử Thần" mang nét bút máy màu nâu của nạn nhân. Nửa phần bìa bị xé rách lộ ra dòng bút phê gay gắt: "Tác phẩm này là của cố nhạc sĩ Minh Triết, không phải của cậu! Tôi sẽ công bố toàn bộ sự thật trước hội đồng giám khảo đêm nay." Một động cơ thanh trừng rõ ràng.',
    clueHint: 'So khớp vết xé và chữ viết tay với danh sách nghệ sĩ độc tấu.',
    x: 68,
    y: 65,
    evidence: {
      id: 'EVD-05',
      title: 'Bản Thảo Tổng Phổ Bị Xé Rách',
      type: 'document',
      description: 'Bản tổng phổ độc tấu vĩ cầm bị xé đôi mang bút tích vạch trần đạo văn.',
      details:
        'Tập tài liệu vạch trần vụ việc đạo nhạc gây chấn động giới nghệ thuật hàn lâm. Nhạc trưởng Hoàng Long chuẩn bị công bố việc Tuấn Kiệt chép trộm bản thảo của cố nhạc sĩ Minh Triết.',
      locationFound: 'Cạnh thùng rác kim loại trong góc phòng thay đồ',
      icon: 'FileText',
      isKeyEvidence: true,
      discoveredAt: '22:42',
      relatedSuspectId: 'SUSPECT-03',
      chemicalAnalysis: 'Vết mực Pelikan 4001 cổ điển trùng với bút máy của nạn nhân',
      timeMark: '21:45',
      foundInHotspot: 'HOTSPOT-TORN-SCORE',
    },
  },
  {
    id: 'HOTSPOT-POISON-VIAL',
    title: 'Lọ Độc Dược Giấu Kín',
    category: 'poison',
    description: 'Lọ thủy tinh màu hổ phách giấu sâu trong hốc bí mật phía sau gương trang điểm lớn.',
    detailedAnalysis:
      'Chiếc lọ thủy tinh nâu tối màu dung tích 20ml không dán nhãn, nằm khuất sau tấm gương tráng bạc hai lớp. Nắp cao su có dấu vân tay chưa lau sạch hoàn toàn. Trong lọ vẫn còn sót lại khoảng 1.5ml dung dịch trong suốt có mùi hạnh nhân nồng gắt. Kẻ thủ ác đã vội vàng giấu lọ độc sau khi ra tay.',
    clueHint: 'Dùng đèn UV quét bề mặt thân lọ để thu thập dấu vân tay tiềm ẩn.',
    x: 78,
    y: 28,
    evidence: {
      id: 'EVD-07',
      title: 'Lọ Thủy Tinh Chứa Dung Dịch Độc Tố',
      type: 'forensic',
      description: 'Lọ thuốc độc Kali Xianua giấu kín sau tấm gương trang điểm của nhạc trưởng.',
      details:
        'Mẫu độc dược đối chiếu hoàn toàn trùng khớp với độc chất tìm thấy trong chiếc ly rượu vỡ và mẫu máu giải phẫu của nạn nhân Hoàng Long. Phát hiện dấu vân tay một phần ngón trỏ phải.',
      locationFound: 'Hốc rỗng sau khung gương trang điểm dát vàng',
      icon: 'Skull',
      isKeyEvidence: true,
      discoveredAt: '22:50',
      relatedSuspectId: 'SUSPECT-02',
      chemicalAnalysis: 'Dung dịch bão hòa Potassium Cyanide đậm đặc',
      timeMark: '22:10 - 22:15',
      foundInHotspot: 'HOTSPOT-POISON-VIAL',
    },
  },
  {
    id: 'HOTSPOT-BROKEN-WATCH',
    title: 'Đồng Hồ Vỡ Lúc 22:15',
    category: 'timeline',
    description: 'Chiếc đồng hồ cơ bỏ túi mạ vàng bị đập vỡ nát mặt kính, kim giờ dừng vĩnh viễn ở 22:15.',
    detailedAnalysis:
      'Đồng hồ cơ Patek Philippe mặt kính sapphire cao cấp bị nứt vỡ rạn chân chim do lực tác động trực diện cực lớn. Bánh răng dao động bị kẹt cứng do va chạm, khiến kim giờ chỉ đúng vị trí 10 giờ và kim phút dừng tại số 3 (22:15). Đây chính là mốc thời gian diễn ra cuộc ẩu đả và thời điểm nạn nhân tử vong!',
    clueHint: 'Đối chiếu mốc 22:15 với lời khai ngoại phạm của các nghi phạm.',
    x: 22,
    y: 62,
    evidence: {
      id: 'EVD-02',
      title: 'Đồng Hồ Patek Philippe Vỡ Kim Lúc 22:15',
      type: 'physical',
      description: 'Chiếc đồng hồ cơ bị va đập vỡ vụn bánh đà, đóng băng mốc thời gian án mạng.',
      details:
        'Cơ cấu bánh răng bị gãy do va đập mạnh xuống sàn gỗ sồi. Kim kẹt cứng tại 22:15. Vết bầm trên mu bàn tay trái của nhạc trưởng chứng minh nạn nhân đã ngã đè lên đồng hồ khi bị ngộ độc xianua co giật.',
      locationFound: 'Sàn gỗ dưới chân bàn trang điểm, sát vị trí nạn nhân ngã gục',
      icon: 'Clock',
      isKeyEvidence: true,
      discoveredAt: '22:38',
      relatedSuspectId: 'SUSPECT-02',
      chemicalAnalysis: 'Vết xước kim loại chứa vi sợi len màu xanh navy',
      timeMark: '22:15 (Thời điểm án mạng)',
      foundInHotspot: 'HOTSPOT-BROKEN-WATCH',
    },
  },
  {
    id: 'HOTSPOT-TUXEDO-JACKET',
    title: 'Áo Đuôi Tôm Bị Giằng Rách',
    category: 'physical',
    description: 'Áo đuôi tôm của nhạc trưởng treo trên ma-nơ-canh bị mất một cúc mạ vàng và có vết giằng co.',
    detailedAnalysis:
      'Bộ lễ phục tuxedo nhung đen chuẩn bị cho đêm diễn bế mạc. Tay áo phải có vết giằng giật mạnh làm sút đường chỉ may. Dưới vạt áo dính một sợi len màu xanh navy ngoại lai không thuộc trang phục của nạn nhân.',
    clueHint: 'Tìm kiếm chiếc cúc áo bị mất và so màu sợi len ngoại lai.',
    x: 15,
    y: 35,
    evidence: {
      id: 'EVD-03',
      title: 'Mẩu Vải Len Navy & Cúc Áo Ban Quản Trị',
      type: 'physical',
      description: 'Mẩu vải len dệt xé rách kẹp chặt trong lòng bàn tay phải thi thể nạn nhân.',
      details:
        'Bàn tay phải nạn nhân siết chặt mảnh vải len xanh navy và nửa cúc áo kim loại mạ vàng khắc huy hiệu BQT Nhà Hát. Vest của Trợ lý Huy Hoàng bị mất chiếc cúc áo thứ hai.',
      locationFound: 'Bàn tay phải của thi thể Nhạc trưởng Hoàng Long',
      icon: 'ShieldAlert',
      isKeyEvidence: true,
      discoveredAt: '22:30',
      relatedSuspectId: 'SUSPECT-02',
      chemicalAnalysis: 'Sợi len cashmere nhập khẩu từ Anh Quốc màu Navy #1a2a40',
      timeMark: '22:15',
      foundInHotspot: 'HOTSPOT-TUXEDO-JACKET',
    },
  },
];

export interface CrimeSceneProps {
  onEvidenceCollected?: (evidence: ISceneEvidence) => void;
  onNavigateToBoard?: () => void;
  className?: string;
}

export const CrimeScene: React.FC<CrimeSceneProps> = ({
  onEvidenceCollected,
  onNavigateToBoard,
  className = '',
}) => {
  // Trạng thái thu thập chứng cứ và điểm hotspot
  const [collectedEvidenceIds, setCollectedEvidenceIds] = useState<string[]>([]);
  const [inspectedHotspot, setInspectedHotspot] = useState<ICrimeHotspot | null>(null);
  const [isBagOpen, setIsBagOpen] = useState<boolean>(false);
  const [uvMode, setUvMode] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [muted, setMuted] = useState<boolean>(() => isAudioMuted());
  const [recentlyCollectedId, setRecentlyCollectedId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  // Toggle Mute Audio
  const handleToggleMute = () => {
      const next = toggleAudioMute();
      setMuted(next);
    };

  // Click vào Hotspot để mở Popup Kiểm Tra Cận Cảnh
  const handleHotspotClick = useCallback((hotspot: ICrimeHotspot) => {
      playClick();
      playMysteryPiano();
    setInspectedHotspot(hotspot);
    }, []);

  // Thu thập chứng cứ vào túi đồ thám tử kèm âm thanh
  const handleCollectEvidence = useCallback(
    (hotspot: ICrimeHotspot) => {
      if (collectedEvidenceIds.includes(hotspot.evidence.id)) return;

      // Kích hoạt chuỗi âm thanh trinh thám đặc sắc
      playEvidenceCollect();
      setTimeout(() => {
        playSuccess();
      }, 250);

      const nextList = [...collectedEvidenceIds, hotspot.evidence.id];
      setCollectedEvidenceIds(nextList);
      setRecentlyCollectedId(hotspot.evidence.id);

      if (onEvidenceCollected) {
        onEvidenceCollected(hotspot.evidence);
      }

      // Tự động tắt hiệu ứng rung toast sau 3 giây
      setTimeout(() => {
        setRecentlyCollectedId(null);
      }, 3500);
    },
    [collectedEvidenceIds, onEvidenceCollected]
  );

  // Danh sách chứng cứ đã thu thập trong túi đồ
  const collectedEvidences = useMemo(() => {
    return SCENE_HOTSPOTS.filter((h) => collectedEvidenceIds.includes(h.evidence.id)).map(
      (h) => h.evidence
    );
  }, [collectedEvidenceIds]);

  // Bộ lọc chứng cứ trong túi đồ
  const filteredEvidences = useMemo(() => {
    if (filterType === 'all') return collectedEvidences;
    return collectedEvidences.filter((e) => e.type === filterType);
  }, [collectedEvidences, filterType]);

  // Tiến độ khám nghiệm
  const progressPercent = Math.round(
    (collectedEvidenceIds.length / SCENE_HOTSPOTS.length) * 100
  );

  // Phím tắt bàn phím tiện lợi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectedHotspot) {
          setInspectedHotspot(null);
          playClick();
        } else if (isBagOpen) {
          setIsBagOpen(false);
          playClick();
        }
      }
      if (e.key === 'b' || e.key === 'B') {
        setIsBagOpen((prev) => !prev);
        playPageFlip();
      }
      if (e.key === 'u' || e.key === 'U') {
        setUvMode((prev) => !prev);
        playClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedHotspot, isBagOpen]);

  return (
    <div
      className={`relative w-full min-h-screen bg-neutral-950 text-neutral-100 font-inter select-none overflow-hidden ${className}`}
    >
      {/* 1. TOP BAR: THÔNG TIN VỤ ÁN & CÔNG CỤ THÁM TỬ */}
      <header className="relative z-20 flex flex-wrap items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-amber-900/40 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-400 shadow-inner">
            <Search className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-courier uppercase font-bold tracking-wider rounded bg-red-950/80 border border-red-700/60 text-red-300">
                HIỆN TRƯỜNG VỤ ÁN
              </span>
              <span className="text-xs font-courier text-neutral-400">
                MÃ ÁN: #HN-2215-HL
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold font-special text-neutral-100 tracking-wide">
              Phòng Thay Đồ Nhạc Trưởng Hoàng Long
            </h1>
          </div>
        </div>

        {/* Thanh tiến độ khám nghiệm */}
        <div className="flex items-center gap-4 my-2 sm:my-0">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs font-courier text-amber-300">
              <span>TIẾN ĐỘ THU THẬP:</span>
              <span className="font-bold text-amber-400">
                {collectedEvidenceIds.length} / {SCENE_HOTSPOTS.length} MANH MỐI
              </span>
            </div>
            <div className="w-40 h-2 bg-neutral-800 rounded-full overflow-hidden mt-1 border border-neutral-700">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-300 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Công cụ điều tra */}
          <div className="flex items-center gap-2">
            {/* Chế độ đèn UV Luminol */}
            <button
              onClick={() => {
                setUvMode(!uvMode);
                playClick();
              }}
              title="Phím tắt [U]: Bật/tắt đèn tử ngoại UV huỳnh quang"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-courier font-medium border transition-all ${
                uvMode
                  ? 'bg-purple-900/80 border-purple-400 text-purple-200 shadow-lg shadow-purple-900/50'
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${uvMode ? 'text-purple-300 animate-spin' : ''}`} />
              <span className="hidden sm:inline">ĐÈN UV</span>
              <span>{uvMode ? 'BẬT' : 'TẮT'}</span>
            </button>

            {/* Bật/Tắt Âm thanh */}
            <button
              onClick={handleToggleMute}
              title="Bật/Tắt hiệu ứng âm thanh trinh thám"
              className="p-2 rounded bg-neutral-800/80 border border-neutral-700 text-neutral-300 hover:text-amber-400 hover:bg-neutral-750 transition"
            >
              {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Hướng dẫn */}
            <button
              onClick={() => {
                setShowTutorial(true);
                playClick();
              }}
              title="Hướng dẫn khám nghiệm hiện trường"
              className="p-2 rounded bg-neutral-800/80 border border-neutral-700 text-neutral-300 hover:text-amber-400 hover:bg-neutral-750 transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Nút Mở Túi Đồ Thám Tử */}
            <button
              onClick={() => {
                setIsBagOpen(!isBagOpen);
                playPageFlip();
              }}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold font-courier border transition-all shadow-md ${
                isBagOpen
                  ? 'bg-amber-600 border-amber-400 text-neutral-950'
                  : 'bg-gradient-to-r from-amber-950/90 to-yellow-950/90 border-amber-500/60 text-amber-300 hover:border-amber-400'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>TÚI ĐỒ ({collectedEvidenceIds.length})</span>
              {collectedEvidenceIds.length > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* DẢI BĂNG CẢNH SÁT NIÊM PHONG HIỆN TRƯỜNG (POLICE TAPE) */}
      <div className="relative z-10 w-full overflow-hidden bg-yellow-400 text-black py-0.5 text-[11px] font-mono font-black tracking-widest uppercase shadow-md flex items-center justify-around select-none pointer-events-none opacity-90 border-y border-neutral-900">
        <span>⚠ CẢNH BÁO: KHU VỰC PHONG TỎA BẢO VỆ HIỆN TRƯỜNG</span>
        <span className="hidden md:inline">★ POLICE LINE DO NOT CROSS ★</span>
        <span>KHÁM NGHIỆM VỤ ÁN #22:15</span>
        <span className="hidden lg:inline">VIỆN KHOA HỌC HÌNH SỰ BỘ CÔNG AN</span>
        <span>KHÔNG TỰ Ý THAY ĐỔI VẬT CHỨNG ⚠</span>
      </div>

      {/* 2. MAIN VIEWPORT: KHÔNG GIAN PHÒNG THAY ĐỒ NHẠC TRƯỞNG & CÁC ĐIỂM HOTSPOT */}
      <main className="relative w-full h-[calc(100vh-100px)] overflow-hidden flex items-center justify-center bg-black">
        {/* Layer 1: Đồ họa Không Gian Phòng Thay Đồ (Conductor's Dressing Room Canvas) */}
        <div
          className={`absolute inset-0 transition-filter duration-700 ${
            uvMode
              ? 'brightness-75 contrast-125 saturate-150 filter hue-rotate-[240deg]'
              : 'brightness-90 contrast-110'
          }`}
        >
          {/* Nền phòng: Bức tường gỗ mahogany sẫm màu, rèm nhung đỏ nhà hát và sàn gỗ sồi */}
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#180f12] via-[#1f1618] to-[#0a0708]">
            {/* SVG Illustration chi tiết căn phòng nhạc trưởng */}
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1000 700"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Ánh sáng đèn bàn trang điểm */}
                <radialGradient id="mirrorGlow" cx="70%" cy="30%" r="40%">
                  <stop offset="0%" stopColor="#ffea9f" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#d97706" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
                {/* Đèn trùm sân khấu rọi xuống góc trái */}
                <radialGradient id="stageSpotlight" cx="30%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#451a03" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
                {/* Vũng rượu vang loang trên sàn */}
                <radialGradient id="wineSpill" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#450a0a" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="#7f1d1d" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#2b0505" stopOpacity="0" />
                </radialGradient>
                {/* Hiệu ứng UV Luminol phát quang huỳnh quang xanh/tím */}
                <filter id="luminolGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* TƯỜNG SAU & TẤM ỐP GỖ NGHỆ THUẬT */}
              <rect x="0" y="0" width="1000" height="480" fill="#140d10" />
              {/* Các thanh nẹp gỗ cổ điển */}
              <path
                d="M50 0 V480 M150 0 V480 M850 0 V480 M950 0 V480"
                stroke="#2a1b20"
                strokeWidth="8"
              />
              <rect x="180" y="40" width="180" height="320" fill="#1a1114" stroke="#331e25" strokeWidth="4" />
              <rect x="380" y="40" width="220" height="320" fill="#160e11" stroke="#331e25" strokeWidth="4" />

              {/* RÈM NHUNG ĐỎ SÂN KHẤU CÁP TREO PHÍA TÂY */}
              <path
                d="M0,0 C60,80 30,220 80,480 L0,480 Z"
                fill="#450a0a"
                stroke="#2b0505"
                strokeWidth="3"
                opacity="0.85"
              />
              <path
                d="M1000,0 C940,80 970,220 920,480 L1000,480 Z"
                fill="#450a0a"
                stroke="#2b0505"
                strokeWidth="3"
                opacity="0.85"
              />

              {/* MA-NƠ-CANH VÀ BỘ ÁO ĐUÔI TÔM NHẠC TRƯỞNG (GÓC TRÁI X: 120-200, Y: 180-450) */}
              <g id="tuxedo-rack" opacity="0.9">
                {/* Giá treo kim loại */}
                <ellipse cx="150" cy="450" rx="40" ry="15" fill="#0f0f10" stroke="#404040" strokeWidth="2" />
                <line x1="150" y1="450" x2="150" y2="210" stroke="#737373" strokeWidth="6" />
                {/* Thân áo Tuxedo nhung đen */}
                <path
                  d="M110,240 C120,210 180,210 190,240 L195,380 C175,410 125,410 105,380 Z"
                  fill="#09090b"
                  stroke="#27272a"
                  strokeWidth="3"
                />
                {/* Ve áo bóng lụa Satin */}
                <path d="M125,235 L150,320 L175,235 L150,260 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
                {/* Vạt áo bị rách chỉ & mất cúc thứ hai */}
                <circle cx="150" cy="290" r="4" fill="#ca8a04" stroke="#a16207" strokeWidth="1" />
                {/* Cúc thứ 2 bị đứt văng đi */}
                <circle cx="150" cy="325" r="2.5" fill="#ef4444" opacity="0.8" />
                <path d="M150,325 L165,340" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="2 2" />
                {/* Sợi len xanh navy ngoại lai dính ở tay áo */}
                <path d="M185,310 Q192,318 188,328" stroke="#38bdf8" strokeWidth="2" />
              </g>

              {/* BÀN TRANG ĐIỂM DÁT VÀNG & GƯƠNG LỚN CỦA NHẠC TRƯỞNG (X: 620-920, Y: 100-500) */}
              <g id="vanity-table">
                {/* Bàn gỗ mahogany */}
                <rect x="620" y="380" width="280" height="110" rx="6" fill="#1c1214" stroke="#3a2228" strokeWidth="4" />
                <rect x="640" y="490" width="18" height="150" fill="#140b0d" stroke="#2a161b" strokeWidth="2" />
                <rect x="860" y="490" width="18" height="150" fill="#140b0d" stroke="#2a161b" strokeWidth="2" />
                {/* Hộc kéo bàn */}
                <rect x="640" y="405" width="110" height="40" fill="#24161a" stroke="#482730" strokeWidth="2" />
                <circle cx="695" cy="425" r="5" fill="#ca8a04" />
                <rect x="770" y="405" width="110" height="40" fill="#24161a" stroke="#482730" strokeWidth="2" />
                <circle cx="825" cy="425" r="5" fill="#ca8a04" />

                {/* GƯƠNG TRANG ĐIỂM LỚN HÌNH VÒM */}
                <path
                  d="M660,380 L660,200 C660,110 860,110 860,200 L860,380 Z"
                  fill="#1e293b"
                  stroke="#ca8a04"
                  strokeWidth="8"
                  opacity="0.85"
                />
                {/* Kính tráng thủy phản chiếu mờ ảo */}
                <path
                  d="M670,375 L670,205 C670,125 850,125 850,205 L850,375 Z"
                  fill="url(#mirrorGlow)"
                />
                {/* Bóng đèn tròn viền quanh gương trang điểm cổ điển */}
                {[
                  { cx: 660, cy: 360 },
                  { cx: 660, cy: 290 },
                  { cx: 660, cy: 220 },
                  { cx: 700, cy: 150 },
                  { cx: 760, cy: 130 },
                  { cx: 820, cy: 150 },
                  { cx: 860, cy: 220 },
                  { cx: 860, cy: 290 },
                  { cx: 860, cy: 360 },
                ].map((b, idx) => (
                  <g key={idx}>
                    <circle cx={b.cx} cy={b.cy} r="6" fill="#fef08a" />
                    <circle cx={b.cx} cy={b.cy} r="12" fill="#eab308" opacity="0.25" />
                  </g>
                ))}

                {/* HỐC BÍ MẬT SAU TẤM GƯƠNG (NƠI GIẤU LỌ ĐỘC DƯỢC) */}
                <g id="secret-cabinet">
                  {/* Khung hộc hé lộ */}
                  <rect x="760" y="195" width="40" height="55" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
                  {/* Lọ độc dược thủy tinh hổ phách */}
                  <rect x="772" y="215" width="16" height="28" rx="3" fill="#b45309" stroke="#fbbf24" strokeWidth="1.5" />
                  <rect x="776" y="208" width="8" height="7" fill="#78350f" stroke="#d97706" strokeWidth="1" />
                  <circle cx="780" cy="206" r="3" fill="#451a03" />
                  {/* Biểu tượng đầu lâu nhỏ cảnh báo độc chất */}
                  <circle cx="780" cy="226" r="3" fill="#ef4444" />
                </g>

                {/* Đồ đạc trên mặt bàn: Lọ nước hoa, hộp trang điểm */}
                <rect x="650" y="360" width="22" height="20" fill="#d97706" opacity="0.7" />
                <circle cx="690" cy="368" r="10" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                <rect x="815" y="362" width="30" height="18" fill="#1e1e24" stroke="#64748b" strokeWidth="1" />
              </g>

              {/* SÀN GỖ SỒI & THẢM NHUNG ĐỎ HIỆN TRƯỜNG ÁN MẠNG (Y: 480-700) */}
              <rect x="0" y="480" width="1000" height="220" fill="#171012" />
              {/* Đường ván sàn gỗ */}
              {[510, 545, 585, 630, 675].map((y, i) => (
                <line key={i} x1="0" y1={y} x2="1000" y2={y} stroke="#0d090a" strokeWidth="2" />
              ))}

              {/* TẤM THẢM NHUNG ĐỎ TRUNG TÂM PHÒNG THAY ĐỒ */}
              <ellipse cx="440" cy="590" rx="360" ry="95" fill="#3b0707" stroke="#5a0d0d" strokeWidth="4" />
              <ellipse cx="440" cy="590" rx="340" ry="85" fill="#450a0a" stroke="#7f1d1d" strokeWidth="2" strokeDasharray="8 6" />

              {/* VÙNG VA CHẠM / ẨU ĐẢ: VŨNG RƯỢU VANG & LY PHA LÊ VỠ NÁT (X: 340, Y: 510) */}
              <g id="shattered-wine">
                {/* Vũng rượu vang sẫm màu */}
                <ellipse cx="340" cy="510" rx="75" ry="32" fill="url(#wineSpill)" />
                {/* Vết cặn bột trắng Kali Xianua */}
                <ellipse cx="355" cy="505" rx="14" ry="7" fill="#f8fafc" opacity="0.85" filter="url(#luminolGlow)" />
                {/* Chân ly pha lê gãy */}
                <path d="M320,500 L335,490 L345,512 Z" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />
                <path d="M350,515 L365,502 L358,525 Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" opacity="0.8" />
                <circle cx="360" cy="510" r="4" fill="#f8fafc" />
                <line x1="330" y1="510" x2="350" y2="520" stroke="#bae6fd" strokeWidth="2" />
              </g>

              {/* ĐỒNG HỒ PATEK PHILIPPE BỊ VỠ RƠI GẦN CHÂN BÀN (X: 220, Y: 440) */}
              <g id="broken-watch">
                {/* Dây đeo da nâu sẫm */}
                <path d="M205,435 Q215,420 225,430" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
                {/* Vỏ đồng hồ kim loại mạ vàng */}
                <circle cx="225" cy="438" r="18" fill="#ca8a04" stroke="#eab308" strokeWidth="3" />
                {/* Mặt số trắng & kính nứt rạn */}
                <circle cx="225" cy="438" r="14" fill="#fefce8" />
                {/* Kim đồng hồ chỉ đúng 22:15 (kim ngắn góc 10h, kim dài góc 3h) */}
                <line x1="225" y1="438" x2="216" y2="430" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="225" y1="438" x2="236" y2="438" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                {/* Vết nứt kính vỡ rạn góc 22:15 */}
                <path d="M225,438 L236,428 M225,438 L218,448 M225,438 L235,444" stroke="#94a3b8" strokeWidth="1" />
                {/* Vết máu khô bám viền đồng hồ */}
                <circle cx="237" cy="442" r="3" fill="#881337" />
              </g>

              {/* BẢN THẢO BỊ XÉ RÁCH VỨT CẠNH SỌT RÁC KIM LOẠI (X: 680, Y: 460) */}
              <g id="torn-manuscript">
                {/* Sọt rác kim loại bằng đồng */}
                <ellipse cx="710" cy="500" rx="30" ry="12" fill="#1c1917" stroke="#78716c" strokeWidth="2" />
                <path d="M685,455 L680,500 C680,512 740,512 740,500 L735,455 Z" fill="#292524" stroke="#78716c" strokeWidth="2" />
                {/* Các mảnh giấy nhạc vò nát vương vãi */}
                <path d="M650,455 L690,445 L685,475 L645,470 Z" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" />
                {/* Dòng kẻ khuông nhạc 5 dòng & nốt nhạc đen */}
                <line x1="653" y1="458" x2="682" y2="451" stroke="#44403c" strokeWidth="1" />
                <line x1="654" y1="462" x2="683" y2="455" stroke="#44403c" strokeWidth="1" />
                <line x1="655" y1="466" x2="684" y2="459" stroke="#44403c" strokeWidth="1" />
                {/* Mép giấy xé răng cưa */}
                <path d="M665,448 L670,452 L675,447 L680,453" stroke="#b91c1c" strokeWidth="1.5" />
                {/* Mẩu giấy thứ hai rơi trên thảm */}
                <path d="M635,478 L665,470 L658,495 L630,490 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
              </g>

              {/* PHẤN VẼ VỊ TRÍ THI THỂ NHẠC TRƯỞNG TRÊN SÀN (FORENSIC CHALK OUTLINE) */}
              <g id="body-chalk" opacity="0.35" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6 4" fill="none">
                <ellipse cx="440" cy="580" rx="30" ry="15" /> {/* Đầu */}
                <path d="M430,595 C410,610 390,620 370,625" /> {/* Tay trái hướng về phía đồng hồ vỡ */}
                <path d="M450,595 C480,610 510,605 530,590" /> {/* Tay phải co quắp */}
                <path d="M425,600 L415,660 L380,680" /> {/* Chân trái */}
                <path d="M445,600 L455,660 L490,680" /> {/* Chân phải */}
              </g>

              {/* HIỆU ỨNG ÁNH SÁNG RỌI TỪ ĐÈN TRẦN */}
              <rect x="0" y="0" width="1000" height="700" fill="url(#stageSpotlight)" />
            </svg>
          </div>
        </div>

        {/* Layer 2: Ánh sáng đèn UV huỳnh quang (khi kích hoạt UV Mode) */}
        {uvMode && (
          <div className="absolute inset-0 pointer-events-none z-10 bg-purple-950/30 mix-blend-screen animate-pulse">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-purple-900/30 to-black/60" />
            <div className="absolute top-4 left-4 px-3 py-1 bg-purple-950/80 border border-purple-500/60 rounded text-xs font-mono text-purple-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>CHẾ ĐỘ QUANG PHỔ TỬ NGOẠI (UV 365nm) ĐANG KÍCH HOẠT</span>
            </div>
          </div>
        )}

        {/* Layer 3: CÁC ĐIỂM TƯƠNG TÁC HOTSPOT TRÊN HIỆN TRƯỜNG */}
        <div className="absolute inset-0 z-15 pointer-events-auto">
          {SCENE_HOTSPOTS.map((hotspot) => {
            const isDiscovered = collectedEvidenceIds.includes(hotspot.evidence.id);
            const isTargeted = inspectedHotspot?.id === hotspot.id;

            return (
              <div
                key={hotspot.id}
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute group cursor-pointer"
                onClick={() => handleHotspotClick(hotspot)}
              >
                {/* Hiệu ứng sóng radar tỏa ra */}
                <div className="relative flex items-center justify-center">
                  {!isDiscovered && (
                    <>
                      <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-amber-400 opacity-40"></span>
                      <span className="animate-pulse absolute inline-flex h-8 w-8 rounded-full bg-yellow-500 opacity-60"></span>
                    </>
                  )}

                  {/* Nút Hotspot chính */}
                  <button
                    className={`relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 transition-transform duration-300 transform group-hover:scale-125 shadow-2xl ${
                      isDiscovered
                        ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-emerald-900/60'
                        : isTargeted
                        ? 'bg-amber-500 border-yellow-200 text-neutral-950 scale-125 ring-4 ring-amber-400/50'
                        : 'bg-neutral-900/90 border-amber-400 text-amber-300 hover:border-yellow-200 shadow-amber-950/80'
                    }`}
                  >
                    {isDiscovered ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                    ) : hotspot.category === 'poison' ? (
                      <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 animate-bounce" />
                    ) : hotspot.category === 'timeline' ? (
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                    ) : hotspot.category === 'document' ? (
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                    ) : (
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                    )}
                  </button>

                  {/* Nhãn Tag tên Hotspot khi rê chuột */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 min-w-[160px] text-center">
                    <div className="px-2.5 py-1.5 rounded-md bg-neutral-900/95 border border-amber-500/50 text-neutral-100 shadow-2xl backdrop-blur-md">
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold font-courier text-amber-300">
                        <Eye className="w-3 h-3" />
                        <span>{hotspot.title}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {isDiscovered ? '✓ Đã thu thập chứng cứ' : 'Nhấp để kiểm tra cận cảnh'}
                      </div>
                    </div>
                    {/* Mũi tên tooltip */}
                    <div className="w-2 h-2 bg-neutral-900 border-r border-b border-amber-500/50 transform rotate-45 mx-auto -mt-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hướng dẫn thao tác nhanh ở góc dưới màn hình hiện trường */}
        <div className="absolute bottom-3 left-4 z-15 pointer-events-none flex flex-wrap items-center gap-3 text-xs font-courier text-neutral-400 bg-neutral-950/70 px-3 py-1.5 rounded border border-neutral-800 backdrop-blur-sm">
          <span className="flex items-center gap-1 text-amber-400">
            <Search className="w-3.5 h-3.5" /> Nhấp điểm sáng để soi vết tích
          </span>
          <span className="hidden sm:inline text-neutral-600">|</span>
          <span className="hidden sm:inline">Phím tắt: [ESC] Đóng • [B] Túi Đồ • [U] Đèn UV</span>
        </div>

        {/* Nút truy cập nhanh tới Bảng Suy Luận nếu có callback */}
        {onNavigateToBoard && (
          <div className="absolute bottom-3 right-4 z-15">
            <button
              onClick={() => {
                playClick();
                onNavigateToBoard();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-950/90 border border-red-600/80 text-red-200 hover:bg-red-900 hover:border-red-400 text-xs font-bold font-courier tracking-wider shadow-xl transition backdrop-blur-sm"
            >
              <span>VÀO BẢNG SUY LUẬN</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* 3. MODAL POPUP KIỂM TRA CẬN CẢNH (CLOSE-UP FORENSIC INSPECTION POPUP) */}
      {inspectedHotspot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl bg-neutral-900 border border-amber-600/60 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Popup: Hồ Sơ Khám Nghiệm Cận Cảnh */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-950 border-b border-amber-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/40 text-amber-400">
                  <ZoomIn className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-courier text-amber-400 font-semibold tracking-wider">
                    <span>HỒ SƠ KHÁM NGHIỆM CẬN CẢNH</span>
                    <span>•</span>
                    <span>{inspectedHotspot.id}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-special text-neutral-100">
                    {inspectedHotspot.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setInspectedHotspot(null);
                  playClick();
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung Popup: Ảnh chi tiết mô phỏng & phân tích pháp y */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* KHUNG MINH HỌA CẬN CẢNH (VISUAL CLOSE-UP CARD) */}
              <div className="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden border border-neutral-700 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center p-4">
                {/* Đồ họa biểu tượng đặc trưng của vật chứng */}
                {inspectedHotspot.id === 'HOTSPOT-WINE-GLASS' ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative">
                      <Wine className="w-20 h-20 text-red-600 animate-pulse" />
                      <div className="absolute -bottom-1 -right-1 p-1 bg-yellow-400 text-black rounded-full font-bold text-[10px]">
                        KCN
                      </div>
                    </div>
                    <span className="text-xs font-courier text-red-400 mt-2 font-bold">
                      MẢNH PHA LÊ DÍNH VANG ĐỎ & TINH THỂ ĐỘC
                    </span>
                    <span className="text-[11px] text-neutral-400 italic">
                      Dư lượng Kali Xianua đậm đặc được phát hiện tại miệng ly
                    </span>
                  </div>
                ) : inspectedHotspot.id === 'HOTSPOT-TORN-SCORE' ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <FileText className="w-20 h-20 text-yellow-500" />
                    <span className="text-xs font-courier text-amber-300 mt-2 font-bold">
                      TỔNG PHỔ GIAO HƯỞNG "VŨ ĐIỆU TỬ THẦN"
                    </span>
                    <span className="text-[11px] text-neutral-400 italic">
                      Bút phê màu mực đỏ: "Kẻ đạo văn sẽ phải trả giá đêm nay!"
                    </span>
                  </div>
                ) : inspectedHotspot.id === 'HOTSPOT-POISON-VIAL' ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative">
                      <Skull className="w-20 h-20 text-red-500 animate-bounce" />
                      <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <span className="text-xs font-courier text-red-400 mt-2 font-bold">
                      LỌ ĐỘC CHẤT KALI XIANUA KHÔNG NHÃN MÁC
                    </span>
                    <span className="text-[11px] text-neutral-400 italic">
                      Giấu kín sau gương trang điểm, còn lưu dấu vân tay ngón trỏ phải
                    </span>
                  </div>
                ) : inspectedHotspot.id === 'HOTSPOT-BROKEN-WATCH' ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative">
                      <Clock className="w-20 h-20 text-amber-400" />
                      <div className="absolute -bottom-1 -right-2 px-1.5 py-0.5 bg-red-900 border border-red-500 rounded text-[11px] font-mono text-red-200 font-bold">
                        22:15
                      </div>
                    </div>
                    <span className="text-xs font-courier text-amber-400 mt-2 font-bold">
                      ĐỒNG HỒ PATEK PHILIPPE DỪNG CHÍNH XÁC LÚC 22:15
                    </span>
                    <span className="text-[11px] text-neutral-400 italic">
                      Mặt kính sapphire rạn vỡ do va đập cực mạnh khi ngã gục
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <ShieldAlert className="w-20 h-20 text-sky-400" />
                    <span className="text-xs font-courier text-sky-300 mt-2 font-bold">
                      ÁO ĐUÔI TÔM & MẨU VẢI LEN NAVY NGOẠI LAI
                    </span>
                    <span className="text-[11px] text-neutral-400 italic">
                      Dấu vết của sự giằng co quyết liệt trước lúc tắt thở
                    </span>
                  </div>
                )}

                {/* Tem niêm phong tang vật */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 border border-neutral-700 text-[10px] font-courier text-neutral-300">
                  VỊ TRÍ: {inspectedHotspot.evidence.locationFound}
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-red-950/80 border border-red-700 text-[10px] font-courier text-red-300 font-bold">
                  THỜI ĐIỂM: {inspectedHotspot.evidence.timeMark || '22:15'}
                </div>
              </div>

              {/* BÁO CÁO PHÂN TÍCH PHÁP Y CHI TIẾT */}
              <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-2">
                <div className="text-xs font-courier font-bold text-amber-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>KẾT QUẢ GIÁM ĐỊNH PHÁP Y TẠI CHỖ:</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  {inspectedHotspot.detailedAnalysis}
                </p>
                {inspectedHotspot.evidence.chemicalAnalysis && (
                  <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center gap-2 text-xs font-courier text-emerald-400">
                    <span className="font-bold">KẾT QUẢ XÉT NGHIỆM:</span>
                    <span>{inspectedHotspot.evidence.chemicalAnalysis}</span>
                  </div>
                )}
              </div>

              {/* MANH MỐI GỢI Ý CHO THÁM TỬ */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold font-courier">GỢI Ý PHÁ ÁN: </span>
                  <span>{inspectedHotspot.clueHint}</span>
                </div>
              </div>
            </div>

            {/* Footer Modal: Nút Thu Thập Chứng Cứ */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-950 border-t border-amber-900/50">
              <span className="text-xs font-courier text-neutral-400">
                {collectedEvidenceIds.includes(inspectedHotspot.evidence.id)
                  ? '✓ Vật chứng này đã nằm an toàn trong Túi Đồ Thám Tử'
                  : 'Nhấn nút để niêm phong và lưu vào túi đồ'}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setInspectedHotspot(null);
                    playClick();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-courier transition"
                >
                  ĐÓNG
                </button>

                <button
                  onClick={() => handleCollectEvidence(inspectedHotspot)}
                  disabled={collectedEvidenceIds.includes(inspectedHotspot.evidence.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-courier tracking-wider shadow-lg transition ${
                    collectedEvidenceIds.includes(inspectedHotspot.evidence.id)
                      ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300 cursor-default'
                      : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-neutral-950 border border-yellow-300 active:scale-95'
                  }`}
                >
                  {collectedEvidenceIds.includes(inspectedHotspot.evidence.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>ĐÃ THU THẬP VÀO TÚI ĐỒ</span>
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-4 h-4" />
                      <span>THU THẬP VẬT CHỨNG</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TOAST THÔNG BÁO THU THẬP THÀNH CÔNG VỚI HIỆU ỨNG ÂM THANH */}
      {recentlyCollectedId && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-900/95 border-2 border-emerald-500 text-white shadow-2xl backdrop-blur-md animate-bounce">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-courier font-bold text-emerald-400">
              THU THẬP THÀNH CÔNG!
            </div>
            <div className="text-xs text-neutral-200">
              Vật chứng đã được niêm phong vào Túi Đồ Thám Tử.
            </div>
          </div>
        </div>
      )}

      {/* 5. TÚI ĐỒ THÁM TỬ (DETECTIVE INVENTORY DRAWER / MODAL) */}
      {isBagOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => {
            setIsBagOpen(false);
            playClick();
          }}
        >
          <div
            className="w-full max-w-md h-full bg-neutral-900 border-l border-amber-600/50 shadow-2xl flex flex-col p-5 overflow-hidden animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Túi Đồ */}
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-special text-neutral-100">
                    Túi Đồ Thám Tử
                  </h3>
                  <div className="text-xs font-courier text-amber-400">
                    ĐÃ NIÊM PHONG: {collectedEvidenceIds.length} / {SCENE_HOTSPOTS.length} VẬT CHỨNG
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBagOpen(false);
                  playClick();
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bộ lọc loại vật chứng */}
            <div className="flex items-center gap-1.5 py-3 border-b border-neutral-800 overflow-x-auto text-xs font-courier">
              {[
                { id: 'all', label: 'TẤT CẢ' },
                { id: 'physical', label: 'VẬT THỂ' },
                { id: 'document', label: 'TÀI LIỆU' },
                { id: 'forensic', label: 'ĐỘC CHẤT' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFilterType(f.id);
                    playClick();
                  }}
                  className={`px-2.5 py-1 rounded transition whitespace-nowrap ${
                    filterType === f.id
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Danh sách vật chứng trong túi đồ */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {filteredEvidences.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center text-neutral-500 space-y-2">
                  <Briefcase className="w-12 h-12 stroke-1 text-neutral-600" />
                  <p className="text-xs font-courier">Chưa có vật chứng nào thuộc danh mục này.</p>
                  <p className="text-[11px] text-neutral-600">
                    Hãy nhấp vào các điểm hotspot trên hiện trường để khám xét và thu thập!
                  </p>
                </div>
              ) : (
                filteredEvidences.map((ev) => {
                  const matchingHotspot = SCENE_HOTSPOTS.find(
                    (h) => h.evidence.id === ev.id
                  );
                  return (
                    <div
                      key={ev.id}
                      onClick={() => {
                        if (matchingHotspot) {
                          setInspectedHotspot(matchingHotspot);
                          playClick();
                        }
                      }}
                      className="group p-3 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-500/60 transition cursor-pointer space-y-1.5 shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-courier uppercase font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                          {ev.type}
                        </span>
                        <span className="text-[10px] font-courier text-neutral-500">
                          {ev.discoveredAt}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold font-sans text-neutral-200 group-hover:text-amber-300 transition">
                        {ev.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-2">
                        {ev.description}
                      </p>
                      <div className="text-[10px] font-courier text-amber-400/80 pt-1 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Nhấp để soi lại chi tiết</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Túi Đồ: Trạng thái điều tra */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-courier text-neutral-400">
              <span>ĐÃ KHÁM PHÁ: {progressPercent}%</span>
              {progressPercent === 100 && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> HOÀN TẤT KHÁM NGHIỆM!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL HƯỚNG DẪN ĐIỀU TRA (TUTORIAL MODAL) */}
      {showTutorial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => {
            setShowTutorial(false);
            playClick();
          }}
        >
          <div
            className="w-full max-w-lg bg-neutral-900 border border-amber-600/60 rounded-xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold font-special text-neutral-100">
                  Cẩm Nang Thám Tử: Khám Nghiệm Hiện Trường
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowTutorial(false);
                  playClick();
                }}
                className="p-1 rounded text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 font-sans leading-relaxed">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                  1
                </div>
                <div>
                  <strong className="text-amber-300">Tìm kiếm các điểm Hotspot:</strong> Rê chuột và quan sát kỹ các vị trí nghi vấn trong phòng thay đồ (ly rượu vỡ, bản thảo bị xé, lọ độc dược, đồng hồ vỡ).
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                  2
                </div>
                <div>
                  <strong className="text-amber-300">Khám nghiệm cận cảnh:</strong> Nhấp vào điểm tương tác để kích hoạt popup soi cận cảnh, đọc giám định pháp y và phân tích độc chất.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                  3
                </div>
                <div>
                  <strong className="text-amber-300">Thu thập vào Túi Đồ:</strong> Nhấn nút "Thu Thập Vật Chứng" để niêm phong chứng cứ kèm âm thanh trinh thám.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                  4
                </div>
                <div>
                  <strong className="text-amber-300">Sử dụng Đèn UV:</strong> Bật chế độ quang phổ tử ngoại để phát hiện chất huỳnh quang và dấu vết tiềm ẩn.
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => {
                  setShowTutorial(false);
                  playClick();
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 text-neutral-950 font-bold font-courier text-xs hover:bg-amber-400 transition"
              >
                ĐÃ HIỂU, TIẾP TỤC ĐIỀU TRA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrimeScene;
