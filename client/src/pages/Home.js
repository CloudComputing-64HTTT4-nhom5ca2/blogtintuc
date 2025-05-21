import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '../firebase';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredPost, setFeaturedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = ref(database, 'posts');
        const snapshot = await get(postsRef);

        if (snapshot.exists()) {
          const postsData = snapshot.val();
          const postsArray = Object.keys(postsData).map(id => ({
            id,
            ...postsData[id]
          }));

          // Sắp xếp theo thời gian tạo giảm dần (mới nhất trước)
          postsArray.sort((a, b) => b.createdAt - a.createdAt);

          // Chọn bài viết nổi bật (bài đầu tiên hoặc bài có lượt xem cao nhất)
          const mostViewedPost = [...postsArray].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))[0];
          setFeaturedPost(mostViewedPost || postsArray[0]);

          // Lọc bỏ bài viết nổi bật khỏi danh sách các bài viết thông thường
          const regularPosts = postsArray.filter(post => post.id !== (mostViewedPost || postsArray[0]).id);
          setPosts(regularPosts);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy bài viết:', error);
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Hàm rút gọn nội dung
  const truncateContent = (content, maxLength = 120) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Định dạng ngày tháng
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="home-container fade-in">
      <div className="home-header">
        <h1 className="home-title">WebAPPP Blog</h1>
        <p className="home-subtitle">
          Khám phá các bài viết chất lượng về công nghệ, tin tức và nhiều chủ đề thú vị khác
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Featured Post Section */}
          {featuredPost && (
            <div className="featured-post">
              <h2 className="posts-section-title">Bài viết nổi bật</h2>
              <div className="featured-post-card">
                <div className="featured-post-image">
                  {featuredPost.imageUrl ? (
                    <img src={featuredPost.imageUrl} alt={featuredPost.title} />
                  ) : (
                    <div className="placeholder-image" style={{background: 'linear-gradient(45deg, var(--primary-dark), var(--primary))'}}></div>
                  )}
                  <span className="featured-label">Nổi bật</span>
                </div>
                <div className="featured-post-content">
                  <h2 className="featured-post-title">
                    <Link to={`/post/${featuredPost.id}`}>{featuredPost.title}</Link>
                  </h2>
                  <div className="featured-post-excerpt">
                    {truncateContent(featuredPost.content, 180)}
                  </div>
                  <div className="post-card-meta">
                    <span>
                      <i className="far fa-calendar"></i> {formatDate(featuredPost.createdAt)}
                    </span>
                    <span>
                      <i className="far fa-eye"></i> {featuredPost.viewCount || 0} lượt xem
                    </span>
                    {featuredPost.author && (
                      <span>
                        <i className="far fa-user"></i> {featuredPost.authorName}
                      </span>
                    )}
                  </div>
                  <div className="post-card-actions">
                    <Link to={`/post/${featuredPost.id}`} className="btn btn-primary">
                      Đọc tiếp <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular Posts Section */}
          <div className="posts-section">
            <h2 className="posts-section-title">Bài viết mới nhất</h2>
            <div className="post-grid">
              {posts.length > 0 ? (
                posts.map(post => (
                  <div className="post-card" key={post.id}>
                    <div className="post-card-image">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt={post.title} />
                      ) : (
                        <div className="placeholder-image" style={{background: 'linear-gradient(135deg, var(--primary-dark), var(--secondary-dark))'}}></div>
                      )}
                      {post.category && (
                        <span className="post-card-category">{post.category}</span>
                      )}
                    </div>
                    <div className="post-card-content">
                      <h3>
                        <Link to={`/post/${post.id}`}>{post.title}</Link>
                      </h3>
                      <div className="post-card-excerpt">
                        {truncateContent(post.content)}
                      </div>
                      <div className="post-card-meta">
                        <span>
                          <i className="far fa-calendar"></i> {formatDate(post.createdAt)}
                        </span>
                        <span>
                          <i className="far fa-eye"></i> {post.viewCount || 0}
                        </span>
                      </div>
                      <div className="post-card-actions">
                        <Link to={`/post/${post.id}`} className="btn btn-secondary btn-sm">
                          <i className="fas fa-book-open"></i> Đọc tiếp
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-posts">
                  <p>Chưa có bài viết nào.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
