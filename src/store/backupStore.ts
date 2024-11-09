// src/store/backupStore.ts
import { create } from 'zustand';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, Backup } from '../lib/firebase';
import { useUsuariosStore } from './usuariosStore';
import { useLivrosStore } from './livrosStore';
import { useAutoresStore } from './autoresStore';
import { useEmprestimosStore } from './emprestimosStore';
import toast from 'react-hot-toast';

interface BackupState {
  backups: Backup[];
  loading: boolean;
  createBackup: (userId: string) => Promise<void>;
  fetchBackups: () => Promise<void>;
  deleteBackup: (id: string) => Promise<void>;
  downloadBackup: (backup: Backup) => void;
}

export const useBackupStore = create<BackupState>((set, get) => ({
  backups: [],
  loading: false,

  createBackup: async (userId: string) => {
    try {
      set({ loading: true });

      // Carregar dados das stores antes de criar o backup
      await useUsuariosStore.getState().fetchUsuarios();
      await useLivrosStore.getState().fetchLivros();
      await useAutoresStore.getState().fetchAutores();
      await useEmprestimosStore.getState().fetchEmprestimos();

      // Obter dados das stores e verificar se há valores undefined
      const usuarios = useUsuariosStore.getState().usuarios || [];
      const livros = useLivrosStore.getState().livros || [];
      const autores = useAutoresStore.getState().autores || [];
      const emprestimos = useEmprestimosStore.getState().emprestimos || [];

      // Checar se alguma coleção está vazia ou contém dados indefinidos
      if (!usuarios.length || !livros.length || !autores.length || !emprestimos.length) {
        console.error('Dados das coleções:', { usuarios, livros, autores, emprestimos });
        toast.error('Erro ao criar backup: algumas coleções estão vazias ou possuem valores inválidos.');
        set({ loading: false });
        return;
      }

      // Remover qualquer campo indefinido dos objetos para evitar erros ao salvar no Firestore
      const sanitizeData = (data: any[]) => data.map(item => {
        const sanitizedItem: any = {};
        for (const key in item) {
          if (item[key] !== undefined) {
            sanitizedItem[key] = item[key];
          }
        }
        return sanitizedItem;
      });

      const backupData: Backup = {
        timestamp: new Date(),
        data: {
          usuarios: sanitizeData(usuarios),
          livros: sanitizeData(livros),
          autores: sanitizeData(autores),
          emprestimos: sanitizeData(emprestimos),
        },
        createdBy: userId,
        fileName: `backup_${new Date().toISOString().split('T')[0]}.json`,
      };

      // Adicionar backup ao Firestore
      await addDoc(collection(db, 'backups'), backupData);
      toast.success('Backup criado com sucesso!');
      get().fetchBackups();
    } catch (error: any) {
      console.error('Erro ao criar backup:', error);
      toast.error('Erro ao criar backup: ' + error.message);
    } finally {
      set({ loading: false });
    }
  },

  fetchBackups: async () => {
    try {
      set({ loading: true });
      const querySnapshot = await getDocs(query(collection(db, 'backups'), orderBy('timestamp', 'desc')));
      const backups = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Backup[];
      set({ backups });
    } catch (error: any) {
      toast.error('Erro ao carregar backups: ' + error.message);
    } finally {
      set({ loading: false });
    }
  },

  deleteBackup: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'backups', id));
      toast.success('Backup excluído com sucesso!');
      get().fetchBackups();
    } catch (error: any) {
      toast.error('Erro ao excluir backup: ' + error.message);
    }
  },

  downloadBackup: (backup: Backup) => {
    const dataStr = JSON.stringify(backup.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backup.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
}));
