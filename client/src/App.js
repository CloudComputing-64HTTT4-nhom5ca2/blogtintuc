import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPosts from './pages/admin/AdminPosts';
import CreatePost from './pages/admin/CreatePost';
import EditPost from './pages/admin/EditPost';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import EditProfile from './pages/EditProfile';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Search from './pages/Search';
import ManageComments from './pages/admin/ManageComments';
import ManageUsers from './pages/admin/ManageUsers';
import Settings from './pages/admin/Settings';
import './App.css';

function AppContent() {
  const location = useLocation();

  // Xử lý thanh progress khi cuộn trang
  useEffect(() => {
    // Sửa lỗi header đè lên nội dung tại thời điểm ban đầu
    const fixHeaderOverlap = () => {
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      if (header && main) {
        const headerHeight = header.offsetHeight;
        main.style.marginTop = `${headerHeight}px`;

        // Đảm bảo header có z-index cao
        header.style.zIndex = "1000";

        // Đảm bảo các container con cũng được điều chỉnh padding-top
        document.querySelectorAll('.post-detail-container, .home-container, .search-results-container, .profile-container, .admin-container, .create-post-container, .edit-post-container').forEach(container => {
          if (container) {
            container.style.paddingTop = '36px'; // Tăng padding lên 36px
          }
        });

        // Đảm bảo phần post detail luôn hiển thị đúng
        const postDetailHeader = document.querySelector('.post-detail-header');
        if (postDetailHeader) {
          postDetailHeader.style.position = 'relative';
          postDetailHeader.style.zIndex = '1';
        }
      }
    };

    // Gọi hàm fix ngay khi trang load, mỗi khi resize và khi chuyển trang
    fixHeaderOverlap();
    window.addEventListener('resize', fixHeaderOverlap);

    // Thêm một small delay để đảm bảo DOM đã được cập nhật hoàn toàn
    const timer = setTimeout(fixHeaderOverlap, 100);

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPosition = window.scrollY;
      const scrollProgress = (scrollPosition / totalScroll) * 100;

      const progressBar = document.querySelector('.scroll-progress-bar');
      if (progressBar) {
        progressBar.style.width = `${scrollProgress}%`;
      }

      // Hiển thị/ẩn nút scroll to top
      const scrollToTopBtn = document.querySelector('.scroll-to-top');
      if (scrollToTopBtn) {
        if (scrollPosition > 300) {
          scrollToTopBtn.classList.add('visible');

          // Thêm hiệu ứng pulse khi gần cuối trang
          if (scrollProgress > 80) {
            scrollToTopBtn.classList.add('pulse');
          } else {
            scrollToTopBtn.classList.remove('pulse');
          }
        } else {
          scrollToTopBtn.classList.remove('visible');
          scrollToTopBtn.classList.remove('pulse');
        }
      }
    };

    // Thêm scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Xử lý smooth scroll khi click vào liên kết
    const setupSmoothScroll = () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            window.scrollTo({
              top: target.offsetTop - 70, // Trừ chiều cao của header
              behavior: 'smooth'
            });
          }
        });
      });
    };

    setupSmoothScroll();

    // Clean up event listeners
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', fixHeaderOverlap);
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', function() {});
      });
      clearTimeout(timer);
    };
  }, [location]); // Thêm location vào dependencies để chạy lại khi route thay đổi

  return (
    <div className="app" id="top">
      <Header />
      <main className="container">
        <Routes>
          {/* Trang công khai */}
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />

          {/* Trang yêu cầu đăng nhập */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile/edit" element={<EditProfile />} />

          {/* Trang Admin */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/posts" element={
            <AdminRoute>
              <AdminPosts />
            </AdminRoute>
          } />
          <Route path="/admin/posts/create" element={
            <AdminRoute>
              <CreatePost />
            </AdminRoute>
          } />
          <Route path="/admin/posts/edit/:id" element={
            <AdminRoute>
              <EditPost />
            </AdminRoute>
          } />
          <Route path="/admin/comments" element={
            <AdminRoute>
              <ManageComments />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute>
              <Settings />
            </AdminRoute>
          } />

          {/* Trang không tìm thấy */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />

      {/* Nút scroll to top */}
      <button className="scroll-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="fas fa-arrow-up"></i>
      </button>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
