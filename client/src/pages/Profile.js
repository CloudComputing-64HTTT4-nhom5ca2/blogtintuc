import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Đã xảy ra lỗi khi đăng xuất.');
    }
  };

  return (
    <div className="profile-container">
      <h1>Hồ sơ người dùng</h1>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0)}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{currentUser.displayName || 'Người dùng'}</h2>
            <p>{currentUser.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-detail-item">
            <div className="profile-detail-label">Email</div>
            <div className="profile-detail-value">{currentUser.email}</div>
          </div>
          <div className="profile-detail-item">
            <div className="profile-detail-label">Tài khoản</div>
            <div className="profile-detail-value">{currentUser.uid}</div>
          </div>
          <div className="profile-detail-item">
            <div className="profile-detail-label">Ngày tạo</div>
            <div className="profile-detail-value">
              {currentUser.metadata.creationTime
                ? new Date(currentUser.metadata.creationTime).toLocaleDateString('vi-VN')
                : 'Không có thông tin'}
            </div>
          </div>
          <div className="profile-detail-item">
            <div className="profile-detail-label">Đăng nhập gần đây</div>
            <div className="profile-detail-value">
              {currentUser.metadata.lastSignInTime
                ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Không có thông tin'}
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={() => navigate('/profile/edit')} className="btn-edit-profile">
            <i className="fas fa-user-edit"></i> Chỉnh sửa hồ sơ
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            <i className="fas fa-sign-out-alt"></i> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
