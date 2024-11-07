import { useEffect, useState } from 'react';
import { BookOpen, Users, PenTool, CalendarClock } from 'lucide-react';
import { useLivrosStore } from '../store/livrosStore';
import { useUsuariosStore } from '../store/usuariosStore';
import { useAutoresStore } from '../store/autoresStore';
import { useEmprestimosStore } from '../store/emprestimosStore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function StatCard({ icon: Icon, title, value, change }: { icon: any, title: string, value: string, change: string }) {
  const isPositiveChange = parseFloat(change) > 0;

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
      <p className={`text-sm mt-4 ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
    </div>
  );
}

function Dashboard() {
  const { livros, fetchLivros } = useLivrosStore();
  const { usuarios, fetchUsuarios } = useUsuariosStore();
  const { autores, fetchAutores } = useAutoresStore();
  const { emprestimos, fetchEmprestimos } = useEmprestimosStore();

  const [previousData] = useState({
    livros: 2200,
    usuarios: 1200,
    autores: 150,
    emprestimosAtivos: 270,
  });

  useEffect(() => {
    fetchLivros();
    fetchUsuarios();
    fetchAutores();
    fetchEmprestimos();
  }, [fetchLivros, fetchUsuarios, fetchAutores, fetchEmprestimos]);

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return '+100%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}% em relação ao mês anterior`;
  };

  // Contagem de empréstimos por livro
  const livroEmprestimosContagem = emprestimos.reduce((acc: Record<string, number>, emprestimo) => {
    acc[emprestimo.livroId] = (acc[emprestimo.livroId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Painel de Controle</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={BookOpen}
          title="Total de Livros"
          value={livros.length.toString()}
          change={calculatePercentageChange(livros.length, previousData.livros)}
        />
        <StatCard 
          icon={Users}
          title="Usuários Ativos"
          value={usuarios.filter(user => user.status === 'ativo').length.toString()}
          change={calculatePercentageChange(usuarios.filter(user => user.status === 'ativo').length, previousData.usuarios)}
        />
        <StatCard 
          icon={PenTool}
          title="Autores"
          value={autores.length.toString()}
          change={calculatePercentageChange(autores.length, previousData.autores)}
        />
        <StatCard 
          icon={CalendarClock}
          title="Empréstimos Ativos"
          value={emprestimos.filter(emp => emp.status === 'ativo').length.toString()}
          change={calculatePercentageChange(emprestimos.filter(emp => emp.status === 'ativo').length, previousData.emprestimosAtivos)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Empréstimos Recentes</h2>
          <div className="space-y-4">
            {emprestimos
              .filter(emprestimo => {
                const livro = livros.find(l => l.id === emprestimo.livroId);
                const usuario = usuarios.find(u => u.id === emprestimo.usuarioId);
                return livro && usuario;
              })
              .slice(0, 4)
              .map((emprestimo, i) => {
                const livro = livros.find(l => l.id === emprestimo.livroId);
                const usuario = usuarios.find(u => u.id === emprestimo.usuarioId);
                const dataEmprestimo = new Date(emprestimo.dataEmprestimo); // Supondo que 'dataEmprestimo' seja uma string ou um objeto Date
                const timeAgo = formatDistanceToNow(dataEmprestimo, { addSuffix: true, locale: ptBR });
                
                return (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{livro?.titulo || 'Livro desconhecido'}</p>
                      <p className="text-sm text-gray-500">Emprestado para {usuario?.nome || 'Usuário desconhecido'}</p>
                    </div>
                    <span className="text-sm text-indigo-600">{timeAgo}</span>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Livros Populares</h2>
          <div className="space-y-4">
            {livros
              .sort((a, b) => (livroEmprestimosContagem[b.id ?? ''] || 0) - (livroEmprestimosContagem[a.id ?? ''] || 0))
              .slice(0, 4)
              .map((livro, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={livro.imagemUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&h=100&fit=crop'} // Imagem padrão confiável
                    alt={livro.titulo}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{livro.titulo}</p>
                    <p className="text-sm text-gray-500">Emprestado {livroEmprestimosContagem[livro.id ?? ''] || 0} vezes</p>
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
