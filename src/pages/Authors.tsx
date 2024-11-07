import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen, X, Loader } from 'lucide-react';
import { useAutoresStore } from '../store/autoresStore';
import { useLivrosStore } from '../store/livrosStore';
import toast from 'react-hot-toast';

function Authors() {
  const [showModal, setShowModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { autores, loading, fetchAutores, addAutor, updateAutor, deleteAutor } = useAutoresStore();
  const { livros, fetchLivros } = useLivrosStore();
  const [formData, setFormData] = useState({
    nome: '',
    nacionalidade: '',
    biografia: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [livrosCount, setLivrosCount] = useState<{ [key: string]: number }>({});
  const [autorNomeSelecionado, setAutorNomeSelecionado] = useState('');
  const [autorQuery, setAutorQuery] = useState('');

  useEffect(() => {
    fetchAutores();
    fetchLivros();
  }, [fetchAutores, fetchLivros]);

  useEffect(() => {
    const count = livros.reduce((acc: { [key: string]: number }, livro) => {
      acc[livro.autorId] = (acc[livro.autorId] || 0) + 1;
      return acc;
    }, {});
    setLivrosCount(count);
  }, [livros]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAuthor) {
        await updateAutor(editingAuthor.id, formData, imageFile || undefined);
      } else {
        await addAutor(formData, imageFile || undefined);
      }
      setShowModal(false);
      resetForm();
      toast.success(editingAuthor ? 'Autor atualizado com sucesso!' : 'Autor adicionado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao salvar autor: ' + error.message);
    }
  };

  const handleEdit = (author: any) => {
    setEditingAuthor(author);
    setFormData({
      nome: author.nome,
      nacionalidade: author.nacionalidade,
      biografia: author.biografia
    });
    setImagePreview(author.imagemUrl || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este autor?')) {
      try {
        await deleteAutor(id);
        toast.success('Autor removido com sucesso!');
      } catch (error: any) {
        toast.error('Erro ao remover autor: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      nacionalidade: '',
      biografia: ''
    });
    setImageFile(null);
    setImagePreview('');
    setEditingAuthor(null);
    setAutorNomeSelecionado('');
  };

  const filteredAuthors = autores.filter(author =>
    author.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.nacionalidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Autores</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Adicionar Autor
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar autores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <Loader className="h-12 w-12 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthors.map((author) => (
            <div key={author.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {author.imagemUrl ? (
                    <img
                      src={author.imagemUrl}
                      alt={author.nome}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-lg">
                        {author.nome.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{author.nome}</h3>
                    <p className="text-sm text-gray-500">{author.nacionalidade}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(author)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => author.id ? handleDelete(author.id) : console.error('ID do autor está indefinido')}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {author.biografia}
              </p>

              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="h-5 w-5" />
                {author.id && livrosCount[author.id] !== undefined ? (
                  livrosCount[author.id] === 1
                    ? '1 Livro Publicado'
                    : `${livrosCount[author.id]} Livros Publicados`
                ) : (
                  'Nenhum livro publicado'
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingAuthor ? 'Editar Autor' : 'Adicionar Autor'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nacionalidade</label>
                <input
                  type="text"
                  required
                  value={formData.nacionalidade}
                  onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Biografia</label>
                <textarea
                  required
                  value={formData.biografia}
                  onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Foto</label>
                <div className="mt-1 flex items-center gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
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
                  {editingAuthor ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Authors;
