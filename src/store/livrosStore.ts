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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import toast from 'react-hot-toast';

// Atualize a interface Livro para incluir o status "inativo"
export interface Livro {
  id?: string;
  titulo: string;
  autorId: string;
  isbn: string;
  categoria: string;
  imagemUrl?: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  status: 'disponível' | 'emprestado' | 'inativo'; // Adicionando "inativo" como status válido
  dataCadastro?: Date;
  dataAtualizacao?: Date;
}

interface LivrosState {
  livros: Livro[];
  loading: boolean;
  fetchLivros: () => Promise<void>;
  addLivro: (livro: Omit<Livro, 'id'>, imagem?: File) => Promise<void>;
  updateLivro: (id: string, livro: Partial<Livro>, imagem?: File) => Promise<void>;
  deleteLivro: (id: string) => Promise<void>;
  toggleLivroStatus: (id: string) => Promise<void>; // Alternar o status entre "disponível" e "inativo"
}

export const useLivrosStore = create<LivrosState>((set, get) => ({
  livros: [],
  loading: false,
  
  fetchLivros: async () => {
    set({ loading: true });
    try {
      const querySnapshot = await getDocs(query(collection(db, 'livros'), orderBy('titulo')));
      const livros = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Livro[];
      set({ livros });
    } catch (error: any) {
      toast.error('Erro ao carregar livros: ' + error.message);
    } finally {
      set({ loading: false });
    }
  },

  addLivro: async (livro, imagem) => {
    try {
      let imagemUrl = '';
      if (imagem) {
        const storageRef = ref(storage, `livros/${imagem.name}`);
        await uploadBytes(storageRef, imagem);
        imagemUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'livros'), {
        ...livro,
        imagemUrl,
        quantidadeDisponivel: livro.quantidadeTotal,
        status: 'disponível',
        dataCadastro: new Date(),
      });

      toast.success('Livro adicionado com sucesso!');
      get().fetchLivros();
    } catch (error: any) {
      toast.error('Erro ao adicionar livro: ' + error.message);
      throw error;
    }
  },

  updateLivro: async (id, livro, imagem) => {
    try {
      let imagemUrl = livro.imagemUrl;
      if (imagem) {
        const storageRef = ref(storage, `livros/${imagem.name}`);
        await uploadBytes(storageRef, imagem);
        imagemUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, 'livros', id), {
        ...livro,
        imagemUrl,
        dataAtualizacao: new Date(),
      });

      toast.success('Livro atualizado com sucesso!');
      get().fetchLivros();
    } catch (error: any) {
      toast.error('Erro ao atualizar livro: ' + error.message);
      throw error;
    }
  },

  deleteLivro: async (id) => {
    try {
      await deleteDoc(doc(db, 'livros', id));
      toast.success('Livro removido com sucesso!');
      get().fetchLivros();
    } catch (error: any) {
      toast.error('Erro ao remover livro: ' + error.message);
      throw error;
    }
  },

  toggleLivroStatus: async (id) => {
    try {
      const livro = get().livros.find((livro) => livro.id === id);
      if (!livro) {
        throw new Error('Livro não encontrado');
      }

      const newStatus = livro.status === 'inativo' ? 'disponível' : 'inativo';
      await updateDoc(doc(db, 'livros', id), { status: newStatus });

      // Atualiza o estado local para refletir a mudança no status
      set((state) => ({
        livros: state.livros.map((livro) =>
          livro.id === id ? { ...livro, status: newStatus } : livro
        ),
      }));

      toast.success(`Livro ${newStatus === 'inativo' ? 'desativado' : 'ativado'} com sucesso!`);
    } catch (error: any) {
      toast.error('Erro ao alternar status do livro: ' + error.message);
      throw error;
    }
  },
}));
