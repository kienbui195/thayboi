// Lời giải nghĩa ngắn (Q4). Viết gọn, mang tính tham khảo; bản sau mở rộng thành thư viện ý nghĩa công khai.

export const NUMBER_MEANINGS: Record<number, { title: string; text: string }> = {
  1: { title: "Người khởi xướng", text: "Độc lập, quyết đoán, thích tự mở đường. Cần học cách lắng nghe và làm việc cùng người khác." },
  2: { title: "Người kết nối", text: "Tinh tế, giỏi hòa giải, sống tình cảm. Dễ bị ảnh hưởng bởi cảm xúc của người xung quanh." },
  3: { title: "Người truyền cảm hứng", text: "Vui vẻ, sáng tạo, nói chuyện có duyên. Cần giữ tập trung để không bỏ dở việc giữa chừng." },
  4: { title: "Người xây nền", text: "Chăm chỉ, kỷ luật, đáng tin. Hợp với việc cần kiên nhẫn; đôi khi hơi cứng nhắc." },
  5: { title: "Người tự do", text: "Thích trải nghiệm, linh hoạt, nhanh thích nghi. Cần tránh cả thèm chóng chán." },
  6: { title: "Người chăm sóc", text: "Trách nhiệm, yêu gia đình, hay lo cho người khác. Nhớ chăm sóc cả chính mình." },
  7: { title: "Người tìm hiểu", text: "Sâu sắc, thích phân tích, cần thời gian ở một mình. Hợp nghiên cứu, học thuật." },
  8: { title: "Người làm chủ", text: "Có tham vọng, giỏi quản lý tiền và việc. Cần cân bằng giữa thành công và các mối quan hệ." },
  9: { title: "Người bao dung", text: "Nhân hậu, rộng lượng, muốn giúp đời. Cần học cách buông bỏ chuyện cũ." },
  11: { title: "Số Master 11 — trực giác", text: "Nhạy cảm, giàu trực giác, có sức truyền cảm hứng lớn. Áp lực nội tâm cũng lớn hơn số 2 thường." },
  22: { title: "Số Master 22 — kiến tạo", text: "Có khả năng biến ý tưởng lớn thành việc thật. Dễ tự đặt kỳ vọng quá cao cho bản thân." },
  33: { title: "Số Master 33 — chữa lành", text: "Yêu thương vô điều kiện, muốn nâng đỡ người khác. Cần giữ ranh giới để không kiệt sức." },
};

export const SIGN_MEANINGS: string[] = [
  "Bạch Dương: nhiệt huyết, thẳng thắn, thích đi đầu; đôi khi nóng vội.",
  "Kim Ngưu: điềm tĩnh, thực tế, thích sự ổn định và cái đẹp; khá cố chấp.",
  "Song Tử: nhanh nhạy, tò mò, giỏi giao tiếp; dễ thay đổi ý.",
  "Cự Giải: giàu tình cảm, gắn bó gia đình, che chở người thân; dễ tổn thương.",
  "Sư Tử: tự tin, hào phóng, thích được ghi nhận; cần tránh tự cao.",
  "Xử Nữ: tỉ mỉ, chu đáo, thích làm cho đúng; hay khắt khe với bản thân.",
  "Thiên Bình: hòa nhã, công bằng, coi trọng các mối quan hệ; khó ra quyết định.",
  "Bọ Cạp: sâu sắc, quyết liệt, trung thành; khó buông bỏ.",
  "Nhân Mã: lạc quan, thích khám phá, yêu tự do; đôi khi thiếu kiên nhẫn.",
  "Ma Kết: kỷ luật, có trách nhiệm, nhắm mục tiêu dài hạn; hơi khép kín.",
  "Bảo Bình: độc lập, nhiều ý tưởng mới, quan tâm cộng đồng; có lúc xa cách.",
  "Song Ngư: mơ mộng, giàu lòng trắc ẩn, nhạy cảm; dễ trốn tránh thực tế.",
];

/** Vai trò của Mặt Trời, Mặt Trăng, cung Mọc khi đọc lá số. */
export const BIG_THREE = {
  sun: "Mặt Trời — con người cốt lõi, điều bạn hướng tới.",
  moon: "Mặt Trăng — cảm xúc, nhu cầu bên trong.",
  asc: "Cung Mọc — ấn tượng đầu tiên, cách bạn bước ra thế giới.",
};

export const MAJOR_STAR_MEANINGS: Record<string, string> = {
  "Tử Vi": "Đế tinh, chủ về quyền quý, khả năng lãnh đạo, tự trọng cao.",
  "Thiên Cơ": "Mưu trí, linh hoạt, giỏi tính toán, hay suy nghĩ nhiều.",
  "Thái Dương": "Sáng sủa, hào phóng, thích giúp người, coi trọng danh dự.",
  "Vũ Khúc": "Tài tinh, cương nghị, giỏi tiền bạc, quyết đoán.",
  "Thiên Đồng": "Phúc tinh, hiền hòa, thích an nhàn, dễ hài lòng.",
  "Liêm Trinh": "Cá tính mạnh, nguyên tắc, có thể vừa thẳng thắn vừa nóng nảy.",
  "Thiên Phủ": "Kho trời, ổn định, biết giữ của, điềm đạm.",
  "Thái Âm": "Dịu dàng, tinh tế, chủ về điền sản, tình cảm sâu.",
  "Tham Lang": "Đa tài, ham hiểu biết, giỏi giao tiếp, nhiều ham muốn.",
  "Cự Môn": "Ăn nói sắc sảo, hay hoài nghi, dễ gặp thị phi lời nói.",
  "Thiên Tướng": "Ấn tinh, chính trực, thích giúp đỡ, coi trọng hình thức.",
  "Thiên Lương": "Ấm tinh, nhân hậu, che chở người khác, thích đạo lý.",
  "Thất Sát": "Tướng tinh, dũng cảm, quyết liệt, đời nhiều biến động.",
  "Phá Quân": "Tiên phong phá cũ lập mới, mạnh mẽ, khó đoán.",
};
