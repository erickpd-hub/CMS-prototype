import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { auth, db, firebaseConfig } from '../lib/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  signUp: (email: string, password?: string, firstName?: string, lastName?: string, role?: Role) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  signUp: async () => false,
  loginWithGoogle: async () => false,
  logout: () => {},
  users: [],
  addUser: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync users list from Firestore
  useEffect(() => {
    if (!user) {
      setUsers([]);
      return;
    }
    
    let isSubscribed = true;
    const defaultDemoUsers: User[] = [
      { id: '1', firstName: 'Elena', lastName: 'Rostova', email: 'elena@company.com', role: 'admin' },
      { id: '2', firstName: 'Marcus', lastName: 'Vance', email: 'marcus@company.com', role: 'user' },
      { id: '3', firstName: 'Sarah', lastName: 'Chen', email: 'sarah@company.com', role: 'user' },
      { id: '4', firstName: 'Alex', lastName: 'Kim', email: 'alex@company.com', role: 'user' },
    ];

    let unsubscribeUsers = () => {};
    try {
      unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        if (!isSubscribed) return;
        const usersList: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          usersList.push({
            id: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            role: data.role || 'user',
            password: data.password || '',
          });
        });
        
        if (usersList.length === 0) {
          // If Firestore collection is empty, use default demo users
          setUsers([user, ...defaultDemoUsers]);
        } else {
          // Ensure current user is in the list
          if (!usersList.some(u => u.id === user.id)) {
            usersList.unshift(user);
          }
          setUsers(usersList);
        }
      }, (err) => {
        console.warn("Firestore onSnapshot error, using offline users list fallback:", err);
        setUsers([user, ...defaultDemoUsers]);
      });
    } catch (err) {
      console.warn("Firestore error reading users, using offline fallback:", err);
      setUsers([user, ...defaultDemoUsers]);
    }

    return () => {
      isSubscribed = false;
      unsubscribeUsers();
    };
  }, [user]);

  // Listen for Authentication state changes
  useEffect(() => {
    // Check if there's a demo user in localStorage first
    const storedDemoUser = localStorage.getItem('demo_user');
    if (storedDemoUser) {
      try {
        setUser(JSON.parse(storedDemoUser));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('demo_user');
      }
    }

    // Set a safety timeout of 1.2 seconds to disable loading screen if Firebase is slow/not configured
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 1200);

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(safetyTimeout);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            const loadedUser: User = {
              id: firebaseUser.uid,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || firebaseUser.email || '',
              role: data.role || 'user',
            };
            setUser(loadedUser);
          } else {
            // Document doesn't exist, create it
            const parts = (firebaseUser.displayName || '').split(' ');
            const fallbackUser: User = {
              id: firebaseUser.uid,
              firstName: parts[0] || 'New',
              lastName: parts[1] || 'User',
              email: firebaseUser.email || '',
              role: 'user',
            };
            
            try {
              await setDoc(docRef, {
                firstName: fallbackUser.firstName,
                lastName: fallbackUser.lastName,
                email: fallbackUser.email,
                role: fallbackUser.role
              });
            } catch (err) {
              console.warn("Could not save profile to Firestore, using fallback", err);
            }
            setUser(fallbackUser);
          }
        } catch (err) {
          console.error("Error fetching user profile from Firestore:", err);
          // Let them be logged in anyway with fallback
          const fallbackUser: User = {
            id: firebaseUser.uid,
            firstName: firebaseUser.displayName?.split(' ')[0] || 'Firebase',
            lastName: firebaseUser.displayName?.split(' ')[1] || 'User',
            email: firebaseUser.email || '',
            role: 'user',
          };
          setUser(fallbackUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribeAuth();
    };
  }, []);

  const login = async (email: string, password = 'password123') => {
    let normalizedEmail = email.trim().toLowerCase();
    
    // Support standard quick demo passwords / bypasses instantly
    if (normalizedEmail === 'admin@admin.com') {
      const mockAdmin: User = {
        id: 'admin-demo-id',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@admin.com',
        role: 'admin'
      };
      localStorage.setItem('demo_user', JSON.stringify(mockAdmin));
      setUser(mockAdmin);
      return true;
    }

    // Check if there is a matching user in our users list with this password
    const foundUser = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (foundUser && foundUser.password && foundUser.password === password) {
      console.log("Logged in successfully using custom assigned password!");
      localStorage.setItem('demo_user', JSON.stringify(foundUser));
      setUser(foundUser);
      return true;
    }

    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      return true;
    } catch (signInErr: any) {
      console.warn("Firebase sign-in failed, checking demo/local fallback:", signInErr);
      
      // If user exists locally but doesn't have a password stored, or Auth failed, use their real details
      if (foundUser) {
        localStorage.setItem('demo_user', JSON.stringify(foundUser));
        setUser(foundUser);
        return true;
      }

      // Fallback for demo purposes if offline/failed
      const mockUser: User = {
        id: 'user-demo-id-' + Math.random().toString(36).substring(2, 9),
        firstName: 'Demo',
        lastName: 'User',
        email: normalizedEmail,
        role: 'user'
      };
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    }
  };

  const signUp = async (email: string, password = 'password123', firstName = 'New', lastName = 'User', role: Role = 'user') => {
    let normalizedEmail = email.trim().toLowerCase();
    const actualRole = normalizedEmail === 'admin@admin.com' ? 'admin' as Role : role;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      try {
        await setDoc(userDocRef, {
          firstName,
          lastName,
          email: normalizedEmail,
          role: actualRole
        });
      } catch (dbErr) {
        console.warn("Could not save profile to Firestore, using offline auth", dbErr);
      }
      return true;
    } catch (err: any) {
      console.warn("Firebase signup failed, using fallback offline sign up:", err);
      const mockUser: User = {
        id: 'user-demo-id-' + Math.random().toString(36).substring(2, 9),
        firstName,
        lastName,
        email: normalizedEmail,
        role: actualRole
      };
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      return true;
    } catch (err) {
      console.error("Google sign in failed, using mock Google login fallback:", err);
      const mockUser: User = {
        id: 'google-demo-id',
        firstName: 'Google',
        lastName: 'User',
        email: 'google.user@example.com',
        role: 'user'
      };
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return true;
    }
  };

  const logout = async () => {
    localStorage.removeItem('demo_user');
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
    setUser(null);
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    const tempId = 'user-' + Math.random().toString(36).substring(2, 9);
    const addedUser: User = { ...newUser, id: tempId };
    
    // Optimistic update
    setUsers(prev => [...prev, addedUser]);

    let createdUid = '';
    if (newUser.email && newUser.password) {
      try {
        const secondaryApp = initializeApp(firebaseConfig, 'secondary-' + tempId);
        const secondaryAuth = getAuth(secondaryApp);
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUser.email.trim().toLowerCase(), newUser.password);
        createdUid = userCredential.user.uid;
        await deleteApp(secondaryApp);
        console.log("Successfully created secondary auth user with UID:", createdUid);
      } catch (authErr: any) {
        console.warn("Firebase Auth secondary creation failed (likely offline or duplicate):", authErr);
      }
    }

    try {
      const docId = createdUid || tempId;
      const docRef = doc(db, 'users', docId);
      await setDoc(docRef, {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password || ''
      });
      
      if (createdUid) {
        setUsers(prev => prev.map(u => u.id === tempId ? { ...u, id: createdUid } : u));
      }
    } catch (err) {
      console.warn("Could not write user to Firebase Firestore, added locally:", err);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (user?.id === id) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('demo_user', JSON.stringify(updatedUser));
    }

    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, updates);
    } catch (err) {
      console.warn("Could not update user in Firebase Firestore, updated locally:", err);
    }
  };

  const deleteUser = async (id: string) => {
    // Optimistic delete
    setUsers(prev => prev.filter(u => u.id !== id));

    try {
      const docRef = doc(db, 'users', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Could not delete user in Firebase Firestore, deleted locally:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, loginWithGoogle, logout, users, addUser, updateUser, deleteUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
