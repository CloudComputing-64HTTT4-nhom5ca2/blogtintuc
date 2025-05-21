import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container text-center">
      <h1>404</h1>
      <h2>Trang không tồn tại</h2>
      <p>Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
      <Link to="/" className="btn btn-primary">
        Quay lại trang chủ
      </Link>
    </div>
  );
};

export default NotFound;
