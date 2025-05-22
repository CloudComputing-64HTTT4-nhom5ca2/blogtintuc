import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, get, update } from 'firebase/database';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/Admin.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'WebAPPP Blog',
    siteDescription: 'Blog tin tức hiện đại với Firebase',
    postsPerPage: 10,
    enableComments: true,
    enableRegistration: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = ref(database, 'settings');
        const snapshot = await get(settingsRef);

        if (snapshot.exists()) {
          setSettings(snapshot.val());
        }
      } catch (error) {
        console.error("Lỗi khi tải cài đặt:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await update(ref(database, 'settings'), settings);
      setMessage('Cài đặt đã được lưu thành công!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Lỗi khi lưu cài đặt:', error);
      setMessage('Đã xảy ra lỗi khi lưu cài đặt.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AdminSidebar />

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">Cài đặt hệ thống</h1>
        </div>

        {message && (
          <div className={`message ${message.includes('lỗi') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="settings-form-container">
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-section">
              <h3>Cài đặt chung</h3>

              <div className="form-group">
                <label htmlFor="siteName">Tên trang web</label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="siteDescription">Mô tả trang web</label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="postsPerPage">Số bài viết mỗi trang</label>
                <input
                  type="number"
                  id="postsPerPage"
                  name="postsPerPage"
                  value={settings.postsPerPage}
                  onChange={handleChange}
                  className="form-control"
                  min="1"
                  max="50"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Cài đặt tương tác</h3>

              <div className="form-check">
                <input
                  type="checkbox"
                  id="enableComments"
                  name="enableComments"
                  checked={settings.enableComments}
                  onChange={handleChange}
                  className="form-check-input"
                />
                <label htmlFor="enableComments" className="form-check-label">
                  Cho phép bình luận
                </label>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  id="enableRegistration"
                  name="enableRegistration"
                  checked={settings.enableRegistration}
                  onChange={handleChange}
                  className="form-check-input"
                />
                <label htmlFor="enableRegistration" className="form-check-label">
                  Cho phép đăng ký tài khoản mới
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
