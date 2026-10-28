// Lời giải nghĩa ban đầu (Q4), nạp một lần khi bảng luan_giai còn trống. Sau đó sửa trên dashboard.

const NUMBERS: Record<number, [string, string]> = {
  1: ['Người khởi xướng', 'Độc lập, quyết đoán, thích tự mở đường. Cần học cách lắng nghe và làm việc cùng người khác.'],
  2: ['Người kết nối', 'Tinh tế, giỏi hòa giải, sống tình cảm. Dễ bị ảnh hưởng bởi cảm xúc của người xung quanh.'],
  3: ['Người truyền cảm hứng', 'Vui vẻ, sáng tạo, nói chuyện có duyên. Cần giữ tập trung để không bỏ dở việc giữa chừng.'],
  4: ['Người xây nền', 'Chăm chỉ, kỷ luật, đáng tin. Hợp với việc cần kiên nhẫn; đôi khi hơi cứng nhắc.'],
  5: ['Người tự do', 'Thích trải nghiệm, linh hoạt, nhanh thích nghi. Cần tránh cả thèm chóng chán.'],
  6: ['Người chăm sóc', 'Trách nhiệm, yêu gia đình, hay lo cho người khác. Nhớ chăm sóc cả chính mình.'],
  7: ['Người tìm hiểu', 'Sâu sắc, thích phân tích, cần thời gian ở một mình. Hợp nghiên cứu, học thuật.'],
  8: ['Người làm chủ', 'Có tham vọng, giỏi quản lý tiền và việc. Cần cân bằng giữa thành công và các mối quan hệ.'],
  9: ['Người bao dung', 'Nhân hậu, rộng lượng, muốn giúp đời. Cần học cách buông bỏ chuyện cũ.'],
  11: ['Số Master 11 — trực giác', 'Nhạy cảm, giàu trực giác, có sức truyền cảm hứng lớn. Áp lực nội tâm cũng lớn hơn số 2 thường.'],
  22: ['Số Master 22 — kiến tạo', 'Có khả năng biến ý tưởng lớn thành việc thật. Dễ tự đặt kỳ vọng quá cao cho bản thân.'],
  33: ['Số Master 33 — chữa lành', 'Yêu thương vô điều kiện, muốn nâng đỡ người khác. Cần giữ ranh giới để không kiệt sức.'],
};

const SIGNS: Record<string, string> = {
  'Bạch Dương': 'Nhiệt huyết, thẳng thắn, thích đi đầu; đôi khi nóng vội.',
  'Kim Ngưu': 'Điềm tĩnh, thực tế, thích sự ổn định và cái đẹp; khá cố chấp.',
  'Song Tử': 'Nhanh nhạy, tò mò, giỏi giao tiếp; dễ thay đổi ý.',
  'Cự Giải': 'Giàu tình cảm, gắn bó gia đình, che chở người thân; dễ tổn thương.',
  'Sư Tử': 'Tự tin, hào phóng, thích được ghi nhận; cần tránh tự cao.',
  'Xử Nữ': 'Tỉ mỉ, chu đáo, thích làm cho đúng; hay khắt khe với bản thân.',
  'Thiên Bình': 'Hòa nhã, công bằng, coi trọng các mối quan hệ; khó ra quyết định.',
  'Bọ Cạp': 'Sâu sắc, quyết liệt, trung thành; khó buông bỏ.',
  'Nhân Mã': 'Lạc quan, thích khám phá, yêu tự do; đôi khi thiếu kiên nhẫn.',
  'Ma Kết': 'Kỷ luật, có trách nhiệm, nhắm mục tiêu dài hạn; hơi khép kín.',
  'Bảo Bình': 'Độc lập, nhiều ý tưởng mới, quan tâm cộng đồng; có lúc xa cách.',
  'Song Ngư': 'Mơ mộng, giàu lòng trắc ẩn, nhạy cảm; dễ trốn tránh thực tế.',
};

const MAJOR_STARS: Record<string, string> = {
  'Tử Vi': 'Đế tinh, chủ về quyền quý, khả năng lãnh đạo, tự trọng cao.',
  'Thiên Cơ': 'Mưu trí, linh hoạt, giỏi tính toán, hay suy nghĩ nhiều.',
  'Thái Dương': 'Sáng sủa, hào phóng, thích giúp người, coi trọng danh dự.',
  'Vũ Khúc': 'Tài tinh, cương nghị, giỏi tiền bạc, quyết đoán.',
  'Thiên Đồng': 'Phúc tinh, hiền hòa, thích an nhàn, dễ hài lòng.',
  'Liêm Trinh': 'Cá tính mạnh, nguyên tắc, có thể vừa thẳng thắn vừa nóng nảy.',
  'Thiên Phủ': 'Kho trời, ổn định, biết giữ của, điềm đạm.',
  'Thái Âm': 'Dịu dàng, tinh tế, chủ về điền sản, tình cảm sâu.',
  'Tham Lang': 'Đa tài, ham hiểu biết, giỏi giao tiếp, nhiều ham muốn.',
  'Cự Môn': 'Ăn nói sắc sảo, hay hoài nghi, dễ gặp thị phi lời nói.',
  'Thiên Tướng': 'Ấn tinh, chính trực, thích giúp đỡ, coi trọng hình thức.',
  'Thiên Lương': 'Ấm tinh, nhân hậu, che chở người khác, thích đạo lý.',
  'Thất Sát': 'Tướng tinh, dũng cảm, quyết liệt, đời nhiều biến động.',
  'Phá Quân': 'Tiên phong phá cũ lập mới, mạnh mẽ, khó đoán.',
};

export const SEED_LUAN_GIAI: { khoa: string; tieuDe: string | null; noiDung: string }[] = [
  ...Object.entries(NUMBERS).map(([n, [t, c]]) => ({ khoa: `so:${n}`, tieuDe: t, noiDung: c })),
  ...Object.entries(SIGNS).map(([s, c]) => ({ khoa: `cung:${s}`, tieuDe: s, noiDung: c })),
  ...Object.entries(MAJOR_STARS).map(([s, c]) => ({ khoa: `sao:${s}`, tieuDe: s, noiDung: c })),
];
