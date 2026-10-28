// Ngũ hành cho lá số tử vi: hành của sao, của địa chi, nạp âm bản mệnh, quan hệ sinh khắc.
// Chỉ dùng để hiển thị, không đổi dữ liệu lá số đã lưu nên không cần tăng CALC_VERSION.

export type Hanh = "kim" | "moc" | "thuy" | "hoa" | "tho";

export const HANH_NAME: Record<Hanh, string> = { kim: "Kim", moc: "Mộc", thuy: "Thủy", hoa: "Hỏa", tho: "Thổ" };

const BY_NAME: Record<string, Hanh> = { Kim: "kim", Mộc: "moc", Thủy: "thuy", Hỏa: "hoa", Thổ: "tho" };

/**
 * Hành của sao theo sách tử vi Việt phổ biến. iztro có sẵn trường này nhưng thiếu (vd. Thái Dương để trống)
 * và không có cho phần lớn sao nhỏ. Vài sao nhỏ mỗi trường phái xếp một khác; sao không có trong bảng thì không tô màu.
 */
const STAR_HANH: Record<string, Hanh> = {
  // 14 chính tinh
  "Tử Vi": "tho", "Thiên Cơ": "moc", "Thái Dương": "hoa", "Vũ Khúc": "kim", "Thiên Đồng": "thuy",
  "Liêm Trinh": "hoa", "Thiên Phủ": "tho", "Thái Âm": "thuy", "Tham Lang": "thuy", "Cự Môn": "thuy",
  "Thiên Tướng": "thuy", "Thiên Lương": "moc", "Thất Sát": "kim", "Phá Quân": "thuy",
  // phụ tinh
  "Tả Phù": "tho", "Hữu Bật": "thuy", "Văn Xương": "kim", "Văn Khúc": "thuy", "Thiên Khôi": "hoa",
  "Thiên Việt": "hoa", "Lộc Tồn": "tho", "Thiên Mã": "hoa", "Kình Dương": "kim", "Đà La": "kim",
  "Hỏa Tinh": "hoa", "Linh Tinh": "hoa", "Địa Không": "hoa", "Địa Kiếp": "hoa",
  // sao nhỏ
  "Hồng Loan": "thuy", "Thiên Hỷ": "thuy", "Thiên Diêu": "thuy", "Hàm Trì": "thuy", "Long Trì": "thuy",
  "Thiên Hư": "thuy", "Thiên Sứ": "thuy", "Âm Sát": "thuy",
  "Thiên Hình": "hoa", "Thiên Quan": "hoa", "Thiên Đức": "hoa", "Nguyệt Đức": "hoa", "Thiên Nguyệt": "hoa",
  "Phi Liêm": "hoa", "Phá Toái": "hoa", "Thiên Không": "hoa", "Tuần Không": "hoa", "Không Vong": "hoa",
  "Thiên Khốc": "kim", "Hoa Cái": "kim", "Đài Phụ": "kim", "Triệt Lộ": "kim",
  "Ân Quang": "moc", "Giải Thần": "moc", "Niên Giải": "moc", "Bát Tọa": "moc",
  "Phong Cáo": "tho", "Phụng Các": "tho", "Thiên Quý": "tho", "Thiên Phúc": "tho", "Thiên Tài": "tho",
  "Thiên Thọ": "tho", "Thiên Trù": "tho", "Thiên Thương": "tho", "Thiên Vu": "tho", "Tam Thai": "tho",
  "Cô Thần": "tho", "Quả Tú": "tho",
};

export const starHanh = (name: string): Hanh | undefined => STAR_HANH[name];

const BRANCHES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const STEMS = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];

const BRANCH_HANH: Record<string, Hanh> = {
  Dần: "moc", Mão: "moc", Tỵ: "hoa", Ngọ: "hoa", Thân: "kim", Dậu: "kim",
  Hợi: "thuy", Tý: "thuy", Thìn: "tho", Tuất: "tho", Sửu: "tho", Mùi: "tho",
};

export const branchHanh = (branch: string): Hanh | undefined => BRANCH_HANH[branch];

// 30 nạp âm, mỗi cái ứng với 2 năm liên tiếp trong vòng 60 Hoa Giáp (Giáp Tý, Ất Sửu → Hải Trung Kim …)
const NAP_AM = [
  "Hải Trung Kim", "Lô Trung Hỏa", "Đại Lâm Mộc", "Lộ Bàng Thổ", "Kiếm Phong Kim", "Sơn Đầu Hỏa",
  "Giản Hạ Thủy", "Thành Đầu Thổ", "Bạch Lạp Kim", "Dương Liễu Mộc", "Tuyền Trung Thủy", "Ốc Thượng Thổ",
  "Tích Lịch Hỏa", "Tùng Bách Mộc", "Trường Lưu Thủy", "Sa Trung Kim", "Sơn Hạ Hỏa", "Bình Địa Mộc",
  "Bích Thượng Thổ", "Kim Bạch Kim", "Phú Đăng Hỏa", "Thiên Hà Thủy", "Đại Trạch Thổ", "Thoa Xuyến Kim",
  "Tang Đố Mộc", "Đại Khê Thủy", "Sa Trung Thổ", "Thiên Thượng Hỏa", "Thạch Lựu Mộc", "Đại Hải Thủy",
];

/** Nạp âm bản mệnh từ can chi năm, vd. "Ất Hợi" → Sơn Đầu Hỏa. */
export function napAm(canChi: string): { name: string; hanh: Hanh } | null {
  const [stem, branch] = canChi.trim().split(/\s+/);
  const s = STEMS.indexOf(stem);
  const b = BRANCHES.indexOf(branch);
  if (s < 0 || b < 0 || s % 2 !== b % 2) return null;
  // vị trí trong vòng 60: số k thỏa k mod 10 = s và k mod 12 = b
  const k = Array.from({ length: 60 }, (_, i) => i).find((i) => i % 10 === s && i % 12 === b)!;
  const name = NAP_AM[Math.floor(k / 2)];
  return { name, hanh: BY_NAME[name.split(" ").pop()!] };
}

/** Hành của cục, vd. "Kim Tứ Cục" → kim. */
export const cucHanh = (fiveElementsClass: string): Hanh | undefined => BY_NAME[fiveElementsClass.split(" ")[0]];

const SINH: Record<Hanh, Hanh> = { moc: "hoa", hoa: "tho", tho: "kim", kim: "thuy", thuy: "moc" };
const KHAC: Record<Hanh, Hanh> = { moc: "tho", tho: "thuy", thuy: "hoa", hoa: "kim", kim: "moc" };

/** Quan hệ giữa bản mệnh và cục; cục sinh mệnh là tốt nhất, cục khắc mệnh là xấu nhất. */
export function menhCucRelation(menh: Hanh, cuc: Hanh): { text: string; tone: "good" | "neutral" | "bad" } {
  if (menh === cuc) return { text: "Mệnh và Cục đồng hành", tone: "good" };
  if (SINH[cuc] === menh) return { text: "Cục sinh Mệnh", tone: "good" };
  if (SINH[menh] === cuc) return { text: "Mệnh sinh Cục", tone: "neutral" };
  if (KHAC[menh] === cuc) return { text: "Mệnh khắc Cục", tone: "neutral" };
  return { text: "Cục khắc Mệnh", tone: "bad" };
}
