import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
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
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          role: data.role || 'user',
        });
      });
      setUsers(usersList);
    });

    return () => unsubscribeUsers();
  }, [user]);

  // Listen for Authentication state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
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
            
            await setDoc(docRef, {
              firstName: fallbackUser.firstName,
              lastName: fallbackUser.lastName,
              email: fallbackUser.email,
              role: fallbackUser.role
            });
            setUser(fallbackUser);
          }
        } catch (err) {
          console.error("Error fetching user profile from Firestore:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async (email: string, password = 'password123') => {
    let normalizedEmail = email.trim().toLowerCase();
    
    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      return true;
    } catch (signInErr: any) {
      // If admin@admin.com fails to login due to missing account, auto-create it in Firebase Auth
      if (normalizedEmail === 'admin@admin.com' && password === 'admin123' && (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/invalid-email')) {
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const adminUserObj: User = {
          id: userCredential.user.uid,
          firstName: 'Admin',
          lastName: 'User',
          email: normalizedEmail,
          role: 'admin' as Role
        };
        await setDoc(userDocRef, {
          firstName: adminUserObj.firstName,
          lastName: adminUserObj.lastName,
          email: adminUserObj.email,
          role: adminUserObj.role
        });
        setUser(adminUserObj);
        return true;
      }
      
      console.error("Login failed:", signInErr);
      throw signInErr;
    }
  };

  const signUp = async (email: string, password = 'password123', firstName = 'New', lastName = 'User', role: Role = 'user') => {
    let normalizedEmail = email.trim().toLowerCase();
    const actualRole = normalizedEmail === 'admin@admin.com' ? 'admin' as Role : role;
    
    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, {
      firstName,
      lastName,
      email: normalizedEmail,
      role: actualRole
    });
    return true;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      return true;
    } catch (err) {
      console.error("Google sign in failed:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
    setUser(null);
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    const docRef = doc(collection(db, 'users'));
    await setDoc(docRef, {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role
    });
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, updates);
  };

  const deleteUser = async (id: string) => {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, loginWithGoogle, logout, users, addUser, updateUser, deleteUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
