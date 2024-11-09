import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Library, BookOpen, Users, PenTool, CalendarClock, LayoutDashboard, LogOut, Archive } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function Layout() {
  const navigate = useNavigate();
  const { signOut } = useAuthStore(); // Altere de logout para signOut

  const handleLogout = async () => {
    try {
      await signOut(); // Chama signOut para sair
      navigate('/login'); // Redireciona para a página de login
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Library className="h-8 w-8 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-800">BiblioTech</h1>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink to="/" className={({ isActive }) => 
            `flex items-center gap-2 p-2 rounded-lg transition-colors ${
              isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
            }`
          }>
            <LayoutDashboard className="h-5 w-5" />
            Painel
          </NavLink>
          <NavLink to="/books" className={({ isActive }) => 
            `flex items-center gap-2 p-2 rounded-lg transition-colors ${
              isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
            }`
          }>
            <BookOpen className="h-5 w-5" />
            Livros
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => 
            `flex items-center gap-2 p-2 rounded-lg transition-colors ${
              isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
            }`
          }>
            <Users className="h-5 w-5" />
            Usuários
          </NavLink>
          <NavLink to="/authors" className={({ isActive }) => 
            `flex items-center gap-2 p-2 rounded-lg transition-colors ${
              isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
            }`
          }>
            <PenTool className="h-5 w-5" />
            Autores
          </NavLink>
          <NavLink to="/loans" className={({ isActive }) => 
            `flex items-center gap-2 p-2 rounded-lg transition-colors ${
              isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
            }`
          }>
            <CalendarClock className="h-5 w-5" />
            Empréstimos
          </NavLink>
          {/* Novo link para Backups */}
          <NavLink to="/backups" className={({ isActive }) => 
            `flex items-center gap-2 p-2 rounded-lg transition-colors ${
              isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
            }`
          }>
            <Archive className="h-5 w-5" />
            Backups
          </NavLink>
          {/* Botão de Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
