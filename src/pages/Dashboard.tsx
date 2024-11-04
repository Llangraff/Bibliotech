import React from 'react';
import { BookOpen, Users, PenTool, CalendarClock } from 'lucide-react';

function StatCard({ icon: Icon, title, value, change }: { icon: any, title: string, value: string, change: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
      </div>
      <p className="text-sm text-green-600 mt-4">{change}</p>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Painel de Controle</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={BookOpen}
          title="Total de Livros"
          value="2.543"
          change="+12,5% em relação ao mês anterior"
        />
        <StatCard 
          icon={Users}
          title="Usuários Ativos"
          value="1.325"
          change="+8,2% em relação ao mês anterior"
        />
        <StatCard 
          icon={PenTool}
          title="Autores"
          value="156"
          change="+3,1% em relação ao mês anterior"
        />
        <StatCard 
          icon={CalendarClock}
          title="Empréstimos Ativos"
          value="284"
          change="+5,4% em relação ao mês anterior"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Empréstimos Recentes</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Dom Casmurro</p>
                  <p className="text-sm text-gray-500">Emprestado para João Silva</p>
                </div>
                <span className="text-sm text-indigo-600">há 2 dias</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Livros Populares</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&h=100&fit=crop"
                  alt="Capa do livro"
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium">O Pequeno Príncipe</p>
                  <p className="text-sm text-gray-500">Emprestado 48 vezes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;