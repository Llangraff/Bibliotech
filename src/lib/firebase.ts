import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, addDoc, orderBy, query, deleteDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import toast from 'react-hot-toast';

const firebaseConfig = {
  apiKey: "AIzaSyDRlTBDL6Knmd3-oFB_QCwiStt1_XhDRj0",
  authDomain: "tcc-biblioteca-63020.firebaseapp.com",
  projectId: "tcc-biblioteca-63020",
  storageBucket: "tcc-biblioteca-63020.firebasestorage.app",
  messagingSenderId: "457169560865",
  appId: "1:457169560865:web:fb1d0c9a59552a048f0a60"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Interface para a coleção de usuários
export interface Usuario {
  id?: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'usuario';
  status: 'ativo' | 'inativo';
  dataCadastro: Date;
}

// Interface para a coleção de livros
export interface Livro {
  id?: string;
  titulo: string;
  autorId: string;
  isbn: string;
  categoria: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
  status: 'disponível' | 'inativo' | 'emprestado';
}

// Interface para a coleção de autores
export interface Autor {
  id?: string;
  nome: string;
  nacionalidade: string;
  biografia: string;
  imagemUrl?: string;
}

// Interface para a coleção de empréstimos
export interface Emprestimo {
  id?: string;
  usuarioId: string;
  livroId: string;
  dataEmprestimo: Date;
  dataDevolucaoPrevista: Date;
  dataDevolucaoEfetiva?: Date;
  status: 'ativo' | 'devolvido';
}

// Interface para backup
export interface Backup {
  id?: string;
  timestamp: Date;
  data: {
    usuarios: Usuario[];
    livros: Livro[];
    autores: Autor[];
    emprestimos: Emprestimo[];
  };
  createdBy: string;
  fileName: string;
}

// Função para verificar e armazenar o tipo de usuário no Firestore
export const storeUserData = async (userId: string, nome: string, email: string, tipo: 'admin' | 'usuario') => {
  const userDocRef = doc(db, 'usuarios', userId);

  // Verifica se o documento já existe
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      nome,
      email,
      tipo,
      status: 'ativo',
      dataCadastro: new Date()
    });
  }
};

// Observador de autenticação para gerenciar o estado do usuário
export const onAuthChange = (callback: (user: Usuario | null) => void) => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Busca o tipo de usuário e status no Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as Usuario;
        callback({
          ...userData,
          id: firebaseUser.uid
        });
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Função de backup para exportar dados do Firestore para JSON
export async function backupFirestoreData(userId: string) {
  try {
    // Coleções principais para o backup
    const collections = ['usuarios', 'livros', 'emprestimos', 'autores'];
    const backupData: any = { usuarios: [], livros: [], emprestimos: [], autores: [] };

    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      backupData[collectionName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Estrutura do backup
    const backup: Backup = {
      timestamp: new Date(),
      data: backupData,
      createdBy: userId,
      fileName: `backup_${new Date().toISOString().split('T')[0]}.json`
    };

    // Salvar backup no Firestore
    await addDoc(collection(db, 'backups'), backup);
    toast.success('Backup criado com sucesso!');
  } catch (error: any) {
    toast.error('Erro ao criar backup: ' + error.message);
  }
}

// Função para baixar o backup como JSON
export function downloadBackup(backup: Backup) {
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
}

// Função para buscar todos os backups
export async function fetchBackups() {
  const querySnapshot = await getDocs(query(collection(db, 'backups'), orderBy('timestamp', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate()
  })) as Backup[];
}

// Função para excluir backup
export async function deleteBackup(id: string) {
  await deleteDoc(doc(db, 'backups', id));
  toast.success('Backup excluído com sucesso!');
}
