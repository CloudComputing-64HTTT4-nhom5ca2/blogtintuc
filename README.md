# WebAPPP Blog

Ứng dụng blog hiện đại được phát triển với React, Node.js, Express và Firebase Realtime Database.

## Tính năng

### Người dùng

- Đọc bài viết
- Xem chi tiết bài viết
- Đánh giá và bình luận
- Đăng ký và đăng nhập
- Quản lý hồ sơ cá nhân

### Quản trị viên

- Quản lý bài viết (thêm, sửa, xóa)
- Quản lý người dùng
- Xem thống kê trang web

## Công nghệ sử dụng

### Frontend

- React.js
- React Router
- Firebase Auth
- Firebase Realtime Database
- CSS hiện đại

### Backend

- Node.js
- Express.js
- Firebase Admin SDK
- Google Cloud Platform
- App Engine

## Cấu trúc dự án

```
WebAPPP/
├── client/                 # Mã nguồn frontend (React)
│   ├── public/             # Tệp tin tĩnh
│   └── src/                # Mã nguồn React
│       ├── components/     # React components
│       ├── context/        # React contexts (Auth)
│       ├── pages/          # Các trang của ứng dụng
│       │   └── admin/      # Các trang quản trị
│       └── services/       # Các dịch vụ API
├── server/                 # Mã nguồn backend (Node.js/Express)
├── client-build/           # Thư mục build của React app
└── app.yaml                # Cấu hình Google App Engine
```

## Cài đặt và phát triển

### Yêu cầu

- Node.js 18 trở lên
- Firebase Account
- Google Cloud Platform Account

### Cài đặt

1. Clone dự án:

   ```
   git clone <repository-url>
   cd WebAPPP
   ```

2. Cài đặt các dependencies:

   ```
   # Frontend
   cd client
   npm install

   # Backend
   cd ../server
   npm install
   ```

3. Cấu hình Firebase:
   - Tạo tệp `.env` trong thư mục server với thông tin Firebase của bạn
   - Cấu hình quy tắc bảo mật Firebase

### Chạy ở môi trường phát triển

1. Chạy server:

   ```
   cd server
   node index.js
   ```

2. Chạy client:
   ```
   cd client
   npm start
   ```

### Triển khai

1. Build frontend:

   ```
   cd client
   npm run build
   ```

2. Sao chép build vào thư mục client-build:

   ```
   xcopy build\* ..\client-build\ /E /I /H
   ```

3. Triển khai lên Google Cloud Platform:
   ```
   cd ..
   gcloud app deploy
   ```
