// src/pages/Backups.tsx

import { useEffect } from 'react';
import { Download, Trash2, Plus, Loader } from 'lucide-react';
import { useBackupStore } from '../store/backupStore';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

function Backups() {
  const { backups, loading, createBackup, fetchBackups, deleteBackup, downloadBackup } = useBackupStore();
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleCreateBackup = async () => {
    if (!user?.uid) {
      toast.error('Usuário não identificado');
      return;
    }
    await createBackup(user.uid);
  };

  const handleDeleteBackup = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este backup?')) {
      await deleteBackup(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Backups</h1>
        {isAdmin() && (
          <button
            onClick={handleCreateBackup}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Criar Backup
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhum backup encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Arquivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado Por</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(backup.timestamp, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{backup.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{backup.createdBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadBackup(backup)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        {isAdmin() && (
                          <button
                            onClick={() => backup.id && handleDeleteBackup(backup.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Backups;
