import React, { useEffect, useState } from 'react';
import { database } from '../../firebase';
import { ref, onValue, update } from 'firebase/database';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/Admin.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(database, 'users/');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const usersList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setUsers(usersList);
      setLoading(false);
    });
  }, []);

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await update(ref(database, `users/${user.id}`), { role: newRole });
    } catch (error) {
      console.error("Lỗi khi thay đổi quyền người dùng:", error);
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
          <h1 className="admin-title">Quản lý người dùng</h1>
          <div className="admin-actions">
            <span className="admin-count">{users.length} người dùng</span>
          </div>
        </div>

        <div className="posts-table-container">
          <table className="posts-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Tên hiển thị</th>
                <th>Vai trò</th>
                <th>Ngày đăng ký</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id.substring(0, 8)}...</td>
                    <td>{user.email}</td>
                    <td>{user.displayName || 'Chưa đặt tên'}</td>
                    <td>
                      <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                        {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    </td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}</td>
                    <td>
                      <button
                        className={`btn-role ${user.role === 'admin' ? 'demote' : 'promote'}`}
                        onClick={() => handleToggleRole(user)}
                      >
                        {user.role === 'admin' ? (
                          <><i className="fas fa-user"></i> Hạ quyền</>
                        ) : (
                          <><i className="fas fa-user-shield"></i> Nâng quyền</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">Chưa có người dùng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
