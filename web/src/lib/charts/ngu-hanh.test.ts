import { describe, expect, it } from "vitest";
import { cucHanh, menhCucRelation, napAm, starHanh } from "./ngu-hanh";

describe("ngũ hành", () => {
  it("nạp âm bản mệnh", () => {
    expect(napAm("Giáp Tý")).toEqual({ name: "Hải Trung Kim", hanh: "kim" });
    expect(napAm("Ất Hợi")).toEqual({ name: "Sơn Đầu Hỏa", hanh: "hoa" });
    expect(napAm("Canh Ngọ")).toEqual({ name: "Lộ Bàng Thổ", hanh: "tho" });
    expect(napAm("Canh Tuất")).toEqual({ name: "Thoa Xuyến Kim", hanh: "kim" });
    expect(napAm("Quý Hợi")).toEqual({ name: "Đại Hải Thủy", hanh: "thuy" });
    expect(napAm("Giáp Sửu")).toBeNull(); // can dương không đi với chi âm
  });

  it("hành của cục và quan hệ sinh khắc", () => {
    expect(cucHanh("Kim Tứ Cục")).toBe("kim");
    expect(cucHanh("Hỏa Lục Cục")).toBe("hoa");
    expect(menhCucRelation("hoa", "kim").text).toBe("Mệnh khắc Cục");
    expect(menhCucRelation("kim", "hoa").text).toBe("Cục khắc Mệnh");
    expect(menhCucRelation("kim", "tho").text).toBe("Cục sinh Mệnh");
    expect(menhCucRelation("tho", "kim").text).toBe("Mệnh sinh Cục");
  });

  it("đủ hành cho 14 chính tinh và 14 phụ tinh", () => {
    const names = [
      "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh", "Thiên Phủ", "Thái Âm", "Tham Lang",
      "Cự Môn", "Thiên Tướng", "Thiên Lương", "Thất Sát", "Phá Quân", "Tả Phù", "Hữu Bật", "Văn Xương", "Văn Khúc",
      "Thiên Khôi", "Thiên Việt", "Lộc Tồn", "Thiên Mã", "Kình Dương", "Đà La", "Hỏa Tinh", "Linh Tinh", "Địa Không", "Địa Kiếp",
    ];
    expect(names.filter((n) => !starHanh(n))).toEqual([]);
  });
});
