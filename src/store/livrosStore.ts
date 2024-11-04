import { create } from 'zustand';
import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, Livro } from '../lib/firebase';
import toast from 'react-hot-toast';

interface LivrosState {
  livros: Livro[];
  loading: boolean;
  fetchLivros: () => Promise<void>;
  addLivro: (livro: Omit<Livro, 'id'>, imagem?: File) => Promise<void>;
  updateLivro: (id: string, livro: Partial<Livro>, imagem?: File) => Promise<void>;
  deleteLivro: (id: string) => Promise<void>;
}

export const useLivrosStore = create<LivrosState>((set, get) => ({
  livros: [],
  loading: false,
  fetchLivros: async () => {
    set({ loading: true });
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'livros'), orderBy('titulo'))
      );
      const livros = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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

      // Adiciona o campo quantidadeDisponivel igual à quantidadeTotal inicialmente
      await addDoc(collection(db, 'livros'), {
        ...livro,
        imagemUrl,
        quantidadeDisponivel: livro.quantidadeTotal,
        dataCadastro: new Date()
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

      // Certifique-se de atualizar a quantidadeDisponivel se necessário
      await updateDoc(doc(db, 'livros', id), {
        ...livro,
        imagemUrl,
        dataAtualizacao: new Date()
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
  }
}));
