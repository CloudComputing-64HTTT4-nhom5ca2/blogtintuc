import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const EditProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [photoURL, setPhotoURL] = useState(currentUser.photoURL || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await updateProfile({ displayName, photoURL });
      navigate('/profile');
    } catch (error) {
      console.error('Lỗi cập nhật hồ sơ:', error);
      setError('Cập nhật hồ sơ thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Chỉnh sửa hồ sơ</h2>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="displayName">Tên hiển thị</label>
          <input
            type="text"
            id="displayName"
            className="form-control"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="photoURL">Ảnh đại diện (URL)</label>
          <input
            type="text"
            id="photoURL"
            className="form-control"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-auth" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Cập nhật'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
