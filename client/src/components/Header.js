import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';

const Header = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Xử lý sự kiện scroll để thay đổi hiệu ứng header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  // Kiểm tra xem liên kết có đang active không
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Đóng menu khi chọn liên kết (trên mobile)
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Xử lý tìm kiếm
  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    closeMenu();
  };

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <div className="container">
        <nav className="navbar">
          <Link to="/" className="brand">
            <span className="gradient-text">WebAPPP</span> Blog
          </Link>

          <div className="navbar-center">
            <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
              <li>
                <Link
                  to="/"
                  className={isActive('/') ? 'active' : ''}
                  onClick={closeMenu}
                >
                  <i className="fas fa-home"></i> Trang chủ
                </Link>
              </li>

              {isAdmin && (
                <li>
                  <Link
                    to="/admin"
                    className={isActive('/admin') ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    <i className="fas fa-cogs"></i> Quản trị
                  </Link>
                </li>
              )}

              {currentUser ? (
                <>
                  <li>
                    <Link
                      to="/profile"
                      className={isActive('/profile') ? 'active' : ''}
                      onClick={closeMenu}
                    >
                      <i className="fas fa-user"></i> Hồ sơ
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="nav-button"
                    >
                      <i className="fas fa-sign-out-alt"></i> Đăng xuất
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      className={isActive('/login') ? 'active' : ''}
                      onClick={closeMenu}
                    >
                      <i className="fas fa-sign-in-alt"></i> Đăng nhập
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className={`nav-button-highlighted ${isActive('/register') ? 'active' : ''}`}
                      onClick={closeMenu}
                    >
                      <i className="fas fa-user-plus"></i> Đăng ký
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="navbar-right">
            <SearchBar onSearch={handleSearch} />

            {/* Menu toggle button cho mobile */}
            <div
              className={`menu-toggle ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </nav>
      </div>

      {/* Thanh tiến trình cuộn */}
      <div className="scroll-progress">
        <div className="scroll-progress-bar"></div>
      </div>
    </header>
  );
};

export default Header;
