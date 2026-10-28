import { describe, expect, it } from 'vitest';
import { parseKhoa } from './khoa.js';

describe('khóa luận giải', () => {
  it('suy ra môn và loại, chuẩn hóa khoảng trắng', () => {
    expect(parseKhoa(' sao-cung : Tử Vi |  Mệnh ')).toEqual({ khoa: 'sao-cung:Tử Vi|Mệnh', loai: 'sao-cung', mon: 'tu_vi' });
    expect(parseKhoa('so:11')).toEqual({ khoa: 'so:11', loai: 'so', mon: 'than_so_hoc' });
    expect(parseKhoa('hanh-tinh:Mặt Trăng|Song Tử')).toMatchObject({ mon: 'chiem_tinh' });
  });

  it('báo lỗi dễ hiểu khi sai khuôn', () => {
    expect(parseKhoa('Tử Vi')).toHaveProperty('error');
    expect(parseKhoa('sao-cung:Tử Vi')).toHaveProperty('error');
    expect(parseKhoa('so:1|2')).toHaveProperty('error');
    expect(parseKhoa('so:')).toHaveProperty('error');
  });
});
