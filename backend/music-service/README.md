# music-service

Service quản lý bài hát, nghệ sĩ và playlist. Cấu trúc giống `account-service`.

## Luồng xử lý

```
server.js
  -> route                khai báo endpoint
  -> authenticateJWT       xác thực JWT, gắn req.user (route cần đăng nhập)
  -> authorize(...)       kiểm tra vai trò (route giới hạn vai trò)
  -> *Validator           express-validator kiểm tra query / param / body
  -> validationMiddleware trả 400 nếu input sai
  -> controller           lấy dữ liệu đã kiểm tra bằng matchedData(req)
  -> service              nghiệp vụ: phân trang, quyền, ném AppError
  -> repository           câu SQL, tham số hoá
  -> pool (pg)            PostgreSQL
```

Thứ tự middleware trên route: **xác thực → phân quyền → validate → controller**.
Route được bảo vệ vì vậy trả 401/403 **trước khi** kiểm tra input — không validate
dữ liệu của người chưa được phép gọi.

### Xác thực và phân quyền

Hai middleware tách riêng, `authenticateJWT` luôn chạy trước:

```js
router.get('/', songController.listSongs);                                       // công khai
router.post('/', authenticateJWT, authorize('admin'), songController.createSong); // chỉ admin
router.use(authenticateJWT);                                                      // chỉ cần đăng nhập
```

- `authenticateJWT` — đọc token trong `Authorization: Bearer ...`, kiểm tra hợp lệ
  rồi gắn `req.user = { id, email, role }`. Thiếu hoặc sai token → 401.
- `authorize('admin')` — `req.user.role` phải nằm trong danh sách, nếu không → 403 `FORBIDDEN`.
- `authorize()` — không truyền vai trò nào thì chỉ cần đăng nhập.
- Nhiều vai trò: `authorize('admin', 'editor')`.

`authorize` cần `req.user` nên **bắt buộc** đứng sau `authenticateJWT`. Route chỉ cần
đăng nhập mà không giới hạn vai trò thì dùng mỗi `authenticateJWT`, không cần `authorize`.

## Cấu trúc thư mục

```
music-service/
├── db/
│   ├── 00-schema.sql      artists, songs, song_artists, playlists, playlist_songs
│   └── 01-seed.sql        dữ liệu demo (idempotent)
├── src/
│   ├── server.js
│   ├── config/db.config.js
│   ├── controllers/       song, artist, playlist
│   ├── middleware/        auth, error, validation
│   ├── repositories/      song, artist, playlist
│   ├── routes/            song, artist, playlist
│   ├── services/          song, artist, playlist
│   ├── utils/             error.util (AppError), jwt.util
│   └── validations/       song, artist, playlist
├── Dockerfile
├── package.json
└── .env
```

## Ai được làm gì

| Nhóm | Đọc | Ghi |
|---|---|---|
| Khách (không token) | bài hát, nghệ sĩ | – |
| `listener` (có token) | bài hát, nghệ sĩ | playlist của chính mình |
| `admin` | bài hát, nghệ sĩ, playlist hệ thống | bài hát, nghệ sĩ, playlist của mình |

`role` lấy từ claim cùng tên trong JWT do account-service phát hành. Ghi bài hát
hoặc nghệ sĩ mà không phải `admin` → 403 `FORBIDDEN`.

## API — bài hát

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/songs` | công khai | Danh sách (tìm kiếm, lọc, sắp xếp, phân trang) |
| GET | `/api/songs/:id` | công khai | Chi tiết |
| POST | `/api/songs` | admin | Tạo bài hát |
| PATCH | `/api/songs/:id` | admin | Sửa bài hát |
| DELETE | `/api/songs/:id` | admin | Xoá bài hát |

Query params của `GET /api/songs`:

| Param | Mặc định | Ghi chú |
|---|---|---|
| `q` | – | Tìm theo tên bài hát hoặc tên nghệ sĩ |
| `artistId` | – | Lọc theo nghệ sĩ |
| `order` | `desc` | `asc` hoặc `desc`; giá trị khác → 400 |
| `page` | `1` | Số nguyên ≥ 1; sai → 400 |
| `limit` | `20` | Số nguyên 1–50; sai → 400 |

Body của `POST /api/songs`:

```json
{
  "title": "Ngày mới",
  "audioUrl": "/audio/ngay-moi.mp3",
  "coverUrl": "/covers/ngay-moi.jpg",
  "durationSeconds": 210,
  "artistIds": [1, 3]
}
```

- `title`, `audioUrl`, `durationSeconds`: bắt buộc.
- `coverUrl`, `artistIds`: tuỳ chọn. `artistIds` bỏ trống thì bài hát không có nghệ sĩ nào.

`PATCH /api/songs/:id` chỉ cập nhật trường được gửi lên:

- Không gửi `artistIds` → giữ nguyên danh sách nghệ sĩ.
- Gửi `artistIds: []` → **bỏ hết** nghệ sĩ của bài hát.
- `artistIds` chứa id không tồn tại → 404 `ARTIST_NOT_FOUND`.

`DELETE /api/songs/:id` xoá luôn liên kết nghệ sĩ **và mọi dòng trong playlist của
người dùng** (`ON DELETE CASCADE`).

## API — nghệ sĩ

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/artists` | công khai | Danh sách (nhận `q`, `page`, `limit`) |
| GET | `/api/artists/:id` | công khai | Chi tiết kèm toàn bộ bài hát |
| POST | `/api/artists` | admin | Tạo nghệ sĩ, body `{ "name": "..." }` |
| PATCH | `/api/artists/:id` | admin | Đổi tên |
| DELETE | `/api/artists/:id` | admin | Xoá nghệ sĩ |

`DELETE /api/artists/:id` **không** xoá bài hát của họ, chỉ bỏ liên kết trong
`song_artists`. Bài hát có thể còn lại với 0 nghệ sĩ.

## API — playlist

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/playlists` | đăng nhập | Playlist của mình + playlist hệ thống |
| POST | `/api/playlists` | đăng nhập | Tạo playlist |
| GET | `/api/playlists/:id` | đăng nhập | Chi tiết kèm bài hát theo thứ tự |
| PATCH | `/api/playlists/:id` | chủ sở hữu | Đổi tên / mô tả / ảnh bìa |
| DELETE | `/api/playlists/:id` | chủ sở hữu | Xoá playlist |
| POST | `/api/playlists/:id/songs` | chủ sở hữu | Thêm bài, body `{ "songId": 5 }` |
| DELETE | `/api/playlists/:id/songs/:songId` | chủ sở hữu | Bỏ bài khỏi playlist |

Body của `POST /api/playlists` và `PATCH /api/playlists/:id`:

```json
{ "name": "Nhạc đi đường", "description": "Nghe khi lái xe", "coverUrl": "/covers/x.jpg" }
```

- `name`: bắt buộc khi tạo, tối đa 150 ký tự.
- `PATCH` **không xoá trắng** được `description` / `coverUrl` (dùng `COALESCE`).

Quy tắc sở hữu:

| Tình huống | Kết quả |
|---|---|
| Playlist của chính mình | Xem và sửa được |
| Playlist hệ thống (`owner_id` NULL, có trong seed) | Ai cũng xem được, không ai sửa được → 403 `SYSTEM_PLAYLIST_READONLY` |
| Playlist riêng của người khác | Coi như không tồn tại → 404 `PLAYLIST_NOT_FOUND` |

## Định dạng trả về

Danh sách:

```json
{
  "data": [ { "id": 1, "title": "Ngay moi", "artists": ["Demo Acoustic"] } ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

Chi tiết và sau khi ghi: `{ "data": { ... } }`

Xoá: `{ "data": { "id": 3, "deleted": true } }`

Lỗi: `{ "error": "SONG_NOT_FOUND", "message": "Song not found", "data": null }`

Các mã lỗi: `MISSING_AUTH_HEADER`, `INVALID_AUTH_HEADER`, `INVALID_TOKEN`,
`TOKEN_EXPIRED`, `UNAUTHENTICATED`, `FORBIDDEN`, `INVALID_REQUEST`,
`SONG_NOT_FOUND`, `ARTIST_NOT_FOUND`, `PLAYLIST_NOT_FOUND`,
`SONG_ALREADY_IN_PLAYLIST`, `SONG_NOT_IN_PLAYLIST`, `NOT_PLAYLIST_OWNER`,
`SYSTEM_PLAYLIST_READONLY`, `ROUTE_NOT_FOUND`.

### Kiểm tra đầu vào

Tầng `validations/` dùng `express-validator`, giống `account-service`. Input sai
trả 400 kèm danh sách lỗi theo từng trường:

```json
{
  "error": "INVALID_REQUEST",
  "message": "Validation failed",
  "data": [
    { "field": "limit", "message": "limit must be between 1 and 50" }
  ]
}
```

| Input | Kết quả |
|---|---|
| `/api/songs/abc` | 400 `INVALID_REQUEST` |
| `/api/artists/abc` | 400 `INVALID_REQUEST` |
| `/api/playlists/abc` | 400 `INVALID_REQUEST` |
| `/api/songs?artistId=abc` | 400 `INVALID_REQUEST` |
| `/api/songs?page=0` | 400 `INVALID_REQUEST` |
| `/api/songs?limit=999` | 400 `INVALID_REQUEST` |
| `/api/songs?order=bậy` | 400 `INVALID_REQUEST` |
| `POST /api/songs` thiếu `title` | 400 `INVALID_REQUEST` |

Id hợp lệ nhưng không tồn tại thì vẫn là 404 (`SONG_NOT_FOUND`, `ARTIST_NOT_FOUND`,
`PLAYLIST_NOT_FOUND`).

> **Vì sao controller đọc bằng `matchedData(req)` thay vì `req.query`:**
> Express 5 định nghĩa `req.query` bằng getter không có setter, nên sanitizer của
> express-validator (`.toInt()`, `.trim()`) **không ghi được** vào `req.query` —
> và nó thất bại **âm thầm**, không ném lỗi. `matchedData(req)` trả về giá trị đã
> sanitize (số ra số, chuỗi đã trim) mà không cần chạm vào `req.query`.
> `req.body` và `req.params` thì sanitizer ghi được bình thường, nhưng dùng
> `matchedData` cho tất cả để nhất quán và tránh nhận thừa trường không khai báo.

## Database

music-service dùng **database riêng** (`music_db`) trên container `postgres-music`,
tách hẳn khỏi `account_db`. Vì vậy `playlists.owner_id` **không có khoá ngoại**
sang bảng `users`; nó lấy từ claim `sub` của JWT.

| Container | Port public |
|---|---|
| `postgres-account` | 5433 |
| `postgres-music` | 5434 |

`position` trong `playlist_songs` là khoá sắp xếp, **có thể có khoảng trống** sau
khi bỏ bài hát. Client nên hiển thị theo thứ tự trả về, đừng dùng trực tiếp giá
trị `position`.

## Chạy

```bash
docker compose up -d --build
curl http://localhost:4000/api/songs
```

Chạy riêng service trên máy (đổi `DATABASE_URL` sang `localhost:5434`):

```bash
npm install
npm start
```
