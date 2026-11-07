import {
  ICase,
  IEvidence,
  ISuspect,
  IDialogueNode,
  IHotspot,
  IBoardNode,
  IConnection,
  IVerdict,
} from '../types/game';

/**
 * Danh sách 6 chứng cứ then chốt của vụ án 'Bản Giao Hưởng Đoạt Mệnh'
 */
export const mockEvidences: IEvidence[] = [
  {
    id: 'EVD-01',
    title: 'Tách Trà Hoa Cúc Nhiễm Kali Xianua',
    type: 'physical',
    description: 'Các mảnh vỡ của tách trà sứ men ngọc vương vãi trên thảm nhung cạnh bàn làm việc của nhạc trưởng.',
    details:
      'Kết quả phân tích độc chất pháp y phát hiện dư lượng Kali Xianua (KCN) nồng độ cực cao bên trong cặn trà hoa cúc còn đọng lại. Chất độc tác dụng tức thì, gây ngạt thở tế bào và tử vong trong vòng 1-3 phút. Chỉ có một người duy nhất được nạn nhân tin tưởng giao pha ấm trà này trước giờ nghỉ giải lao.',
    locationFound: 'Sàn phòng làm việc riêng của Nhạc trưởng Hoàng Long',
    icon: 'CupSoda',
    isKeyEvidence: true,
    discoveredAt: '22:45',
    relatedSuspectId: 'SUSPECT-02',
  },
  {
    id: 'EVD-02',
    title: 'Đồng Hồ Patek Philippe Vỡ Kim Lúc 22:15',
    type: 'physical',
    description: 'Chiếc đồng hồ cơ cao cấp của Hoàng Long bị vỡ nát mặt kính sapphire, kim giờ và phút kẹt cứng.',
    details:
      'Đồng hồ cơ rơi dưới chân bàn trà, cơ cấu bánh răng bị gãy do cú va đập mạnh xuống sàn gỗ cứng trong lúc xô xát dữ dội. Bộ máy dừng hoạt động chính xác tại thời điểm 22:15. Vết bầm rách da trên mu bàn tay trái của nhạc trưởng trùng khớp hoàn toàn với vị trí vỏ kim loại đồng hồ bị nén ép khi ông ngã xuống.',
    locationFound: 'Góc thảm dưới chân bàn trà, phòng làm việc',
    icon: 'Watch',
    isKeyEvidence: true,
    discoveredAt: '22:40',
    relatedSuspectId: 'SUSPECT-02',
  },
  {
    id: 'EVD-03',
    title: 'Mẩu Vải Len Navy & Cúc Áo Khắc Logo Ban Quản Trị',
    type: 'physical',
    description: 'Mẩu vải len dệt xé rách kẹp chặt trong lòng bàn tay phải co quắp của thi thể.',
    details:
      'Bàn tay phải của Hoàng Long siết chặt một mảnh vải len màu xanh navy sang trọng và nửa chiếc cúc áo kim loại mạ vàng khắc huy hiệu cây gậy nhạc trưởng lồng chữ "BQT" (Ban Quản trị & Trợ lý Nhà hát Lớn). Khám xét sơ bộ cho thấy áo vest của Trợ lý Huy Hoàng bị mất chiếc cúc thứ hai và có mép vải rách trùng khớp sợi chỉ dệt.',
    locationFound: 'Bàn tay phải của nạn nhân',
    icon: 'Shirt',
    isKeyEvidence: true,
    discoveredAt: '22:38',
    relatedSuspectId: 'SUSPECT-02',
  },
  {
    id: 'EVD-04',
    title: 'Nhật Ký Quẹt Thẻ Từ & Camera Hành Lang',
    type: 'digital',
    description: 'Dữ liệu truy cập khóa điện tử phòng âm thanh tầng 3 và băng ghi hình an ninh hành lang cánh gà.',
    details:
      'Báo cáo từ hệ thống máy chủ an ninh: Thẻ từ của Trợ lý Huy Hoàng hoàn toàn không có lượt quẹt mở cửa phòng kỹ thuật âm thanh từ 22:00 đến 22:30, bác bỏ việc anh ta ở trong phòng đó. Ngược lại, camera an ninh cầu thang bộ ghi nhận bóng người mặc vest xanh navy bưng khay trà bước vào phòng nhạc trưởng lúc 22:12 và vội vã rời đi lúc 22:17.',
    locationFound: 'Máy chủ phòng an ninh Nhà Hát Lớn',
    icon: 'Camera',
    isKeyEvidence: true,
    discoveredAt: '23:05',
    relatedSuspectId: 'SUSPECT-02',
  },
  {
    id: 'EVD-05',
    title: 'Báo Cáo Kiểm Toán Bị Xé Rách Trong Lối Thoát Hiểm',
    type: 'document',
    description: 'Tập tài liệu tài chính bị vò nát và xé đôi, vứt vào thùng rác cạnh cửa thoát hiểm tầng trệt.',
    details:
      'Văn bản kiểm toán nội bộ độc lập vạch trần khoản thâm hụt 3,2 tỷ đồng từ tiền bán vé tour lưu diễn châu Âu và quỹ tài trợ nhạc cụ, do Trợ lý Huy Hoàng trực tiếp quản lý thu chi. Phía trên có bút phê mực đỏ giận dữ của Nhạc trưởng Hoàng Long: "Hạn chót giải trình: 24h00 đêm nay! Nếu không nộp đủ biên nhận, tôi sẽ chuyển thẳng hồ sơ sang Cơ quan Cảnh sát Điều tra."',
    locationFound: 'Thùng rác kim loại ở cầu thang thoát hiểm phía Tây',
    icon: 'FileSpreadsheet',
    isKeyEvidence: true,
    discoveredAt: '23:15',
    relatedSuspectId: 'SUSPECT-02',
  },
  {
    id: 'EVD-06',
    title: 'Bản Ghi Cước Viễn Thông & Điện Thoại Của Nạn Nhân',
    type: 'digital',
    description: 'Dữ liệu cuộc gọi trích xuất từ điện thoại iPhone của Hoàng Long và nhà mạng viễn thông.',
    details:
      'Cuộc gọi cuối cùng của Hoàng Long là trao đổi với Giám đốc Nghệ thuật, kết thúc lúc 22:08. Từ 22:09 cho đến khi phát hiện thi thể, không hề có bất kỳ cuộc gọi đến hoặc đi nào. Điều này trực tiếp đập tan lời khai gian dối của Trợ lý Huy Hoàng khi anh ta tuyên bố "lúc 22:15 đi ngang cửa vẫn nghe thấy Nhạc trưởng đang to tiếng nói chuyện điện thoại".',
    locationFound: 'Mặt bàn làm việc phòng Nhạc trưởng',
    icon: 'PhoneCall',
    isKeyEvidence: true,
    discoveredAt: '22:50',
    relatedSuspectId: 'SUSPECT-02',
  },
];

/**
 * 3 Nghi phạm chính của vụ án
 */
export const mockSuspects: ISuspect[] = [
  {
    id: 'SUSPECT-01',
    name: 'Quỳnh Nga',
    role: 'Vợ Nạn Nhân / Ca Sĩ Opera Solo',
    age: 38,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio: 'Nữ ca sĩ giọng soprano hàng đầu của nhà hát, kết hôn với Nhạc trưởng Hoàng Long được 8 năm. Bề ngoài là cặp đôi nghệ sĩ kiểu mẫu nhưng hôn nhân từ lâu đã rạn nứt sâu sắc do sự áp đặt độc đoán của Hoàng Long.',
    relationToVictim: 'Vợ hợp pháp kiêm nghệ sĩ độc xướng dưới quyền chỉ huy của chồng.',
    motive:
      'Phát hiện Hoàng Long vừa bí mật soạn di chúc mới chuyển 80% tài sản và tiền bản quyền tác phẩm vào Quỹ Bảo tồn Âm nhạc Hàn lâm, đồng thời ép cô ký đơn ly hôn không nhận bồi hoàn vì nghi ngờ cô ngoại tình.',
    alibi:
      'Khai rằng lúc 22:15 đang ở phòng phục trang tầng 2 thử lại bộ đầm dạ hội nhung đen cho tiết mục bế mạc cùng thợ may Lan Anh và chuyên gia trang điểm Minh Châu.',
    suspicionLevel: 'medium',
    initialDialogueId: 'DLG-QN-01',
    isCulprit: false,
  },
  {
    id: 'SUSPECT-02',
    name: 'Huy Hoàng',
    role: 'Trợ Lý Riêng Kiêm Quản Lý Lịch Trình',
    age: 34,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: 'Trợ lý gắn bó suốt 6 năm, nắm giữ toàn bộ lịch trình, chìa khóa phòng làm việc và là người duy nhất được chăm lo bữa ăn nhẹ, pha trà hoa cúc cho Nhạc trưởng Hoàng Long mỗi đêm diễn.',
    relationToVictim: 'Trợ lý thân tín phụ trách hậu cần và điều phối tài chính cho Nhạc trưởng.',
    motive:
      'Biển thủ hơn 3,2 tỷ đồng từ tiền tài trợ lưu diễn châu Âu. Hoàng Long vừa nắm bản kiểm toán chiều nay và đưa ra tối hậu thư hạn chót 24:00 đêm nay phải viết đơn tự thú, nếu không sẽ gọi cảnh sát bắt giữ.',
    alibi:
      'Khai rằng vào mốc 22:15, anh ta đang ngồi trong phòng âm thanh tầng 3 gửi lệnh in bảng phân công diễn viên cho ngày mai, và khi đi ngang qua phòng làm việc lúc 22:15 vẫn nghe thấy tiếng Nhạc trưởng to tiếng nói chuyện điện thoại.',
    suspicionLevel: 'high',
    initialDialogueId: 'DLG-HH-01',
    isCulprit: true,
  },
  {
    id: 'SUSPECT-03',
    name: 'Tuấn Kiệt',
    role: 'Nghệ Sĩ Vĩ Cầm Solo (Concertmaster)',
    age: 29,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    bio: 'Tài năng vĩ cầm trẻ tuổi nổi tiếng, học trò cưng được Hoàng Long nâng đỡ. Gần đây đoạt giải thưởng âm nhạc quốc tế danh giá với bản giao hưởng độc tấu vĩ cầm.',
    relationToVictim: 'Học trò kiêm nghệ sĩ vĩ cầm lĩnh xướng dàn nhạc.',
    motive:
      'Hoàng Long phát hiện bản concerto đoạt giải của Tuấn Kiệt thực chất là tác phẩm chép trộm từ tập bản thảo chưa công bố của cố nhạc sĩ Minh Triết (bạn tri kỷ của Hoàng Long). Hoàng Long đã dọa sẽ công khai sự thật và tước thẻ nghệ sĩ vĩnh viễn sau buổi hòa nhạc tối nay.',
    alibi:
      'Khai rằng lúc 22:15 đang ở phòng tập riêng sau cánh gà say sưa luyện bản "Vũ Điệu Tử Thần" (Danse Macabre), nhiều nghệ sĩ khác ở cánh gà có thể làm chứng nghe thấy tiếng vĩ cầm réo rắt liên tục.',
    suspicionLevel: 'medium',
    initialDialogueId: 'DLG-TK-01',
    isCulprit: false,
  },
];

/**
 * Cây hội thoại thẩm vấn chi tiết các nghi phạm
 */
export const mockDialogues: Record<string, IDialogueNode> = {
  // --- THẨM VẤN QUỲNH NGA ---
  'DLG-QN-01': {
    id: 'DLG-QN-01',
    suspectId: 'SUSPECT-01',
    speaker: 'Quỳnh Nga',
    text: 'Các anh nghĩ tôi giết chồng mình sao? Đúng là chúng tôi có cãi vã dữ dội chiều nay, nhưng tôi không thể nào làm cái điều tàn độc đó!',
    options: [
      {
        id: 'OPT-QN-01',
        text: 'Cô có thể cho biết chính xác cô đã ở đâu vào lúc 22:15?',
        nextNodeId: 'DLG-QN-02',
      },
      {
        id: 'OPT-QN-02',
        text: 'Chúng tôi biết về bản di chúc mới của Nhạc trưởng Hoàng Long...',
        nextNodeId: 'DLG-QN-03',
      },
    ],
  },
  'DLG-QN-02': {
    id: 'DLG-QN-02',
    suspectId: 'SUSPECT-01',
    speaker: 'Quỳnh Nga',
    text: 'Lúc 22:15 ư? Tôi đang ở phòng thay đồ nữ tầng 2! Chiếc khóa kéo sau lưng bộ đầm bế mạc bị kẹt, thợ may Lan Anh và cô bé trang điểm Minh Châu phải giúp tôi chỉnh sửa từ 22:05 đến tận 22:25. Họ có thể làm chứng cho tôi từng giây từng phút!',
    isQuestioningAlibi: true,
    options: [
      {
        id: 'OPT-QN-03',
        text: 'Cô có nghe thấy tiếng động gì bất thường từ phòng làm việc của chồng không?',
        nextNodeId: 'DLG-QN-04',
      },
      {
        id: 'OPT-QN-04',
        text: 'Ai là người chịu trách nhiệm chuẩn bị đồ uống cho Nhạc trưởng tối nay?',
        nextNodeId: 'DLG-QN-05',
      },
    ],
  },
  'DLG-QN-03': {
    id: 'DLG-QN-03',
    suspectId: 'SUSPECT-01',
    speaker: 'Quỳnh Nga',
    text: 'Ông ấy muốn tước đoạt tất cả... công sức 8 năm trời tôi hy sinh sự nghiệp để làm bệ phóng cho ông ấy. Nhưng tôi đã thuê luật sư riêng kiện ra tòa phân chia tài sản hợp pháp. Tôi đâu có dại dột giết người để bản thân phải vào tù!',
    options: [
      {
        id: 'OPT-QN-05',
        text: 'Ngoại phạm của cô lúc 22:15 thì sao?',
        nextNodeId: 'DLG-QN-02',
      },
      {
        id: 'OPT-QN-06',
        text: 'Cô nghi ngờ ai trong số những người quanh ông ấy?',
        nextNodeId: 'DLG-QN-05',
      },
    ],
  },
  'DLG-QN-04': {
    id: 'DLG-QN-04',
    suspectId: 'SUSPECT-01',
    speaker: 'Quỳnh Nga',
    text: 'Tầng 2 cách khá xa hành lang cánh gà tầng trệt. Tuy nhiên khoảng 22:10, tôi có thấy Huy Hoàng bưng khay trà hoa cúc đi về hướng phòng làm việc của chồng tôi. Huy Hoàng là người duy nhất ông ấy cho phép pha trà riêng.',
    options: [
      {
        id: 'OPT-QN-07',
        text: 'Cảm ơn cô, thông tin này rất quan trọng.',
        isEnd: true,
      },
    ],
  },
  'DLG-QN-05': {
    id: 'DLG-QN-05',
    suspectId: 'SUSPECT-01',
    speaker: 'Quỳnh Nga',
    text: 'Hãy chú ý đến Huy Hoàng và Tuấn Kiệt. Tuấn Kiệt chiều nay bị Hoàng Long tát ngay trong phòng tập vì chuyện gì đó rất nghiêm trọng. Còn Huy Hoàng dạo gần đây luôn lấm lét nhìn vào két sắt tài liệu của chồng tôi.',
    options: [
      {
        id: 'OPT-QN-08',
        text: 'Chúng tôi sẽ làm rõ điều này ngay.',
        isEnd: true,
      },
    ],
  },

  // --- THẨM VẤN NGHỆ SĨ VĨ CẦM TUẤN KIỆT ---
  'DLG-TK-01': {
    id: 'DLG-TK-01',
    suspectId: 'SUSPECT-03',
    speaker: 'Tuấn Kiệt',
    text: 'Thầy Hoàng Long mất rồi sao...? Tôi thực sự bàng hoàng. Đêm nay là đêm diễn quan trọng nhất cuộc đời tôi...',
    options: [
      {
        id: 'OPT-TK-01',
        text: 'Anh đã ở đâu vào khoảng thời gian mấu chốt 22:15?',
        nextNodeId: 'DLG-TK-02',
      },
      {
        id: 'OPT-TK-02',
        text: 'Về bản thảo giao hưởng của cố nhạc sĩ Minh Triết, anh giải thích thế nào?',
        nextNodeId: 'DLG-TK-03',
      },
    ],
  },
  'DLG-TK-02': {
    id: 'DLG-TK-02',
    suspectId: 'SUSPECT-03',
    speaker: 'Tuấn Kiệt',
    text: 'Lúc 22:15, tôi đang đóng cửa phòng tập sau cánh gà để khởi động ngón tay với bản "Vũ Điệu Tử Thần". Mọi người ở hậu trường ai cũng nghe tiếng đàn của tôi réo rắt suốt từ 22:10 đến 22:20!',
    isQuestioningAlibi: true,
    options: [
      {
        id: 'OPT-TK-03',
        text: 'Nhưng dây đàn E (dây số 1) trên cây vĩ cầm của anh đã bị đứt từ 21:55 và chưa thay!',
        triggerContradiction: true,
        nextNodeId: 'DLG-TK-04',
      },
      {
        id: 'OPT-TK-04',
        text: 'Anh có gặp Nhạc trưởng trước giờ diễn không?',
        nextNodeId: 'DLG-TK-03',
      },
    ],
  },
  'DLG-TK-03': {
    id: 'DLG-TK-03',
    suspectId: 'SUSPECT-03',
    speaker: 'Tuấn Kiệt',
    text: 'Thầy Long... thầy ấy phát hiện ra tôi đã mượn một số giai điệu trong tập di cảo của bác Minh Triết. Thầy dọa sẽ hủy hoại sự nghiệp của tôi. Tôi vô cùng hoảng sợ và căm ghét sự nghiệt ngã của thầy, nhưng tôi không hề hạ độc!',
    options: [
      {
        id: 'OPT-TK-05',
        text: 'Vậy tiếng đàn lúc 22:15 thực chất là gì?',
        nextNodeId: 'DLG-TK-04',
      },
    ],
  },
  'DLG-TK-04': {
    id: 'DLG-TK-04',
    suspectId: 'SUSPECT-03',
    speaker: 'Tuấn Kiệt',
    text: 'Được rồi... tôi xin khai thật! Lúc 22:12 tôi đã bật loa Bluetooth trong phòng tập phát đoạn thu âm sẵn bản Danse Macabre để lén sang phòng thầy lục tìm tập hồ sơ tố cáo đạo nhạc. Nhưng khi tôi lách cửa bước vào lúc 22:22, thầy Long đã nằm bất động dưới đất, môi thâm tím! Tôi quá hoảng hốt nên bỏ chạy ngay lập tức. Lúc đó trên bàn chỉ còn tách trà vỡ!',
    options: [
      {
        id: 'OPT-TK-06',
        text: 'Anh có thấy ai khác ở gần hiện trường lúc đó không?',
        nextNodeId: 'DLG-TK-05',
      },
    ],
  },
  'DLG-TK-05': {
    id: 'DLG-TK-05',
    suspectId: 'SUSPECT-03',
    speaker: 'Tuấn Kiệt',
    text: 'Lúc tôi chạy từ phòng tập ra hành lang lúc 22:18, tôi thoáng thấy bóng áo vest của Huy Hoàng chạy thụt mạng xuống cầu thang thoát hiểm phía Tây với vẻ mặt cắt không còn giọt máu!',
    options: [
      {
        id: 'OPT-TK-07',
        text: 'Lời khai của anh đã được ghi nhận vào biên bản.',
        isEnd: true,
      },
    ],
  },

  // --- THẨM VẤN TRỢ LÝ HUY HOÀNG (THỦ PHẠM) ---
  'DLG-HH-01': {
    id: 'DLG-HH-01',
    suspectId: 'SUSPECT-02',
    speaker: 'Huy Hoàng',
    text: 'Thưa điều tra viên, tôi là người phát hiện ra thi thể thầy Long và bấm chuông báo động lúc 22:30. Thầy ấy như người cha thứ hai của tôi, sao các anh lại thẩm vấn tôi gay gắt như vậy?',
    options: [
      {
        id: 'OPT-HH-01',
        text: 'Anh hãy trình bày cụ thể lịch trình của mình vào mốc 22:15.',
        nextNodeId: 'DLG-HH-02',
      },
      {
        id: 'OPT-HH-02',
        text: 'Tại sao chiếc áo vest của anh lại đứt mất một cúc áo và rách vạt?',
        requiredEvidenceId: 'EVD-03',
        nextNodeId: 'DLG-HH-03',
      },
    ],
  },
  'DLG-HH-02': {
    id: 'DLG-HH-02',
    suspectId: 'SUSPECT-02',
    speaker: 'Huy Hoàng',
    text: 'Lúc 22:15, tôi đang ở phòng kỹ thuật âm thanh tầng 3 để gửi lệnh in bảng phân công diễn xuất. Khi tôi cầm xấp tài liệu đi ngang qua cửa phòng thầy Long đúng 22:15, tôi còn nghe rất rõ tiếng thầy đang to tiếng nói chuyện điện thoại với ai đó. Thầy lúc ấy vẫn còn sống khỏe mạnh!',
    isQuestioningAlibi: true,
    options: [
      {
        id: 'OPT-HH-03',
        text: 'Đưa ra bằng chứng: Nhật ký thẻ từ phòng âm thanh và Camera (EVD-04)',
        requiredEvidenceId: 'EVD-04',
        triggerContradiction: true,
        nextNodeId: 'DLG-HH-04',
      },
      {
        id: 'OPT-HH-04',
        text: 'Đưa ra bằng chứng: Nhật ký cuộc gọi điện thoại của Nhạc trưởng (EVD-06)',
        requiredEvidenceId: 'EVD-06',
        triggerContradiction: true,
        nextNodeId: 'DLG-HH-05',
      },
      {
        id: 'OPT-HH-05',
        text: 'Đưa ra bằng chứng: Đồng hồ vỡ kẹt kim lúc 22:15 (EVD-02)',
        requiredEvidenceId: 'EVD-02',
        triggerContradiction: true,
        nextNodeId: 'DLG-HH-06',
      },
    ],
  },
  'DLG-HH-03': {
    id: 'DLG-HH-03',
    suspectId: 'SUSPECT-02',
    speaker: 'Huy Hoàng',
    text: 'Cúc áo à...? À, chắc do lúc tôi hoảng loạn cùng bảo vệ khiêng thầy dậy lúc 22:30 nên bị vướng vào cạnh bàn làm việc thôi mà! Chuyện đó có gì lạ đâu?',
    options: [
      {
        id: 'OPT-HH-06',
        text: 'Nhưng mẩu vải và cúc áo nằm trong tay nạn nhân trước khi bảo vệ mở cửa phòng!',
        requiredEvidenceId: 'EVD-03',
        nextNodeId: 'DLG-HH-06',
      },
    ],
  },
  'DLG-HH-04': {
    id: 'DLG-HH-04',
    suspectId: 'SUSPECT-02',
    speaker: 'Huy Hoàng',
    text: 'Cái gì?! Thẻ từ không có dữ liệu quẹt...? Có thể... có thể do cửa mở sẵn chăng? Còn lệnh in... tôi gửi từ laptop mà...',
    options: [
      {
        id: 'OPT-HH-07',
        text: 'Camera thấy anh mang ấm trà vào phòng nạn nhân lúc 22:12 và lẻn ra lúc 22:17!',
        requiredEvidenceId: 'EVD-04',
        nextNodeId: 'DLG-HH-06',
      },
    ],
  },
  'DLG-HH-05': {
    id: 'DLG-HH-05',
    suspectId: 'SUSPECT-02',
    speaker: 'Huy Hoàng',
    text: 'Không có cuộc gọi nào lúc 22:15 ư?! Không thể nào... tôi rõ ràng nghe thấy... lẽ nào tôi nghe nhầm tiếng tivi...?',
    options: [
      {
        id: 'OPT-HH-08',
        text: 'Phòng nhạc trưởng không hề có tivi! Anh đã dựng chuyện để tạo ngoại phạm!',
        nextNodeId: 'DLG-HH-06',
      },
    ],
  },
  'DLG-HH-06': {
    id: 'DLG-HH-06',
    suspectId: 'SUSPECT-02',
    speaker: 'Huy Hoàng',
    text: 'Đủ rồi! Đừng ép tôi nữa! Đồng hồ vỡ lúc 22:15... cúc áo trong tay ông ấy... các người đã tìm thấy tập báo cáo kiểm toán trong thùng rác thoát hiểm rồi đúng không?!',
    options: [
      {
        id: 'OPT-HH-09',
        text: 'Chính anh đã bỏ Kali Xianua vào tách trà và giằng co với Hoàng Long lúc 22:15!',
        nextNodeId: 'DLG-HH-07',
      },
    ],
  },
  'DLG-HH-07': {
    id: 'DLG-HH-07',
    suspectId: 'SUSPECT-02',
    speaker: 'Huy Hoàng',
    text: 'Chính lão ta đã dồn tôi vào đường cùng! 6 năm tôi cung phụng lão như nô lệ, chỉ vì một sai lầm tài chính 3,2 tỷ mà lão đòi tống tôi vào tù ngay trong đêm nay! Lão uống ngụm trà lúc 22:13, rồi lão nhận ra vị lạ và lao vào bóp cổ tôi lúc 22:15... Đồng hồ lão đập vào chân bàn gãy vụn, lão giật đứt cúc áo tôi trước khi ngã gục... Tôi không còn đường lui nào khác!',
    options: [
      {
        id: 'OPT-HH-10',
        text: 'Huy Hoàng, anh chính thức bị bắt giữ vì tội Giết người có kế hoạch.',
        isEnd: true,
      },
    ],
  },
};

/**
 * Danh sách điểm tương tác (Hotspots) tại hiện trường vụ án
 */
export const mockHotspots: IHotspot[] = [
  {
    id: 'HOTSPOT-01',
    title: 'Thảm Vải Cạnh Bàn Trà',
    description: 'Nơi có nhiều mảnh vỡ tách trà sứ men ngọc vương vãi và vết nước trà sẫm màu thấm xuống thảm.',
    x: 42.5,
    y: 68.0,
    sceneId: 'SCENE-CONDUCTOR-OFFICE',
    evidenceId: 'EVD-01',
    discovered: true,
    hint: 'Kiểm tra cặn chất lỏng trong mảnh vỡ tách trà.',
  },
  {
    id: 'HOTSPOT-02',
    title: 'Góc Chân Bàn Làm Việc Gỗ Sồi',
    description: 'Một vật kim loại sáng loáng nằm khuất dưới gầm bàn trà, gần nơi thi thể ngã xuống.',
    x: 48.0,
    y: 72.5,
    sceneId: 'SCENE-CONDUCTOR-OFFICE',
    evidenceId: 'EVD-02',
    discovered: true,
    hint: 'Kiểm tra mặt số và kim của chiếc đồng hồ bị va đập.',
  },
  {
    id: 'HOTSPOT-03',
    title: 'Thi Thể Nhạc Trưởng Hoàng Long',
    description: 'Nạn nhân nằm sấp trên sàn nhà, bàn tay phải nắm chặt một vật gì đó trước khi ngừng thở.',
    x: 55.0,
    y: 65.0,
    sceneId: 'SCENE-CONDUCTOR-OFFICE',
    evidenceId: 'EVD-03',
    discovered: true,
    hint: 'Khám xét kỹ lòng bàn tay và trang phục của nạn nhân.',
  },
  {
    id: 'HOTSPOT-04',
    title: 'Phòng Máy Chủ & Giám Sát An Ninh',
    description: 'Hệ thống lưu trữ log quẹt thẻ từ ra vào các phòng chức năng và đầu ghi camera Nhà hát.',
    x: 18.0,
    y: 35.0,
    sceneId: 'SCENE-SECURITY-ROOM',
    evidenceId: 'EVD-04',
    discovered: false,
    hint: 'Đối chiếu thời gian quẹt thẻ phòng kỹ thuật lúc 22:15.',
  },
  {
    id: 'HOTSPOT-05',
    title: 'Thùng Rác Cầu Thang Thoát Hiểm Phía Tây',
    description: 'Khu vực cầu thang vắng người, thùng rác kim loại có dấu hiệu bị xáo trộn vội vã.',
    x: 82.0,
    y: 80.0,
    sceneId: 'SCENE-STAIRCASE-WEST',
    evidenceId: 'EVD-05',
    discovered: false,
    hint: 'Tìm kiếm các tài liệu bị xé rách vứt bỏ trong thùng rác.',
  },
  {
    id: 'HOTSPOT-06',
    title: 'Mặt Bàn Làm Việc Của Nhạc Trưởng',
    description: 'Bản thảo tổng phổ giao hưởng ngổn ngang và chiếc điện thoại thông minh màn hình đen.',
    x: 35.0,
    y: 45.0,
    sceneId: 'SCENE-CONDUCTOR-OFFICE',
    evidenceId: 'EVD-06',
    discovered: true,
    hint: 'Trích xuất lịch sử cuộc gọi và tin nhắn gần nhất của nạn nhân.',
  },
];

/**
 * Các nút trên bảng suy luận điều tra (Detective Mind Map Board)
 */
export const mockBoardNodes: IBoardNode[] = [
  {
    id: 'NODE-VICTIM',
    type: 'victim',
    title: 'Nhạc Trưởng Hoàng Long',
    description: 'Nạn nhân 52 tuổi, chết do ngộ độc Kali Xianua trong phòng làm việc riêng lúc 22:13 - 22:15.',
    x: 500,
    y: 100,
    referenceId: 'VICTIM-HOANG-LONG',
    pinned: true,
  },
  {
    id: 'NODE-SUSPECT-QN',
    type: 'suspect',
    title: 'Vợ - Ca Sĩ Quỳnh Nga',
    description: 'Động cơ: Bị tước quyền thừa kế và ép ly hôn. Ngoại phạm lúc 22:15 vững chắc có 2 nhân chứng.',
    x: 180,
    y: 250,
    referenceId: 'SUSPECT-01',
  },
  {
    id: 'NODE-SUSPECT-HH',
    type: 'suspect',
    title: 'Trợ Lý Huy Hoàng (Thủ Phạm)',
    description: 'Động cơ: Thâm hụt 3,2 tỷ quỹ. Lời khai ngoại phạm lúc 22:15 mâu thuẫn hoàn toàn với dữ liệu thực tế.',
    x: 500,
    y: 250,
    referenceId: 'SUSPECT-02',
    isContradiction: true,
  },
  {
    id: 'NODE-SUSPECT-TK',
    type: 'suspect',
    title: 'Violinist Tuấn Kiệt',
    description: 'Động cơ: Sợ bị vạch trần đạo nhạc. Phát loa tạo ngoại phạm giả nhưng chỉ đến trộm tài liệu lúc 22:22.',
    x: 820,
    y: 250,
    referenceId: 'SUSPECT-03',
  },
  {
    id: 'NODE-CRITICAL-TIME',
    type: 'timeline',
    title: 'Mốc Thời Gian Tử Thần: 22:15',
    description: 'Đồng hồ Patek dừng lúc 22:15 do xô xát. Huy Hoàng khai nghe điện thoại lúc 22:15 nhưng máy không hề có cuộc gọi.',
    x: 500,
    y: 420,
    isContradiction: true,
  },
  {
    id: 'NODE-EVD-TEA',
    type: 'evidence',
    title: 'Tách Trà Độc (EVD-01)',
    description: 'Chứa Kali Xianua nồng độ cao. Huy Hoàng là người mang vào lúc 22:12 theo camera ghi nhận.',
    x: 320,
    y: 560,
    referenceId: 'EVD-01',
  },
  {
    id: 'NODE-EVD-WATCH',
    type: 'evidence',
    title: 'Đồng Hồ Vỡ 22:15 (EVD-02)',
    description: 'Xác nhận chính xác thời điểm xảy ra xô xát và nạn nhân gục ngã là lúc 22:15.',
    x: 480,
    y: 560,
    referenceId: 'EVD-02',
  },
  {
    id: 'NODE-EVD-BUTTON',
    type: 'evidence',
    title: 'Cúc Áo & Mẩu Vải (EVD-03)',
    description: 'Kẹp trong tay nạn nhân, khớp với áo vest trợ lý rách của Huy Hoàng.',
    x: 650,
    y: 560,
    referenceId: 'EVD-03',
  },
  {
    id: 'NODE-EVD-LOGS',
    type: 'evidence',
    title: 'Thẻ Từ & Camera (EVD-04)',
    description: 'Bác bỏ việc Huy Hoàng ở phòng âm thanh lúc 22:15; camera bắt quả tang hành tung đáng ngờ.',
    x: 180,
    y: 420,
    referenceId: 'EVD-04',
  },
  {
    id: 'NODE-EVD-AUDIT',
    type: 'motive',
    title: 'Kiểm Toán 3,2 Tỷ (EVD-05)',
    description: 'Tài liệu bị xé trong thùng rác: Hoàng Long ra hạn chót 24h00 khiến Huy Hoàng nảy sinh sát tâm.',
    x: 820,
    y: 420,
    referenceId: 'EVD-05',
  },
  {
    id: 'NODE-EVD-PHONE',
    type: 'contradiction',
    title: 'Cước Gọi Rỗng (EVD-06)',
    description: 'Không có cuộc gọi nào sau 22:08. Khẳng định lời khai của Huy Hoàng lúc 22:15 là ngụy tạo.',
    x: 500,
    y: 690,
    referenceId: 'EVD-06',
    isContradiction: true,
  },
];

/**
 * Các đường nối liên kết suy luận (Connections)
 */
export const mockConnections: IConnection[] = [
  {
    id: 'CONN-01',
    fromNodeId: 'NODE-VICTIM',
    toNodeId: 'NODE-CRITICAL-TIME',
    label: 'Thời điểm ngã gục',
    type: 'timeline',
    description: 'Đồng hồ nạn nhân vỡ kẹt tại 22:15 chứng minh thời khắc xung đột dẫn tới tử vong.',
  },
  {
    id: 'CONN-02',
    fromNodeId: 'NODE-SUSPECT-HH',
    toNodeId: 'NODE-CRITICAL-TIME',
    label: 'Mâu thuẫn ngoại phạm 22:15',
    type: 'contradicts',
    description: 'Khai ở phòng kỹ thuật và nghe thấy tiếng nói chuyện điện thoại lúc 22:15, nhưng bị bác bỏ hoàn toàn.',
  },
  {
    id: 'CONN-03',
    fromNodeId: 'NODE-CRITICAL-TIME',
    toNodeId: 'NODE-EVD-PHONE',
    label: 'Bác bỏ cước gọi',
    type: 'contradicts',
    description: 'Điện thoại ngừng hoạt động từ 22:08, không thể có người nói chuyện lúc 22:15.',
  },
  {
    id: 'CONN-04',
    fromNodeId: 'NODE-CRITICAL-TIME',
    toNodeId: 'NODE-EVD-WATCH',
    label: 'Xác nhận cơ học',
    type: 'corroborates',
    description: 'Kim đồng hồ cơ Patek Philippe dừng đúng 22:15 do va đập với chân bàn.',
  },
  {
    id: 'CONN-05',
    fromNodeId: 'NODE-SUSPECT-HH',
    toNodeId: 'NODE-EVD-BUTTON',
    label: 'Dấu vết vật chứng',
    type: 'corroborates',
    description: 'Cúc áo trong tay Hoàng Long thuộc chiếc áo vest trợ lý của Huy Hoàng.',
  },
  {
    id: 'CONN-06',
    fromNodeId: 'NODE-SUSPECT-HH',
    toNodeId: 'NODE-EVD-TEA',
    label: 'Phương thức đầu độc',
    type: 'suspects',
    description: 'Huy Hoàng là người duy nhất pha trà cúc và mang vào phòng lúc 22:12.',
  },
  {
    id: 'CONN-07',
    fromNodeId: 'NODE-SUSPECT-HH',
    toNodeId: 'NODE-EVD-AUDIT',
    label: 'Động cơ sát hại',
    type: 'motive',
    description: 'Khoản thâm hụt 3,2 tỷ và tối hậu thư 24h00 của Hoàng Long.',
  },
  {
    id: 'CONN-08',
    fromNodeId: 'NODE-SUSPECT-HH',
    toNodeId: 'NODE-EVD-LOGS',
    label: 'Mâu thuẫn thẻ từ & Camera',
    type: 'contradicts',
    description: 'Không quẹt thẻ phòng âm thanh lúc 22:15, camera ghi nhận di chuyển ở cánh gà.',
  },
  {
    id: 'CONN-09',
    fromNodeId: 'NODE-SUSPECT-QN',
    toNodeId: 'NODE-CRITICAL-TIME',
    label: 'Ngoại phạm xác thực',
    type: 'corroborates',
    description: 'Được 2 nhân chứng xác nhận có mặt ở phòng phục trang từ 22:05 đến 22:25.',
  },
  {
    id: 'CONN-10',
    fromNodeId: 'NODE-SUSPECT-TK',
    toNodeId: 'NODE-VICTIM',
    label: 'Đến sau khi nạn nhân chết',
    type: 'corroborates',
    description: 'Tuấn Kiệt đến phòng trộm tài liệu lúc 22:22 khi nạn nhân đã chết ngạt từ trước.',
  },
];

/**
 * Phán quyết và Kết luận logic của Vụ án (IVerdict)
 */
export const mockVerdict: IVerdict = {
  caseId: 'CASE-001',
  culpritId: 'SUSPECT-02',
  culpritName: 'Huy Hoàng (Trợ lý riêng)',
  keyEvidenceIds: ['EVD-01', 'EVD-02', 'EVD-03', 'EVD-04', 'EVD-05', 'EVD-06'],
  timelineConflict: {
    criticalTime: '22:15',
    claimedAlibi:
      'Huy Hoàng khai lúc 22:15 đang ngồi trong phòng âm thanh tầng 3 in tài liệu và khi đi ngang qua cửa phòng lúc 22:15 vẫn nghe thấy Nhạc trưởng Hoàng Long đang to tiếng gọi điện thoại.',
    contradictoryEvidenceIds: ['EVD-02', 'EVD-04', 'EVD-06'],
    explanation:
      'Thứ nhất, nhật ký khóa thẻ từ phòng âm thanh tầng 3 hoàn toàn không có dữ liệu quẹt thẻ của Huy Hoàng trong khoảng 22:00 - 22:30; lệnh in thực chất được kích hoạt từ xa qua laptop. Thứ hai, bản ghi cước viễn thông chứng minh cuộc gọi cuối cùng của nạn nhân kết thúc từ lúc 22:08 và không có cuộc gọi nào sau đó. Thứ ba, chiếc đồng hồ Patek Philippe của nạn nhân bị vỡ nát dừng kim tại chính xác 22:15 trong lúc xô xát khi chất độc Kali Xianua phát tác; lúc 22:15 nạn nhân đã ngạt thở gục ngã và giật đứt cúc áo vest của Huy Hoàng, hoàn toàn không thể nói chuyện điện thoại.',
  },
  motive:
    'Biển thủ 3,2 tỷ đồng từ ngân sách lưu diễn châu Âu và quỹ tài trợ nhạc cụ của dàn nhạc. Hoàng Long đã phát hiện qua báo cáo kiểm toán độc lập vào chiều cùng ngày và ra tối hậu thư hạn chót 24:00 đêm nay phải nộp đơn tự thú nếu không sẽ trình báo công an khởi tố hình sự.',
  method:
    'Lợi dụng thói quen uống trà hoa cúc nóng trước giờ nghỉ của Nhạc trưởng, Huy Hoàng đã pha bột Kali Xianua nồng độ cực mạnh vào ấm trà và mang vào phòng lúc 22:12. Khi Hoàng Long uống và nhận thấy vị đắng chát khác thường, ông lao tới giữ lấy Huy Hoàng thì độc chất phát tác gây co giật. Hai bên giằng co lúc 22:15 làm vỡ đồng hồ và tách trà, nạn nhân giật đứt cúc áo của Huy Hoàng trước khi tử vong. Huy Hoàng nhanh chóng giật lấy túi hồ sơ kiểm toán tẩu thoát qua lối thoát hiểm, xé hủy tài liệu và bịa đặt bằng chứng ngoại phạm lúc 22:15.',
  fullDeduction:
    'Phân tích toàn diện 3 nghi phạm:\n' +
    '1. Vợ ca sĩ Quỳnh Nga: Có động cơ thừa kế và mâu thuẫn ly hôn, nhưng có bằng chứng ngoại phạm không thể bác bỏ lúc 22:15 được xác nhận bởi hai nhân chứng độc lập (thợ may Lan Anh và chuyên viên trang điểm Minh Châu) tại phòng thay đồ tầng 2 từ 22:05 đến 22:25.\n' +
    '2. Nghệ sĩ vĩ cầm Tuấn Kiệt: Có động cơ lo sợ bị vạch trần đạo nhạc và đã phát đoạn thu âm Danse Macabre qua loa Bluetooth để tạo ngoại phạm giả. Tuy nhiên, Tuấn Kiệt chỉ tiếp cận hiện trường lúc 22:22 để trộm tài liệu thì phát hiện nạn nhân đã tắt thở từ trước, hoảng sợ bỏ chạy mà chưa kịp hành động gì.\n' +
    '3. Trợ lý Huy Hoàng: Là kẻ duy nhất có cơ hội tiếp cận pha trà độc (EVD-01). Mảnh vải len navy và cúc áo kim loại mạ vàng kẹp chặt trong tay nạn nhân (EVD-03) khớp chính xác với chiếc áo vest rách vạt của Huy Hoàng. Hồ sơ kiểm toán 3,2 tỷ bị xé (EVD-05) làm sáng tỏ động cơ diệt khẩu cấp bách. Mấu chốt đập tan toàn bộ kế hoạch của Huy Hoàng là mâu thuẫn thời gian lúc 22:15: lời khai nghe điện thoại lúc 22:15 bị lịch sử viễn thông (EVD-06) và đồng hồ cơ dừng ở 22:15 (EVD-02) bóc trần sự thật rằng nạn nhân đã bị sát hại chính tại thời điểm đó bởi chính Huy Hoàng.',
  conclusion:
    'Hung thủ thực sự sát hại Nhạc trưởng Hoàng Long là Trợ lý Huy Hoàng. Tội danh: Giết người có toan tính và Biển thủ công quỹ.',
};

/**
 * Toàn bộ dữ liệu hồ sơ Vụ án 'Bản Giao Hưởng Đoạt Mệnh'
 */
export const mockCase: ICase = {
  id: 'CASE-001',
  title: 'Bản Giao Hưởng Đoạt Mệnh',
  subtitle: 'Cái chết bí ẩn sau cánh gà đêm hòa nhạc mùa đông',
  synopsis:
    'Đúng vào đêm công diễn bản giao hưởng định mệnh tại Nhà hát Lớn, Nhạc trưởng lừng danh Hoàng Long được phát hiện tử vong tức tưởi trong phòng làm việc riêng với một tách trà hoa cúc vỡ vụn nhiễm Kali Xianua. Ba nhân vật thân cận nhất đều có động cơ đen tối, nhưng một mâu thuẫn thời gian chết người vào lúc 22:15 đã phơi bày chân dung kẻ thủ ác.',
  difficulty: 'Khó',
  victim: {
    name: 'Hoàng Long',
    age: 52,
    role: 'Nhạc trưởng Tổng chỉ huy Dàn nhạc Giao hưởng Hoàng Gia',
    causeOfDeath: 'Ngộ độc cấp tính Kali Xianua (KCN) gây ngừng hô hấp và trụy tim mạch',
    estimatedTimeOfDeath: '22:13 - 22:15',
    location: 'Phòng làm việc riêng phía sau sân khấu Nhà hát Lớn',
    description:
      'Huyền thoại âm nhạc tài hoa nhưng tính cách vô cùng độc đoán, cầu toàn và nghiệt ngã với những người xung quanh. Ông đang nắm giữ những bí mật có thể hủy hoại cuộc đời của cả ba nghi phạm.',
  },
  suspects: mockSuspects,
  evidence: mockEvidences,
  dialogues: mockDialogues,
  hotspots: mockHotspots,
  boardNodes: mockBoardNodes,
  connections: mockConnections,
  verdict: mockVerdict,
};

export default mockCase;
