import { create } from 'zustand';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  userData: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (nome: string, email: string, password: string, tipo?: string) => Promise<void>;
  updateUserData: () => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userData: null,
  loading: true,

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getDoc(doc(db, 'usuarios', userCredential.user.uid));
      set({ user: userCredential.user, userData: userData.data(), loading: false });
    } catch (error: any) {
      set({ loading: false });
      toast.error('Erro ao fazer login: ' + error.message);
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await firebaseSignOut(auth);
      set({ user: null, userData: null, loading: false });
    } catch (error: any) {
      set({ loading: false });
      toast.error('Erro ao fazer logout: ' + error.message);
      throw error;
    }
  },

  signUp: async (nome, email, password, tipo = 'usuario') => {
    set({ loading: true });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: nome });
      
      const userData = {
        nome,
        email,
        tipo,
        status: 'ativo',
        dataCadastro: new Date(),
      };

      await setDoc(doc(db, 'usuarios', userCredential.user.uid), userData);
      set({ user: userCredential.user, userData, loading: false });
    } catch (error: any) {
      set({ loading: false });
      toast.error('Erro ao criar conta: ' + error.message);
      throw error;
    }
  },

  updateUserData: async () => {
    const { user } = get();
    if (user) {
      const userData = await getDoc(doc(db, 'usuarios', user.uid));
      set({ userData: userData.data() });
    }
  },

  isAdmin: () => {
    const { userData } = get();
    return userData?.tipo === 'admin';
  },
}));

// Listener para mudanças no estado de autenticação
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userData = await getDoc(doc(db, 'usuarios', user.uid));
    useAuthStore.setState({ user, userData: userData.data(), loading: false });
  } else {
    useAuthStore.setState({ user: null, userData: null, loading: false });
  }
});
