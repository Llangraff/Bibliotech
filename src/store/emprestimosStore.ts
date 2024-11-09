import { create } from 'zustand';
import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy} from 'firebase/firestore';
import { db, Emprestimo } from '../lib/firebase';
import { useLivrosStore } from './livrosStore';
import toast from 'react-hot-toast';

interface EmprestimosState {
  emprestimos: Emprestimo[];
  loading: boolean;
  fetchEmprestimos: () => Promise<void>;
  addEmprestimo: (emprestimo: Omit<Emprestimo, 'id'>) => Promise<void>;
  updateEmprestimo: (id: string, emprestimo: Partial<Emprestimo>) => Promise<void>;
  deleteEmprestimo: (id: string) => Promise<void>;
  devolverLivro: (emprestimoId: string) => Promise<void>;
}

export const useEmprestimosStore = create<EmprestimosState>((set, get) => ({
  emprestimos: [],
  loading: false,

  fetchEmprestimos: async () => {
    set({ loading: true });
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'emprestimos'), orderBy('dataEmprestimo', 'desc'))
      );
      const emprestimos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Emprestimo, 'id'>), // Casting para o tipo Emprestimo, exceto o id
        dataEmprestimo: doc.data().dataEmprestimo?.toDate(),
        dataDevolucaoPrevista: doc.data().dataDevolucaoPrevista?.toDate(),
        dataDevolucaoEfetiva: doc.data().dataDevolucaoEfetiva?.toDate()
      })) as Emprestimo[];
      set({ emprestimos });
    } catch (error: any) {
      toast.error('Erro ao carregar empréstimos: ' + error.message);
    } finally {
      set({ loading: false });
    }
  },

  addEmprestimo: async (emprestimo) => {
    try {
      // Verifica disponibilidade do livro
      const livrosStore = useLivrosStore.getState();
      const livro = livrosStore.livros.find(l => l.id === emprestimo.livroId);
      
      if (!livro) {
        throw new Error('Livro não encontrado');
      }

      if (livro.status === 'inativo') {
        throw new Error('O livro está inativo e não pode ser emprestado');
      }

      if (livro.quantidadeDisponivel <= 0) {
        throw new Error('Não há exemplares disponíveis para empréstimo');
      }

      // Verifica se o usuário já tem empréstimos ativos do mesmo livro
      const emprestimosAtivos = get().emprestimos.filter(e => 
        e.usuarioId === emprestimo.usuarioId && 
        e.livroId === emprestimo.livroId && 
        e.status === 'ativo'
      );

      if (emprestimosAtivos.length > 0) {
        throw new Error('Usuário já possui um empréstimo ativo deste livro');
      }

      // Atualiza a quantidade disponível do livro
      if (livro && livro.id) {
        await updateDoc(doc(db, 'livros', livro.id), {
          quantidadeDisponivel: livro.quantidadeDisponivel - 1,
          status: livro.quantidadeDisponivel - 1 === 0 ? 'emprestado' : 'disponível'
        });
      } else {
        throw new Error('ID do livro não encontrado');
      }

      // Cria o empréstimo
      await addDoc(collection(db, 'emprestimos'), {
        ...emprestimo,
        status: 'ativo',
        dataEmprestimo: new Date()
      });

      toast.success('Empréstimo realizado com sucesso!');
      await livrosStore.fetchLivros();
      get().fetchEmprestimos();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  },

  updateEmprestimo: async (id, emprestimo) => {
    try {
      await updateDoc(doc(db, 'emprestimos', id), {
        ...emprestimo,
        dataAtualizacao: new Date()
      });
      toast.success('Empréstimo atualizado com sucesso!');
      get().fetchEmprestimos();
    } catch (error: any) {
      toast.error('Erro ao atualizar empréstimo: ' + error.message);
      throw error;
    }
  },

  deleteEmprestimo: async (id) => {
    try {
      const emprestimo = get().emprestimos.find(e => e.id === id);
      if (!emprestimo) throw new Error('Empréstimo não encontrado');

      if (emprestimo.status === 'ativo') {
        const livrosStore = useLivrosStore.getState();
        const livro = livrosStore.livros.find(l => l.id === emprestimo.livroId);
        
        if (livro && livro.id) {
          await updateDoc(doc(db, 'livros', livro.id), {
            quantidadeDisponivel: livro.quantidadeDisponivel + 1,
            status: 'disponível'
          });
        }
      }

      await deleteDoc(doc(db, 'emprestimos', id));
      toast.success('Empréstimo removido com sucesso!');
      await useLivrosStore.getState().fetchLivros();
      get().fetchEmprestimos();
    } catch (error: any) {
      toast.error('Erro ao remover empréstimo: ' + error.message);
      throw error;
    }
  },

  devolverLivro: async (emprestimoId) => {
    try {
      const emprestimo = get().emprestimos.find(e => e.id === emprestimoId);
      if (!emprestimo) throw new Error('Empréstimo não encontrado');

      const livrosStore = useLivrosStore.getState();
      const livro = livrosStore.livros.find(l => l.id === emprestimo.livroId);
      
      if (!livro || !livro.id) throw new Error('Livro não encontrado ou ID do livro não definido');

      // Atualiza o empréstimo
      await updateDoc(doc(db, 'emprestimos', emprestimoId), {
        status: 'devolvido',
        dataDevolucaoEfetiva: new Date()
      });

      // Atualiza o livro
      await updateDoc(doc(db, 'livros', livro.id), {
        quantidadeDisponivel: livro.quantidadeDisponivel + 1,
        status: 'disponível'
      });

      toast.success('Livro devolvido com sucesso!');
      await livrosStore.fetchLivros();
      get().fetchEmprestimos();
    } catch (error: any) {
      toast.error('Erro ao devolver livro: ' + error.message);
      throw error;
    }
  }
}));
