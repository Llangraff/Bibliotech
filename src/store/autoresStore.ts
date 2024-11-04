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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, Autor } from '../lib/firebase';
import toast from 'react-hot-toast';

interface AutoresState {
  autores: Autor[];
  loading: boolean;
  fetchAutores: () => Promise<void>;
  addAutor: (autor: Omit<Autor, 'id' | 'imagemUrl'>, imagem?: File) => Promise<void>;
  updateAutor: (id: string, autor: Partial<Autor>, imagem?: File) => Promise<void>;
  deleteAutor: (id: string) => Promise<void>;
}

export const useAutoresStore = create<AutoresState>((set, get) => ({
  autores: [],
  loading: false,
  
  fetchAutores: async () => {
    set({ loading: true });
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'autores'), orderBy('nome'))
      );
      const autores = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Autor[];
      set({ autores });
    } catch (error: any) {
      toast.error('Erro ao carregar autores: ' + error.message);
    } finally {
      set({ loading: false });
    }
  },
  
  addAutor: async (autor, imagem) => {
    try {
      let imagemUrl = '';
      if (imagem) {
        const storageRef = ref(storage, `autores/${imagem.name}`);
        await uploadBytes(storageRef, imagem);
        imagemUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'autores'), {
        ...autor,
        imagemUrl,
        dataCadastro: new Date()
      });

      toast.success('Autor adicionado com sucesso!');
      get().fetchAutores();
    } catch (error: any) {
      toast.error('Erro ao adicionar autor: ' + error.message);
      throw error;
    }
  },
  
  updateAutor: async (id, autor, imagem) => {
    try {
      let imagemUrl = autor.imagemUrl || '';
      if (imagem) {
        const storageRef = ref(storage, `autores/${imagem.name}`);
        await uploadBytes(storageRef, imagem);
        imagemUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, 'autores', id), {
        ...autor,
        imagemUrl,
        dataAtualizacao: new Date()
      });

      toast.success('Autor atualizado com sucesso!');
      get().fetchAutores();
    } catch (error: any) {
      toast.error('Erro ao atualizar autor: ' + error.message);
      throw error;
    }
  },
  
  deleteAutor: async (id) => {
    try {
      await deleteDoc(doc(db, 'autores', id));
      toast.success('Autor removido com sucesso!');
      get().fetchAutores();
    } catch (error: any) {
      toast.error('Erro ao remover autor: ' + error.message);
      throw error;
    }
  }
}));
