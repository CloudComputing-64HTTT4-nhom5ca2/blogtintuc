import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="var(--background-dark-light)" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <div className="footer-logo">
              <div className="gradient-text">WebAPPP Blog</div>
            </div>
            <p className="footer-description">
              Blog hiện đại với các bài viết chất lượng về công nghệ, tin tức và nhiều chủ đề thú vị khác.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-link">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="social-link">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-link">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div className="footer-section links">
            <h3>Liên kết nhanh</h3>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/about">Giới thiệu</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
              <li><Link to="/privacy">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          <div className="footer-section categories">
            <h3>Danh mục</h3>
            <ul className="footer-links">
              <li><Link to="/category/technology">Công nghệ</Link></li>
              <li><Link to="/category/news">Tin tức</Link></li>
              <li><Link to="/category/lifestyle">Phong cách sống</Link></li>
              <li><Link to="/category/science">Khoa học</Link></li>
            </ul>
          </div>

          <div className="footer-section newsletter">
            <h3>Nhận thông báo</h3>
            <p>Đăng ký để nhận thông báo về các bài viết mới nhất</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Email của bạn" />
              <button className="btn-subscribe">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} <span className="gradient-text">WebAPPP Blog</span>. Tất cả các quyền được bảo lưu.
          </p>
          <div className="footer-back-to-top">
            <a href="#top" aria-label="Trở về đầu trang">
              <i className="fas fa-arrow-up"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
