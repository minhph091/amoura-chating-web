# Cấu hình Nginx để deloy ứng dụng React

Hướng dẫn này cung cấp quy trình từng bước để cài đặt và cấu hình Nginx nhằm triển khai ứng dụng React, bao gồm cách xử lý lỗi kết nối backend khi chuyển từ môi trường phát triển sang sản xuất.

## Mục tiêu
- Cài đặt Nginx trên máy chủ Linux (Ubuntu).
- Triển khai ứng dụng React đã build lên Nginx.
- Cấu hình Nginx để xử lý các yêu cầu tĩnh và proxy yêu cầu API đến backend.
- Khắc phục lỗi kết nối backend trong môi trường sản xuất.

---

## Phần 1: Cài đặt và Cấu hình Nginx

### 1.1 Cài đặt Nginx
Cập nhật danh sách gói và cài đặt Nginx:

```bash
sudo apt update
sudo apt install nginx -y
```

### 1.2 Kiểm tra trạng thái Nginx
Xác nhận Nginx đã được cài đặt và đang chạy:

```bash
sudo systemctl status nginx
```

Nếu Nginx chưa chạy, khởi động nó:

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Phần 2: Build và Triển Khai Ứng Dụng React

### 2.1 Build ứng dụng React
Trong thư mục dự án React, chạy lệnh sau để tạo bản build tối ưu cho sản xuất:

```bash
npm run build
```

Thư mục `build/` sẽ được tạo, chứa các tệp tĩnh của ứng dụng.

### 2.2 Sao chép tệp build vào Nginx
Sao chép các tệp từ thư mục `build/` vào thư mục phục vụ của Nginx:

```bash
sudo cp -r build/* /var/www/html/
```

---

## Phần 3: Cấu hình Nginx

### 3.1 Tạo tệp cấu hình cho site
Tạo một tệp cấu hình mới cho ứng dụng React:

```bash
sudo nano /etc/nginx/sites-available/react-app
```

Dán nội dung sau vào tệp `react-app`:

```nginx
server {
    listen 80;
    server_name 150.95.109.13;  # Thay bằng IP máy chủ hoặc tên miền của bạn

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # Hỗ trợ định tuyến phía client của React
    }

    location /api/ {
        proxy_pass http://150.95.109.13:8080;  # Proxy yêu cầu API đến backend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.2 Kích hoạt cấu hình
Tạo liên kết tượng trưng để kích hoạt site:

```bash
sudo ln -s /etc/nginx/sites-available/react-app /etc/nginx/sites-enabled/
```

Xóa cấu hình mặc định của Nginx (nếu cần):

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 3.3 Kiểm tra và khởi động lại Nginx
Kiểm tra cú pháp cấu hình:

```bash
sudo nginx -t
```

Nếu không có lỗi, khởi động lại Nginx để áp dụng cấu hình:

```bash
sudo systemctl restart nginx
```

---

## Phần 4: Cấu hình Firewall

Mở port 80 để cho phép truy cập HTTP:

```bash
sudo ufw allow 80
```

Kiểm tra trạng thái firewall:

```bash
sudo ufw status
```

---

## Phần 5: Truy cập Ứng Dụng

Mở trình duyệt và truy cập ứng dụng qua:

```
http://150.95.109.13
```

Lưu ý: Port 3000 không còn cần thiết vì Nginx phục vụ ứng dụng trên port 80.

---

## Phần 6: Khắc phục Lỗi Kết Nối Backend

### 6.1 Vấn đề
- Trong môi trường phát triển (`npm start`), kết nối đến backend hoạt động bình thường.
- Trong môi trường sản xuất (`npm run build`), kết nối backend thất bại do cấu hình sai URL trong tệp `src/config.js`.

### 6.2 Nguyên nhân
Tệp `src/config.js` sử dụng URL mặc định (ví dụ: `https://your-domain.com`) thay vì IP hoặc port thực của backend trong môi trường sản xuất.

### 6.3 Giải pháp
Sửa tệp `src/config.js` để sử dụng đúng địa chỉ backend.

#### Bước 1: Mở tệp config.js
```bash
nano src/config.js
```

#### Bước 2: Sửa cấu hình production
Tìm đoạn mã sau:

```javascript
if (isProduction) {
    API_CONFIG.BASE_URL = 'https://your-domain.com/api';
    API_CONFIG.WS_URL = 'wss://your-domain.com/api/ws';
}
```

Thay bằng:

```javascript
if (isProduction) {
    API_CONFIG.BASE_URL = 'http://150.95.109.13:8080/api';
    API_CONFIG.WS_URL = 'ws://150.95.109.13:8080/api/ws';
}
```

#### Bước 3: Lưu và thoát
- Nhấn `Ctrl + X`, sau đó `Y`, rồi `Enter` để lưu tệp.

#### Bước 4: Build lại ứng dụng
```bash
npm run build
```

#### Bước 5: Cập nhật tệp build lên Nginx
```bash
sudo cp -r build/* /var/www/html/
sudo systemctl restart nginx
```

#### Bước 6: Kiểm tra lại
Truy cập `http://150.95.109.13` để xác nhận kết nối backend hoạt động.

---

## Phần 7: Kiểm tra và Giám sát

### 7.1 Kiểm tra trạng thái Nginx
```bash
sudo systemctl status nginx
```

### 7.2 Kiểm tra phản hồi từ server
```bash
curl http://150.95.109.13
```

---

## Phần 8: Ghi chú
- **Cập nhật mã nguồn**: Mỗi khi sửa mã React, cần chạy lại `npm run build`, sao chép tệp vào `/var/www/html/`, và khởi động lại Nginx.
- **Thay đổi IP hoặc domain**: Nếu sử dụng tên miền hoặc IP backend thay đổi, cập nhật tệp `/etc/nginx/sites-available/react-app` và `src/config.js` cho phù hợp.
- **Bảo mật**: Xem xét cấu hình HTTPS (SSL/TLS) với Let’s Encrypt để tăng cường bảo mật.