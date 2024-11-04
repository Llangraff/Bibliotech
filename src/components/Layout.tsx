import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Library, BookOpen, Users, PenTool, CalendarClock, LayoutDashboard } from 'lucide-react';

function Layout() {
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