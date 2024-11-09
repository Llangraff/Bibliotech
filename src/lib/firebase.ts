import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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