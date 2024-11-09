import { create } from 'zustand';
import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db, Usuario } from '../lib/firebase';
import toast from 'react-hot-toast';

interface UsuariosState {
  usuarios: Usuario[];
  loading: boolean;
  fetchUsuarios: () => Promise<void>;
  addUsuario: (usuario: Omit<Usuario, 'id' | 'dataCadastro'>) => Promise<void>;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => Promise<void>;
  deleteUsuario: (id: string) => Promise<boolean>; // Modificado para retornar boolean
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
        dataCadastro: doc.data().dataCadastro?.toDate(),
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
      await addDoc(collection(db, 'usuarios'), {
        ...usuario,
        dataCadastro: new Date(), // Adiciona dataCadastro ao criar o usuário
      });
    
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
        dataAtualizacao: new Date(),
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
      // Verifica se o usuário possui empréstimos ativos antes de permitir a exclusão
      const emprestimosSnapshot = await getDocs(
        query(collection(db, 'emprestimos'), where('usuarioId', '==', id), where('status', '==', 'ativo'))
      );

      if (!emprestimosSnapshot.empty) {
        toast.error('O usuário possui empréstimos ativos e não pode ser excluído.');
        return false; // Retorna false se o usuário não puder ser excluído
      }

      await deleteDoc(doc(db, 'usuarios', id));
      get().fetchUsuarios(); // Atualiza a lista de usuários após a exclusão
      return true; // Retorna true se a exclusão foi bem-sucedida
    } catch (error: any) {
      toast.error('Erro ao remover usuário: ' + error.message);
      throw error;
    }
  },
}));
