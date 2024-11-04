import { create } from 'zustand';
import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db, Usuario } from '../lib/firebase';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

interface UsuariosState {
  usuarios: Usuario[];
  loading: boolean;
  fetchUsuarios: () => Promise<void>;
  addUsuario: (usuario: Omit<Usuario, 'id'>) => Promise<void>;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => Promise<void>;
  deleteUsuario: (id: string) => Promise<void>;
}

export const useUsuariosStore = create<UsuariosState>((set, get) => ({
  usuarios: [],
  loading: false,
  fetchUsuarios: async () => {
    set({ loading: true });
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'usuarios'), orderBy('nome'))
      );
      const usuarios = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataCadastro: doc.data().dataCadastro?.toDate()
      })) as Usuario[];
      set({ usuarios });
    } catch (error: any) {
      toast.error('Erro ao carregar usuários: ' + error.message);
    } finally {
      set({ loading: false });
    }
  },
  addUsuario: async (usuario) => {
    try {
      // Registra o usuário no Authentication e no Firestore
      await useAuthStore.getState().signUp(
        usuario.nome,
        usuario.email,
        'senha123', // Senha padrão inicial
        usuario.tipo
      );
      toast.success('Usuário adicionado com sucesso!');
      get().fetchUsuarios();
    } catch (error: any) {
      toast.error('Erro ao adicionar usuário: ' + error.message);
      throw error;
    }
  },
  updateUsuario: async (id, usuario) => {
    try {
      await updateDoc(doc(db, 'usuarios', id), {
        ...usuario,
        dataAtualizacao: new Date()
      });
      toast.success('Usuário atualizado com sucesso!');
      get().fetchUsuarios();
    } catch (error: any) {
      toast.error('Erro ao atualizar usuário: ' + error.message);
      throw error;
    }
  },
  deleteUsuario: async (id) => {
    try {
      await deleteDoc(doc(db, 'usuarios', id));
      toast.success('Usuário removido com sucesso!');
      get().fetchUsuarios();
    } catch (error: any) {
      toast.error('Erro ao remover usuário: ' + error.message);
      throw error;
    }
  }
}));