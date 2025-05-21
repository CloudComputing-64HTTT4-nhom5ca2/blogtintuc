import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, update, get } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Lấy chi tiết bài viết
    const postRef = ref(database, `posts/${id}`);
    const postUnsubscribe = onValue(postRef, (snapshot) => {
      if (snapshot.exists()) {
        setPost({
          id,
          ...snapshot.val()
        });
      } else {
        // Bài viết không tồn tại
        navigate('/not-found');
      }
      setLoading(false);
    });

    // Lấy danh sách bình luận
    const commentsRef = ref(database, `comments/${id}`);
    const commentsUnsubscribe = onValue(commentsRef, (snapshot) => {
      const commentsData = snapshot.val() || {};
      const commentsArray = Object.keys(commentsData).map(commentId => ({
        id: commentId,
        ...commentsData[commentId]
      })).sort((a, b) => b.createdAt - a.createdAt);

      setComments(commentsArray);
    });

    // Kiểm tra xem người dùng đã đánh giá bài viết chưa
    if (currentUser) {
      const checkUserRating = async () => {
        const ratingsRef = ref(database, `ratings/${id}`);
        const snapshot = await get(ratingsRef);

        if (snapshot.exists()) {
          const ratingsData = snapshot.val();
          const userRatingEntry = Object.values(ratingsData).find(
            rating => rating.userId === currentUser.uid
          );

          if (userRatingEntry) {
            setUserRating(userRatingEntry.score);
          }
        }
      };

      checkUserRating();
    }

    return () => {
      postUnsubscribe();
      commentsUnsubscribe();
    };
  }, [id, navigate, currentUser]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!commentContent.trim()) {
      setErrorMessage('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      const newCommentRef = push(ref(database, `comments/${id}`));

      await set(newCommentRef, {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Người dùng ẩn danh',
        content: commentContent,
        createdAt: Date.now(),
        parentCommentId: null
      });

      setCommentContent('');
      setErrorMessage('');
    } catch (error) {
      console.error('Lỗi khi thêm bình luận:', error);
      setErrorMessage('Có lỗi xảy ra khi đăng bình luận. Vui lòng thử lại sau.');
    }
  };

  const handleRating = async (rating) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      // Lưu đánh giá vào database
      const ratingData = {
        userId: currentUser.uid,
        score: rating,
        createdAt: Date.now()
      };

      // Kiểm tra xem người dùng đã đánh giá trước đó chưa
      const ratingsRef = ref(database, `ratings/${id}`);
      const snapshot = await get(ratingsRef);

      if (snapshot.exists()) {
        const ratingsData = snapshot.val();
        const existingRatingKey = Object.keys(ratingsData).find(
          key => ratingsData[key].userId === currentUser.uid
        );

        if (existingRatingKey) {
          // Cập nhật đánh giá hiện có
          await update(ref(database, `ratings/${id}/${existingRatingKey}`), {
            score: rating,
            createdAt: Date.now()
          });
        } else {
          // Thêm đánh giá mới
          await push(ref(database, `ratings/${id}`), ratingData);
        }
      } else {
        // Thêm đánh giá đầu tiên
        await push(ref(database, `ratings/${id}`), ratingData);
      }

      // Cập nhật trung bình đánh giá và số lượng đánh giá
      const updatedSnapshot = await get(ratingsRef);
      const ratings = updatedSnapshot.val() || {};
      const ratingValues = Object.values(ratings);
      const totalScore = ratingValues.reduce((sum, r) => sum + r.score, 0);
      const ratingCount = ratingValues.length;
      const averageRating = totalScore / ratingCount;

      await update(ref(database, `posts/${id}`), {
        averageRating,
        ratingCount
      });

      setUserRating(rating);
    } catch (error) {
      console.error('Lỗi khi đánh giá:', error);
      setErrorMessage('Có lỗi xảy ra khi đánh giá. Vui lòng thử lại sau.');
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="post-detail-container fade-in">
      <div className="post-detail-wrapper">
        <article className="post-detail">
          <header className="post-detail-header">
            <h1 className="post-detail-title">{post.title}</h1>
            <div className="post-detail-meta">
              <div className="post-detail-author">
                <i className="fas fa-user"></i> {post.authorName || 'Người dùng ẩn danh'}
              </div>
              {post.category && (
                <div className="post-detail-category">
                  <i className="fas fa-folder"></i> {post.category}
                </div>
              )}
              <div className="post-detail-date">
                <i className="far fa-calendar-alt"></i> {formatDate(post.createdAt)}
              </div>
            </div>
          </header>

          {post.imageUrl && (
            <div className="post-detail-image-container">
              <img src={post.imageUrl} alt={post.title} className="post-detail-image" />
            </div>
          )}

          <div className="post-detail-content">
            {post.content.split('\n').map((paragraph, i) => (
              paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
            ))}
          </div>

          <div className="post-detail-footer">
            <div className="post-detail-stats">
              <span><i className="far fa-eye"></i> {post.viewCount || 0} lượt xem</span>
              <span><i className="far fa-star"></i> {post.averageRating ? `${post.averageRating.toFixed(1)}/5 (${post.ratingCount} lượt)` : 'Chưa có đánh giá'}</span>
            </div>

            <div className="post-detail-tags">
              {post.tags && post.tags.split(',').map((tag, index) => (
                <span key={index} className="post-detail-tag">{tag.trim()}</span>
              ))}
            </div>
          </div>

          <div className="rating-section">
            <h3>Đánh giá bài viết</h3>
            <div className="rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${(hoverRating || userRating) >= star ? 'filled' : ''}`}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
            {userRating > 0 && <p>Đánh giá của bạn: {userRating}/5</p>}
          </div>
        </article>

        <section className="comments-section">
          <h2 className="comments-header">Bình luận ({comments.length})</h2>

          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <div className="form-group">
              <label htmlFor="comment">Để lại bình luận của bạn:</label>
              <textarea
                id="comment"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder={currentUser ? "Nhập bình luận của bạn..." : "Đăng nhập để bình luận..."}
                disabled={!currentUser}
              ></textarea>
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit" className="btn btn-primary" disabled={!currentUser}>
              <i className="fas fa-paper-plane"></i> Đăng bình luận
            </button>
          </form>

          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div className="comment" key={comment.id}>
                  <div className="comment-header">
                    <div className="comment-author">
                      <div className="comment-author-avatar">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                      <span>{comment.userName}</span>
                    </div>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                </div>
              ))
            ) : (
              <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PostDetail;
