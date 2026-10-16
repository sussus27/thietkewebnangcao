# account-service

`server + connect database -> route và validate input -> controller -> service -> repository`

Service quản lý tài khoản: đăng ký, đăng nhập, hồ sơ người dùng, và **quản trị
vai trò người dùng** cho admin.

## Luồng xử lý

```
server.js
  -> route                khai báo endpoint
  -> authenticateJWT      xác thực JWT, gắn req.user (route cần đăng nhập)
  -> authorize(...)       kiểm tra vai trò (route giới hạn vai trò)
  -> *Validator           express-validator kiểm tra input
  -> validationMiddleware trả 400 nếu input sai
  -> controller           lấy dữ liệu đã kiểm tra bằng matchedData(req)
  -> service              nghiệp vụ, ném AppError
  -> repository           câu SQL, tham số hoá
  -> pool (pg)            PostgreSQL
```

Thứ tự trên route: **xác thực → phân quyền → validate → controller**. Route được
bảo vệ vì vậy trả 401/403 trước khi kiểm tra input.

## API

| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/api/auth/register` | công khai |
| POST | `/api/auth/login` | công khai |
| GET | `/api/users/me` | đăng nhập |
| PUT | `/api/users/me` | đăng nhập |
| GET | `/api/users` | admin |
| PATCH | `/api/users/:id/role` | admin |
| DELETE | `/api/users/:id` | admin |

`GET /api/users` nhận `q`, `page`, `limit` và **không bao giờ trả `password_hash`**.

`PATCH /api/users/:id/role` body: `{ "role": "admin" }` hoặc `{ "role": "listener" }`.

## Vai trò

Chỉ có hai vai trò: `listener` và `admin`. Vai trò nằm ở cột `users.role` và được
ghi vào claim `role` của JWT khi đăng nhập.

- Đăng ký mới **luôn** là `listener`.
- Chỉ `admin` gọi được các route quản trị.
- Seed tạo sẵn `admin@example.com` với vai trò `admin`. Mật khẩu của mọi tài khoản
  seed là `admin123456`.

### Không thể tự khoá mình

`PATCH /api/users/:id/role` và `DELETE /api/users/:id` **từ chối khi `:id` chính là
người đang gọi** → 403 `CANNOT_MODIFY_SELF`.

Quy tắc này đồng thời đảm bảo hệ thống **luôn còn ít nhất một admin**, nên không
cần thêm đoạn kiểm tra "admin cuối cùng": người gọi luôn là admin, mà họ không thể
tự hạ quyền hay tự xoá mình.

### Giới hạn đã biết

**Đổi vai trò không có hiệu lực ngay.** JWT đã phát hành vẫn mang `role` cũ tới khi
hết hạn (`JWT_EXPIRES_IN`, mặc định `1d`). Người dùng phải đăng nhập lại mới nhận
vai trò mới. Muốn tức thì phải thêm `tokenVersion` vào user và kiểm tra mỗi request,
hoặc rút ngắn thời hạn token.

**Xoá user không xoá playlist của họ.** Playlist nằm ở `music_db`, tách database
nên `playlists.owner_id` không có khoá ngoại. Xoá user sẽ để lại playlist trỏ vào
id không còn tồn tại.

## Database

```
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    username      VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'listener',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key
    ON users (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_key
    ON users (LOWER(username));
```

Mật khẩu hash bằng bcrypt. `JWT_SECRET` phải **trùng với `music-service`** thì token
do service này phát hành mới được service kia chấp nhận.
