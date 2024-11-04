import { create } from 'zustand';
import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, Emprestimo, Livro } from '../lib/firebase';
import { useLivrosStore } from './livrosStore';
import toast from 'react-hot-toast';

interface EmprestimosState {
  emprestimos: Emprestimo[];
  loading: boolean;
  fetchEmprestimos: () => Promise<void>;
  realizarEmprestimo: (livroId: string, usuarioId: string, dataDevolucaoPrevista: Date) => Promise<void>;
  realizarDevolucao: (emprestimoId: string) => Promise<void>;
  cancelarEmprestimo: (emprestimoId: string) => Promise<void>;
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
        ...doc.data(),
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
  realizarEmprestimo: async (livroId, usuarioId, dataDevolucaoPrevista) => {
    try {
      // Verifica disponibilidade do livro
      const livroRef = doc(db, 'livros', livroId);
      const livroDoc = await livroRef.get();
      const livro = livroDoc.data() as Livro;

      if (livro.quantidadeDisponivel <= 0) {
        throw new Error('Livro não disponível para empréstimo');
      }

      // Cria o empréstimo
      const novoEmprestimo = {
        livroId,
        usuarioId,
        dataEmprestimo: new Date(),
        dataDevolucaoPrevista,
        status: 'ativo'
      };

      await addDoc(collection(db, 'emprestimos'), novoEmprestimo);

      // Atualiza a quantidade disponível do livro
      await updateDoc(livroRef, {
        quantidadeDisponivel: livro.quantidadeDisponivel - 1,
        status: livro.quantidadeDisponivel - 1 === 0 ? 'emprestado' : 'disponível'
      });

      toast.success('Empréstimo realizado com sucesso!');
      get().fetchEmprestimos();
      useLivrosStore.getState().fetchLivros();
    } catch (error: any) {
      toast.error('Erro ao realizar empréstimo: ' + error.message);
      throw error;
    }
  },
  realizarDevolucao: async (emprestimoId) => {
    try {
      const emprestimoRef = doc(db, 'emprestimos', emprestimoId);
      const emprestimoDoc = await emprestimoRef.get();
      const emprestimo = emprestimoDoc.data() as Emprestimo;

      // Atualiza o empréstimo
      await updateDoc(emprestimoRef, {
        status: 'devolvido',
        dataDevolucaoEfetiva: new Date()
      });

      // Atualiza a quantidade disponível do livro
      const livroRef = doc(db, 'livros', emprestimo.livroId);
      const livroDoc = await livroRef.get();
      const livro = livroDoc.data() as Livro;

      await updateDoc(livroRef, {
        quantidadeDisponivel: livro.quantidadeDisponivel + 1,
        status: 'disponível'
      });

      toast.success('Devolução realizada com sucesso!');
      get().fetchEmprestimos();
      useLivrosStore.getState().fetchLivros();
    } catch (error: any) {
      toast.error('Erro ao realizar devolução: ' + error.message);
      throw error;
    }
  },
  cancelarEmprestimo: async (emprestimoId) => {
    try {
      const emprestimoRef = doc(db, 'emprestimos', emprestimoId);
      const emprestimoDoc = await emprestimoRef.get();
      const emprestimo = emprestimoDoc.data() as Emprestimo;

      // Atualiza o empréstimo
      await updateDoc(emprestimoRef, {
        status: 'cancelado',
        dataDevolucaoEfetiva: new Date()
      });

      // Atualiza a quantidade disponível do livro
      const livroRef = doc(db, 'livros', emprestimo.livroId);
      const livroDoc = await livroRef.get();
      const livro = livroDoc.data() as Livro;

      await updateDoc(livroRef, {
        quantidadeDisponivel: livro.quantidadeDisponivel + 1,
        status: 'disponível'
      });

      toast.success('Empréstimo cancelado com sucesso!');
      get().fetchEmprestimos();
      useLivrosStore.getState().fetchLivros();
    } catch (error: any) {
      toast.error('Erro ao cancelar empréstimo: ' + error.message);
      throw error;
    }
  }
}));