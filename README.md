# Thầy Bói

Web app xem tử vi, thần số học, chiêm tinh. Tài liệu nghiệp vụ và thiết kế nằm ngoài repo, ở `~/Documents/MyDocs/Games/thayboi/`.

| Thư mục | Là gì |
|---|---|
| `web/` | Next.js 16 + shadcn/ui: giao diện, trang công khai cho SEO. Không đọc DB, mọi dữ liệu qua API |
| `api/` | NestJS + Prisma + MySQL: đăng nhập, hồ sơ, tính và lưu lá số, luận giải, `/admin-api` cho dashboard |
| `dev/` | MySQL chạy thử ở laptop |
| `deploy/` | Mẫu cấu hình Caddy trên VPS |
| `compose.yaml` | Chạy cả hai trên VPS |

## Chạy trên máy

```bash
docker compose -f dev/compose.yaml up -d          # MySQL ở 127.0.0.1:33063
cd api && npm install && npx prisma migrate deploy && npm run start:dev   # API ở :3000 mặc định, đặt PORT=3001
cd web && npm install && npm run dev               # http://localhost:3000, chuyển /api/* sang API_URL (mặc định :3001)
```

Test: `cd api && npm test && npm run test:e2e` (e2e dùng database `thayboi_test`), `cd web && npm test`.

## Deploy (VPS chung với WordDefender)

`git push` rồi trên laptop chạy `vps release thayboi`. Domain `https://thayboi.baodom.xyz` đi qua Cloudflare Tunnel → Caddy (`deploy/thayboi.caddy`): `/api/*` vào `thayboi-api` (cổng 3105), còn lại vào `thayboi-web` (cổng 3106). Dashboard quản trị: `https://admin.baodom.xyz`, game "Thầy Bói".

## Luận giải

Lời luận giải nằm trong bảng `luan_giai`, sửa trên dashboard (mục "Luận giải"). Khóa dạng `<loại>:<giá trị>`:

| Khóa | Hiện ở |
|---|---|
| `so:11` | Thần số học, mọi ô có số 11 |
| `cung:Bạch Dương` | Chiêm tinh, thẻ Mặt Trời / Mặt Trăng / cung Mọc rơi vào cung đó |
| `hanh-tinh:Mặt Trăng\|Song Tử` | Chiêm tinh, cột "Luận giải" của bảng thiên thể |
| `sao:Tử Vi` | Tử vi, chính tinh ở bất kỳ cung nào (khi chưa có dòng riêng cho cung) |
| `sao-cung:Tử Vi\|Mệnh` | Tử vi, sao đó đóng ở cung đó (ưu tiên hơn `sao:`) |

## Lưu ý khi sửa cách tính

Sửa gì trong `api/src/charts/` làm kết quả lá số thay đổi thì **tăng số trong `CALC_VERSION`** của môn đó (`api/src/charts/index.ts`). Lá số đã lưu sẽ hiện tag "Bản cũ" và nút "Tính lại".
