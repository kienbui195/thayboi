import type { ChartKind } from "@/lib/types";

/** Ba môn: đường dẫn công khai, đường dẫn lá số, nội dung giới thiệu cho trang SEO. */
export const MON = [
  {
    kind: "tu_vi" as ChartKind,
    slug: "tu-vi",
    name: "Tử vi",
    short: "Lá số 12 cung, 14 chính tinh theo giờ, ngày, tháng, năm sinh âm lịch.",
    title: "Xem tử vi trọn đời — lập lá số 12 cung miễn phí",
    description:
      "Lập lá số tử vi đẩu số từ ngày giờ sinh dương lịch: 12 cung, 14 chính tinh, cục, mệnh chủ, đại vận. Lưu lại để xem lại bất cứ lúc nào.",
    intro: [
      "Tử vi đẩu số là môn dự đoán của phương Đông, dựa trên giờ, ngày, tháng, năm sinh theo âm lịch. Từ bốn thông tin đó, lá số được chia thành 12 cung: Mệnh, Phụ Mẫu, Phúc Đức, Điền Trạch, Quan Lộc, Nô Bộc, Thiên Di, Tật Ách, Tài Bạch, Tử Nữ, Phu Thê, Huynh Đệ.",
      "Mỗi cung có các sao đóng. Quan trọng nhất là 14 chính tinh như Tử Vi, Thiên Phủ, Thái Dương, Thái Âm. Vị trí và độ sáng của sao (miếu, vượng, đắc, bình, hãm) cho biết điểm mạnh, điểm yếu của từng mặt cuộc sống.",
      "Thầy Bói tự đổi ngày dương sang âm lịch và quy giờ sinh về đúng múi giờ lúc bạn sinh, nên bạn chỉ cần nhập ngày giờ như trong giấy khai sinh.",
    ],
    sees: ["Cung Mệnh, cung Thân và mệnh chủ", "Ngũ hành cục", "14 chính tinh và độ sáng trong từng cung", "Đại vận 10 năm của mỗi cung"],
  },
  {
    kind: "than_so_hoc" as ChartKind,
    slug: "than-so-hoc",
    name: "Thần số học",
    short: "Số chủ đạo, số sứ mệnh, số linh hồn tính từ tên và ngày sinh.",
    title: "Thần số học — tính số chủ đạo từ tên và ngày sinh",
    description:
      "Tính số chủ đạo, số sứ mệnh, số linh hồn, số nhân cách và năm cá nhân theo thần số học Pythagoras. Hỗ trợ tên tiếng Việt có dấu.",
    intro: [
      "Thần số học Pythagoras gắn mỗi con số từ 1 đến 9 với một nhóm tính cách. Các số 11, 22, 33 là số Master, được giữ nguyên chứ không cộng tiếp.",
      "Số chủ đạo lấy từ tổng các chữ số của ngày sinh. Số sứ mệnh, số linh hồn và số nhân cách lấy từ họ tên: mỗi chữ cái ứng với một con số.",
      "Tên tiếng Việt được bỏ dấu trước khi tính (Đ thành D, Ư thành U), đúng cách các sách thần số học vẫn làm.",
    ],
    sees: ["Số chủ đạo (đường đời)", "Số sứ mệnh, số linh hồn, số nhân cách", "Số ngày sinh", "Năm cá nhân của năm nay"],
  },
  {
    kind: "chiem_tinh" as ChartKind,
    slug: "chiem-tinh",
    name: "Chiêm tinh",
    short: "Bản đồ sao: vị trí 10 thiên thể, cung Mọc và 12 nhà lúc bạn sinh.",
    title: "Bản đồ sao chiêm tinh — cung Mặt Trời, Mặt Trăng, cung Mọc",
    description:
      "Xem bản đồ sao cá nhân: cung hoàng đạo của Mặt Trời, Mặt Trăng, 8 hành tinh, cung Mọc và 12 nhà Placidus, tính theo giờ và nơi sinh của bạn.",
    intro: [
      "Chiêm tinh phương Tây đọc vị trí các thiên thể trên 12 cung hoàng đạo vào đúng khoảnh khắc bạn chào đời. Mặt Trời cho biết con người cốt lõi, Mặt Trăng là cảm xúc, còn cung Mọc là ấn tượng bạn để lại cho người khác.",
      "Để biết cung Mọc và 12 nhà, cần giờ sinh chính xác và tọa độ nơi sinh. Thầy Bói tự tra tọa độ và múi giờ khi bạn chọn nơi sinh, rồi tính nhà theo hệ Placidus.",
      "Không nhớ giờ sinh? Vẫn xem được vị trí các hành tinh, chỉ thiếu cung Mọc và các nhà.",
    ],
    sees: ["Cung của Mặt Trời, Mặt Trăng và 8 hành tinh", "Hành tinh nào đang nghịch hành", "Cung Mọc và Thiên Đỉnh (MC)", "12 nhà Placidus"],
  },
] as const;

export type Mon = (typeof MON)[number];
export const monBySlug = (slug: string) => MON.find((m) => m.slug === slug);
