import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ref, get, query, orderByChild } from 'firebase/database';
import { database } from '../firebase';

const Search = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchPosts = async () => {
      if (!searchQuery.trim()) {
        setPosts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const postsRef = ref(database, 'posts');
        const snapshot = await get(postsRef);

        if (snapshot.exists()) {
          const postsData = snapshot.val();
          let postsArray = Object.keys(postsData).map(id => ({
            id,
            ...postsData[id]
          }));

          // Lọc bài viết theo từ khóa tìm kiếm
          const filteredPosts = postsArray.filter(post => {
            const titleMatch = post.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const contentMatch = post.content?.toLowerCase().includes(searchQuery.toLowerCase());
            const authorMatch = post.author?.toLowerCase().includes(searchQuery.toLowerCase());
            const categoryMatch = post.category?.toLowerCase().includes(searchQuery.toLowerCase());

            return titleMatch || contentMatch || authorMatch || categoryMatch;
          });

          setPosts(filteredPosts);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Lỗi khi tìm kiếm bài viết:', error);
        setError('Không thể tìm kiếm bài viết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    searchPosts();
  }, [searchQuery]);

  // Hàm rút gọn nội dung
  const truncateContent = (content, maxLength = 150) => {
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

  // Hàm highlight từ khóa tìm kiếm
  const highlightText = (text, query) => {
    if (!text || !query.trim()) return text;

    const regex = new RegExp(`(${query.trim()})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className="search-results-container fade-in">
      <div className="search-header">
        <h1 className="search-title">Kết quả tìm kiếm</h1>
        <p className="search-subtitle">
          {posts.length > 0
            ? `Tìm thấy ${posts.length} kết quả cho "${searchQuery}"`
            : loading
              ? 'Đang tìm kiếm...'
              : `Không tìm thấy kết quả nào cho "${searchQuery}"`
          }
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="search-results">
          {posts.length > 0 ? (
            posts.map(post => (
              <div className="search-result-item" key={post.id}>
                <div className="search-result-content">
                  <h2>
                    <Link to={`/post/${post.id}`}
                      dangerouslySetInnerHTML={{
                        __html: highlightText(post.title, searchQuery)
                      }}
                    />
                  </h2>
                  <div className="search-result-excerpt"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(truncateContent(post.content), searchQuery)
                    }}
                  />
                  <div className="search-result-meta">
                    {post.category && (
                      <span className="search-result-category">{post.category}</span>
                    )}
                    <span>
                      <i className="far fa-calendar"></i> {formatDate(post.createdAt)}
                    </span>
                    {post.author && (
                      <span>
                        <i className="far fa-user"></i> {post.author}
                      </span>
                    )}
                  </div>
                </div>
                {post.imageUrl && (
                  <div className="search-result-image">
                    <img src={post.imageUrl} alt={post.title} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">
                <i className="fas fa-search"></i>
              </div>
              <p>Không tìm thấy kết quả nào cho tìm kiếm của bạn.</p>
              <p>Vui lòng thử lại với từ khóa khác hoặc trở về <Link to="/">trang chủ</Link>.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
