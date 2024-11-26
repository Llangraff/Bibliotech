import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useEmprestimosStore } from '../store/emprestimosStore';
import { useLivrosStore } from '../store/livrosStore';
import { useUsuariosStore } from '../store/usuariosStore';
import { useAuthStore } from '../store/authStore';
import { format, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

function Loans() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [livroSelecionado, setLivroSelecionado] = useState('');
  const [livroNomeSelecionado, setLivroNomeSelecionado] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [usuarioNomeSelecionado, setUsuarioNomeSelecionado] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [livroQuery, setLivroQuery] = useState('');
  const [usuarioQuery, setUsuarioQuery] = useState('');
  const itemsPerPage = 5;

  const { emprestimos, loading, fetchEmprestimos, addEmprestimo, devolverLivro, deleteEmprestimo } = useEmprestimosStore();
  const { livros, fetchLivros } = useLivrosStore();
  const { usuarios, fetchUsuarios } = useUsuariosStore();
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    fetchEmprestimos();
    fetchLivros();
    fetchUsuarios();
  }, [fetchEmprestimos, fetchLivros, fetchUsuarios]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!livroSelecionado || !usuarioSelecionado || !dataDevolucao) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    try {
      await addEmprestimo({
        livroId: livroSelecionado,
        usuarioId: usuarioSelecionado,
        dataDevolucaoPrevista: new Date(dataDevolucao),
        dataEmprestimo: new Date(),
        status: 'ativo'
      });
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao adicionar empréstimo.');
    }
  };

  const resetForm = () => {
    setLivroSelecionado('');
    setLivroNomeSelecionado('');
    setUsuarioSelecionado('');
    setUsuarioNomeSelecionado('');
    setDataDevolucao('');
    setLivroQuery('');
    setUsuarioQuery('');
  };

  const handleLivroSelect = (id: string | undefined, titulo: string | undefined) => {
    if (id && titulo) {
      setLivroSelecionado(id);
      setLivroNomeSelecionado(titulo);
    }
    setLivroQuery('');
  };

  const handleUsuarioSelect = (id: string | undefined, nome: string | undefined) => {
    if (id && nome) {
      setUsuarioSelecionado(id);
      setUsuarioNomeSelecionado(nome);
    }
    setUsuarioQuery('');
  };

  const filteredEmprestimos = emprestimos.filter(emprestimo => {
    const livro = livros.find(l => l.id === emprestimo.livroId);
    const usuario = usuarios.find(u => u.id === emprestimo.usuarioId);
    const searchMatch = 
      livro?.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'todos') return searchMatch;
    return searchMatch && emprestimo.status === statusFilter;
  });

  const totalPages = Math.ceil(filteredEmprestimos.length / itemsPerPage);
  const currentEmprestimos = filteredEmprestimos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeClass = (status: string, dataDevolucaoPrevista?: Date) => {
    if (status === 'devolvido') return 'bg-green-100 text-green-800';
    if (status === 'ativo' && dataDevolucaoPrevista && isAfter(new Date(), dataDevolucaoPrevista)) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (status: string, dataDevolucaoPrevista?: Date) => {
    if (status === 'devolvido') return 'Devolvido';
    if (status === 'ativo' && dataDevolucaoPrevista && isAfter(new Date(), dataDevolucaoPrevista)) {
      return 'Atrasado';
    }
    return 'Ativo';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Empréstimos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo Empréstimo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar empréstimos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativos</option>
              <option value="devolvido">Devolvidos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Empréstimo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Devolução</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Carregando...</td>
                </tr>
              ) : currentEmprestimos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Nenhum empréstimo encontrado</td>
                </tr>
              ) : (
                currentEmprestimos.map((emprestimo) => {
                  const livro = livros.find(l => l.id === emprestimo.livroId);
                  const usuario = usuarios.find(u => u.id === emprestimo.usuarioId);

                  return (
                    <tr key={emprestimo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{livro?.titulo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{usuario?.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{emprestimo.dataEmprestimo ? format(emprestimo.dataEmprestimo, "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{emprestimo.dataDevolucaoPrevista ? format(emprestimo.dataDevolucaoPrevista, "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(emprestimo.status, emprestimo.dataDevolucaoPrevista)}`}>
                          {getStatusText(emprestimo.status, emprestimo.dataDevolucaoPrevista)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {emprestimo.status === 'ativo' && (
                            <button onClick={() => emprestimo.id && devolverLivro(emprestimo.id)} className="text-green-600 hover:text-green-900" title="Devolver">
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          )}
                          {isAdmin() && (
                            <button onClick={() => emprestimo.id && deleteEmprestimo(emprestimo.id)} className="text-red-600 hover:text-red-900" title="Excluir">
                              <XCircle className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {currentEmprestimos.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a{' '}
              {Math.min(currentPage * itemsPerPage, filteredEmprestimos.length)} de{' '}
              {filteredEmprestimos.length} registros
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === i + 1 ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Novo Empréstimo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Livro</label>
                <input
                  type="text"
                  placeholder="Buscar livro..."
                  value={livroNomeSelecionado || livroQuery}
                  onChange={(e) => {
                    setLivroQuery(e.target.value);
                    setLivroNomeSelecionado('');
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {livroQuery && (
                  <ul className="border border-gray-300 mt-1 rounded-md bg-white shadow-sm max-h-40 overflow-y-auto">
                    {livros
                      .filter(livro => livro.titulo.toLowerCase().includes(livroQuery.toLowerCase()))
                      .map((livro) => (
                        <li
                          key={livro.id}
                          onClick={() => handleLivroSelect(livro.id, livro.titulo)}
                          className="p-2 hover:bg-indigo-50 cursor-pointer"
                        >
                          {livro.titulo} ({livro.quantidadeDisponivel} disponíveis)
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Usuário</label>
                <input
                  type="text"
                  placeholder="Buscar usuário..."
                  value={usuarioNomeSelecionado || usuarioQuery}
                  onChange={(e) => {
                    setUsuarioQuery(e.target.value);
                    setUsuarioNomeSelecionado('');
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {usuarioQuery && (
                  <ul className="border border-gray-300 mt-1 rounded-md bg-white shadow-sm max-h-40 overflow-y-auto">
                    {usuarios
                      .filter(usuario => usuario.nome.toLowerCase().includes(usuarioQuery.toLowerCase()))
                      .map((usuario) => (
                        <li
                          key={usuario.id}
                          onClick={() => handleUsuarioSelect(usuario.id, usuario.nome)}
                          className="p-2 hover:bg-indigo-50 cursor-pointer"
                        >
                          {usuario.nome}
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Devolução Prevista</label>
                <input
                  type="date"
                  value={dataDevolucao}
                  onChange={(e) => setDataDevolucao(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Confirmar Empréstimo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Loans;
