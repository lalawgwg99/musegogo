# Muse 邀請碼共用池

Cloudflare Pages + Functions + D1 的邀碼共用池：訪客上傳的邀碼直接進入資料庫，大家都能領到。

## 架構

- `public/index.html` — 前端（領碼、複製、上傳、回報、FAQ）
- `functions/api/draw.js` — `GET /api/draw` 隨機發一組有效邀碼
- `functions/api/stats.js` — `GET /api/stats` 池子統計
- `functions/api/codes.js` — `POST /api/codes` 上傳邀碼（驗證格式、擋重複）
- `functions/api/report.js` — `POST /api/report` 回報可用 / 已用完（3 次用完即移出輪換）
- `migrations/` — D1 資料表與 39 組初始邀碼

## 上線步驟（Cloudflare 後台）

1. **連接 repo**：Workers & Pages → Create → Pages → Connect to Git，選 `musegogo`。
   Build 設定：Framework preset 選 None，Build command 留空，Output directory 填 `public`。
2. **建 D1**：左側 D1 → Create database，取名 `muse-pool`。
3. **綁定 D1**：進 Pages 專案 → Settings → Functions → D1 database bindings → Add binding，
   Variable name 填 `DB`，選 `muse-pool`，Save 後重新部署一次。
4. **建表＋灌初始碼**（本機裝好 wrangler 並登入後）：
   ```
   npx wrangler d1 execute muse-pool --file=migrations/0001_schema.sql --remote
   npx wrangler d1 execute muse-pool --file=migrations/0002_seed.sql --remote
   ```
   之後每次 push 到 GitHub，Pages 會自動重新部署。

## 備註

- 上傳只驗證「6 位英文或數字」與是否重複；如需擋濫用，可在 Cloudflare 另加 Rate Limiting 規則。
- 初始 39 組邀碼為 2026-09-29 的快照，兌換次數有限，失效屬正常。
