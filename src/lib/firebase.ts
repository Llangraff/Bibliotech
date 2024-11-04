import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDRlTBDL6Knmd3-oFB_QCwiStt1_XhDRj0",
  authDomain: "tcc-biblioteca-63020.firebaseapp.com",
  projectId: "tcc-biblioteca-63020",
  storageBucket: "tcc-biblioteca-63020.firebasestorage.app",
  messagingSenderId: "457169560865",
  appId: "1:457169560865:web:fb1d0c9a59552a048f0a60"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Tipos para as coleções do Firestore
export interface Usuario {
  id?: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'usuario';
  status: 'ativo' | 'inativo';
  dataCadastro: Date;
}

export interface Livro {
  id?: string;
  titulo: string;
  autorId: string;
  isbn: string;
  categoria: string;
  status: 'disponível' | 'emprestado';
  imagemUrl?: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
}

export interface Autor {
  id?: string;
  nome: string;
  nacionalidade: string;
  biografia: string;
  imagemUrl?: string;
}

export interface Emprestimo {
  id?: string;
  livroId: string;
  usuarioId: string;
  dataEmprestimo: Date;
  dataDevolucaoPrevista: Date;
  dataDevolucaoEfetiva?: Date;
  status: 'ativo' | 'atrasado' | 'devolvido' | 'cancelado';
}