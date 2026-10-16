# Website nghe nhạc trực tuyến

Đồ án môn Thiết kế web nâng cao, hướng đến các chức năng đăng ký, đăng nhập,
tìm kiếm, nghe nhạc và lưu bài hát yêu thích.

Backend sử dụng Node.js, Express và PostgreSQL, triển khai bằng Docker Compose.

## Các service

| Service | Port | Database | Trạng thái |
|---|---|---|---|
| `api-gateway` | 4000 | – | Đã có, proxy tới các service |
| `account-service` | 4001 | `account_db` (5433) | Đã có: đăng ký, đăng nhập, hồ sơ người dùng |
| `music-service` | 4004 | `music_db` (5434) | Đã có: CRUD bài hát, nghệ sĩ, playlist |
| `streaming-service` | 4002 | – | Chưa làm |
| `upload-service` | 4003 | – | Chưa làm |

Mọi request từ client đều đi qua gateway ở cổng 4000:

```
client -> api-gateway:4000 -> account-service:4001 -> postgres-account
                           -> music-service:4004   -> postgres-music
```

## Chạy

```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:4000/api/songs
```

## Tài khoản demo

Seed tạo sẵn 5 tài khoản, **tất cả đều dùng mật khẩu `admin123456`**:

| Email | Vai trò |
|---|---|
| `admin@example.com` | `admin` |
| `alice@example.com`, `bob@example.com`, `charlie@example.com`, `david@example.com` | `listener` |

Tài khoản mới đăng ký qua `/api/auth/register` luôn là `listener`. Muốn cấp quyền
admin thì dùng `PATCH /api/users/:id/role` bằng tài khoản admin.

## Phân quyền

| Nhóm | Đọc | Ghi |
|---|---|---|
| Khách (không token) | bài hát, nghệ sĩ | – |
| `listener` (có token) | bài hát, nghệ sĩ | playlist của chính mình |
| `admin` | bài hát, nghệ sĩ, playlist hệ thống, danh sách người dùng | bài hát, nghệ sĩ, playlist của mình, vai trò người dùng |

Token do account-service phát hành, music-service kiểm tra bằng chung
`JWT_SECRET`. `role` lấy từ claim cùng tên trong token.

## API đã có

### account-service

| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/api/auth/register` | công khai |
| POST | `/api/auth/login` | công khai |
| GET | `/api/users/me` | đăng nhập |
| PUT | `/api/users/me` | đăng nhập |
| GET | `/api/users` | admin |
| PATCH | `/api/users/:id/role` | admin |
| DELETE | `/api/users/:id` | admin |

### music-service — bài hát, nghệ sĩ

| Method | Endpoint | Quyền |
|---|---|---|
| GET | `/api/songs` | công khai |
| GET | `/api/songs/:id` | công khai |
| POST | `/api/songs` | admin |
| PATCH | `/api/songs/:id` | admin |
| DELETE | `/api/songs/:id` | admin |
| GET | `/api/artists` | công khai |
| GET | `/api/artists/:id` | công khai |
| POST | `/api/artists` | admin |
| PATCH | `/api/artists/:id` | admin |
| DELETE | `/api/artists/:id` | admin |

### music-service — playlist

| Method | Endpoint | Quyền |
|---|---|---|
| GET | `/api/playlists` | đăng nhập |
| POST | `/api/playlists` | đăng nhập |
| GET | `/api/playlists/:id` | đăng nhập |
| PATCH | `/api/playlists/:id` | chủ sở hữu |
| DELETE | `/api/playlists/:id` | chủ sở hữu |
| POST | `/api/playlists/:id/songs` | chủ sở hữu |
| DELETE | `/api/playlists/:id/songs/:songId` | chủ sở hữu |

Playlist là dữ liệu riêng của từng người: mỗi người chỉ thấy playlist của mình
cộng với playlist hệ thống (những cái có sẵn trong seed).

Chi tiết xem `backend/music-service/README.md` và `backend/account-service/README.md`.
