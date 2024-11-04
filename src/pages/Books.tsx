import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader } from 'lucide-react';
import { useLivrosStore } from '../store/livrosStore';
import { useAutoresStore } from '../store/autoresStore';
import { Livro, Autor } from '../lib/firebase';

function Books() {
  const { livros, fetchLivros, addLivro, updateLivro, deleteLivro, loading } = useLivrosStore();
  const { autores, fetchAutores } = useAutoresStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Livro, 'id'>>({
    titulo: '',
    autorId: '',
    isbn: '',
    categoria: '',
    quantidadeTotal: 0,
    quantidadeDisponivel: 0,
    status: 'disponível',
  });
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formError, setFormError] = useState('');
  const [autorQuery, setAutorQuery] = useState('');
  const [filteredAutores, setFilteredAutores] = useState<Autor[]>([]);

  useEffect(() => {
    fetchLivros();
    fetchAutores();
  }, [fetchLivros, fetchAutores]);

  useEffect(() => {
    setFilteredAutores(
      autores.filter((autor: Autor) =>
        autor.nome.toLowerCase().includes(autorQuery.toLowerCase())
      )
    );
  }, [autorQuery, autores]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAutorSelect = (autorId: string) => {
    setFormData({ ...formData, autorId });
    setAutorQuery(''); // Limpa o campo de busca após a seleção
  };

  const isFormValid = () => {
    if (!formData.titulo || !formData.autorId || !formData.isbn || !formData.categoria || formData.quantidadeTotal < 1) {
      setFormError('Todos os campos são obrigatórios e a quantidade total deve ser maior que 0.');
      return false;
    }
    if (!/^\d{3}-\d{1,5}-\d{1,7}-\d{1,7}-\d{1}$/.test(formData.isbn)) {
      setFormError('O ISBN deve estar no formato 978-3-16-148410-0.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const quantidadeDisponivel = formData.quantidadeTotal;

    if (livroSelecionado && livroSelecionado.id) {
      updateLivro(livroSelecionado.id, { ...formData, quantidadeDisponivel });
    } else {
      addLivro({ ...formData, quantidadeDisponivel });
    }

    setShowAddModal(false);
    setFormData({
      titulo: '',
      autorId: '',
      isbn: '',
      categoria: '',
      quantidadeTotal: 0,
      quantidadeDisponivel: 0,
      status: 'disponível',
    });
    setLivroSelecionado(null);
  };

  const handleEdit = (livro: Livro) => {
    setLivroSelecionado(livro);
    setFormData({ ...livro });
    setShowAddModal(true);
  };

  const handleDelete = (id: string | undefined) => {
    if (id) {
      deleteLivro(id);
    } else {
      console.error('Erro ao excluir livro: ID inválido.');
    }
  };

  const filteredLivros = livros.filter(livro =>
    livro.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    livro.autorId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLivros.length / itemsPerPage);
  const currentLivros = filteredLivros.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Livros</h1>
        <button
          onClick={() => {
            setFormData({
              titulo: '',
              autorId: '',
              isbn: '',
              categoria: '',
              quantidadeTotal: 0,
              quantidadeDisponivel: 0,
              status: 'disponível',
            });
            setLivroSelecionado(null);
            setShowAddModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Adicionar Livro
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar livros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin h-10 w-10 text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade Disponível</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLivros.map((livro) => (
                  <tr key={livro.id || Math.random()} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{livro.titulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {autores.find((autor) => autor.id === livro.autorId)?.nome || 'Autor Desconhecido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{livro.isbn}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{livro.categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{livro.quantidadeTotal}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{livro.quantidadeDisponivel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(livro)} className="text-indigo-600 hover:text-indigo-900">
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(livro.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {currentLivros.length > 0 ? `${(currentPage - 1) * itemsPerPage + 1}` : 0} a{' '}
              {Math.min(currentPage * itemsPerPage, filteredLivros.length)} de {filteredLivros.length} registros
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 border rounded text-sm ${currentPage === index + 1 ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                disabled={currentPage === totalPages}
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{livroSelecionado ? 'Editar Livro' : 'Adicionar Novo Livro'}</h2>
            {formError && <p className="text-red-500 text-sm mb-2">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Autor</label>
                <input
                  type="text"
                  placeholder="Buscar autor..."
                  value={autorQuery}
                  onChange={(e) => setAutorQuery(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {autorQuery && (
                  <ul className="border border-gray-300 mt-1 rounded-md bg-white shadow-sm max-h-40 overflow-y-auto">
                    {filteredAutores.map((autor) => (
                     <li
                     key={autor.id}
                     onClick={() => autor.id && handleAutorSelect(autor.id)}
                     className="p-2 hover:bg-indigo-50 cursor-pointer"
                   >
                     {autor.nome}
                   </li>
                   
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Literatura Brasileira">Literatura Brasileira</option>
                  <option value="Literatura Estrangeira">Literatura Estrangeira</option>
                  <option value="Ciências">Ciências</option>
                  <option value="História">História</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantidade Total</label>
                <input
                  type="number"
                  name="quantidadeTotal"
                  value={formData.quantidadeTotal}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  {livroSelecionado ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Books;
