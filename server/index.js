const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Phục vụ tệp tĩnh từ thư mục client-build
app.use(express.static(path.join(__dirname, '../client-build')));

// Khởi tạo Firebase Admin
// Lưu ý: Trong môi trường thực tế, bạn cần tệp service account JSON
// Bạn có thể sử dụng process.env.GOOGLE_APPLICATION_CREDENTIALS hoặc tạo tệp json trong server/config
// Ví dụ: const serviceAccount = require('./config/webappp-123456-abc123.json');
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://webappp-123456-default-rtdb.firebaseio.com',
    storageBucket: process.env.GCS_BUCKET || 'webappp-images'
  });
  console.log('Firebase Admin đã được khởi tạo thành công');
} catch (error) {
  console.error('Lỗi khởi tạo Firebase Admin:', error);
}

const db = admin.database();
const bucket = admin.storage().bucket();

// API lấy tất cả bài viết
app.get('/api/posts', async (req, res) => {
  try {
    const snapshot = await db.ref('posts').once('value');
    const posts = snapshot.val() || {};
    res.json(Object.keys(posts).map(id => ({ id, ...posts[id] })));
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// API lấy chi tiết bài viết
app.get('/api/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const snapshot = await db.ref(`posts/${postId}`).once('value');

    if (!snapshot.exists()) {
      return res.status(404).send('Không tìm thấy bài viết');
    }

    // Tăng lượt xem
    await db.ref(`posts/${postId}/viewCount`).transaction(viewCount => {
      return (viewCount || 0) + 1;
    });

    // Lấy bình luận
    const commentsSnapshot = await db.ref(`comments/${postId}`).once('value');
    const comments = commentsSnapshot.val() || {};

    const post = snapshot.val();
    res.json({
      id: postId,
      ...post,
      comments: Object.keys(comments).map(id => ({ id, ...comments[id] }))
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// API thêm bình luận
app.post('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, userId, userName } = req.body;

    if (!content || !userId || !userName) {
      return res.status(400).send('Thiếu thông tin bình luận');
    }

    const commentId = db.ref(`comments/${postId}`).push().key;
    const comment = {
      userId,
      userName,
      content,
      createdAt: admin.database.ServerValue.TIMESTAMP,
      parentCommentId: null
    };

    await db.ref(`comments/${postId}/${commentId}`).set(comment);
    res.json({ id: commentId, ...comment });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// API đánh giá
app.post('/api/posts/:postId/ratings', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, score } = req.body;

    if (!userId || !score || score < 1 || score > 5) {
      return res.status(400).send('Thông tin đánh giá không hợp lệ');
    }

    const ratingId = db.ref(`ratings/${postId}`).push().key;
    const rating = {
      userId,
      score,
      createdAt: admin.database.ServerValue.TIMESTAMP
    };

    await db.ref(`ratings/${postId}/${ratingId}`).set(rating);

    // Cập nhật averageRating và ratingCount
    const ratingsSnapshot = await db.ref(`ratings/${postId}`).once('value');
    const ratings = ratingsSnapshot.val() || {};
    const totalScore = Object.values(ratings).reduce((sum, r) => sum + r.score, 0);
    const ratingCount = Object.keys(ratings).length;

    await db.ref(`posts/${postId}`).update({
      averageRating: totalScore / ratingCount,
      ratingCount
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Middleware kiểm tra admin
const checkAdminRole = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).send('Unauthorized');
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const userSnapshot = await db.ref(`users/${decoded.uid}`).once('value');

    if (userSnapshot.exists() && userSnapshot.val().role === 'admin') {
      req.user = decoded;
      next();
    } else {
      res.status(403).send('Forbidden');
    }
  } catch (error) {
    res.status(401).send(error.message);
  }
};

// API đăng bài (admin)
app.post('/api/admin/posts', checkAdminRole, async (req, res) => {
  try {
    const { title, content, category, tags, imageUrl } = req.body;

    if (!title || !content || !category) {
      return res.status(400).send('Thiếu thông tin bài viết');
    }

    const postId = db.ref('posts').push().key;
    const post = {
      title,
      content,
      author: req.user.uid,
      authorName: req.user.name || 'Admin',
      category,
      tags: tags || [],
      imageUrl: imageUrl || '',
      createdAt: admin.database.ServerValue.TIMESTAMP,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
      viewCount: 0,
      averageRating: 0,
      ratingCount: 0
    };

    await db.ref(`posts/${postId}`).set(post);
    res.json({ id: postId, ...post });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// API sửa bài (admin)
app.put('/api/admin/posts/:postId', checkAdminRole, async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, category, tags, imageUrl } = req.body;
    const postSnapshot = await db.ref(`posts/${postId}`).once('value');

    if (!postSnapshot.exists()) {
      return res.status(404).send('Không tìm thấy bài viết');
    }

    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (category) updates.category = category;
    if (tags) updates.tags = tags;
    if (imageUrl) updates.imageUrl = imageUrl;
    updates.updatedAt = admin.database.ServerValue.TIMESTAMP;

    await db.ref(`posts/${postId}`).update(updates);

    const updatedSnapshot = await db.ref(`posts/${postId}`).once('value');
    res.json({ id: postId, ...updatedSnapshot.val() });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// API xóa bài (admin)
app.delete('/api/admin/posts/:postId', checkAdminRole, async (req, res) => {
  try {
    const { postId } = req.params;
    const postSnapshot = await db.ref(`posts/${postId}`).once('value');

    if (!postSnapshot.exists()) {
      return res.status(404).send('Không tìm thấy bài viết');
    }

    // Xóa bài viết và dữ liệu liên quan
    const updates = {};
    updates[`posts/${postId}`] = null;
    updates[`comments/${postId}`] = null;
    updates[`ratings/${postId}`] = null;

    await db.ref().update(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Tất cả các tuyến đường không được xử lý sẽ trả về React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client-build/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
