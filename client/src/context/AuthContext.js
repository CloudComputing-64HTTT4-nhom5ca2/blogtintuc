import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Cập nhật displayName
      await firebaseUpdateProfile(user, { displayName });

      // Lưu thông tin người dùng vào Realtime Database
      await set(ref(database, `users/${user.uid}`), {
        email: user.email,
        displayName,
        role: 'user',
        createdAt: Date.now()
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function getUserRole(uid) {
    try {
      const userSnapshot = await get(ref(database, `users/${uid}`));
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        console.log("Firebase user data:", userData);
        console.log("User role:", userData.role || 'user');
        return userData.role || 'user';
      }
      console.log("User not found in database, defaulting to 'user' role");
      return 'user';
    } catch (error) {
      console.error('Lỗi khi lấy vai trò người dùng:', error);
      return 'user';
    }
  }

  const updateProfile = async (profileData) => {
    if (currentUser) {
      await firebaseUpdateProfile(currentUser, profileData);
      setCurrentUser({ ...currentUser, ...profileData });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
        setCurrentUser(user);
        setUserRole(role);
        console.log("Auth state changed - User:", user.email, "Role:", role);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        console.log("Auth state changed - User signed out");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userRole,
    register,
    login,
    logout,
    isAdmin: userRole === 'admin',
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
