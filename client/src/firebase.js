import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Firebase configuration
// Lưu ý: Trong môi trường thực tế, bạn nên sử dụng biến môi trường trong .env.local
const firebaseConfig = {
  apiKey: "AIzaSyAUcirVhDw4T2_lmJPc9x6mqQsN_ZVdtvg",
  authDomain: "webappp-460509.firebaseapp.com",
  projectId: "webappp-460509",
  storageBucket: "webappp-460509.firebasestorage.app",
  messagingSenderId: "93271699082",
  appId: "1:93271699082:web:d3790cbd7c84c3df1b4773"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ Firebase
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export default app;
