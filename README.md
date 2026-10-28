# Thầy Bói

Web app xem tử vi, thần số học và chiêm tinh từ một hồ sơ sinh. Tài liệu nghiệp vụ và thiết kế nằm ngoài repo, ở `~/Documents/MyDocs/Games/thayboi/`.

## Chạy trên máy

```bash
npm install
cp .env.example .env.local
npm run db:migrate      # tạo local.db
npm run dev             # http://localhost:3000
```

## Lệnh

| Lệnh | Việc |
|---|---|
| `npm test` | Unit + integration test (Vitest, DB SQLite tạm) |
| `npm run typecheck` | Sinh kiểu route rồi chạy `tsc` |
| `npm run lint` | ESLint |
| `npm run db:generate` | Sinh migration sau khi sửa `src/lib/db/schema.ts` |
| `npm run db:migrate` | Áp migration vào `DATABASE_URL` |

## Deploy

- `NEXT_PUBLIC_SITE_URL` phải có **lúc build**: sitemap, robots và ảnh chia sẻ được render tĩnh.
- DB: Turso (`DATABASE_URL=libsql://…` + `DATABASE_AUTH_TOKEN`), chạy `npm run db:migrate` trước khi deploy bản có migration mới.

## Lưu ý khi sửa cách tính

Sửa bất cứ gì trong `src/lib/charts/` làm kết quả lá số thay đổi thì **tăng số trong `CALC_VERSION`** của môn đó (`src/lib/charts/index.ts`). Lá số đã lưu sẽ hiện tag "Bản cũ" và nút "Tính lại".
