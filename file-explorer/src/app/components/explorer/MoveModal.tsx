'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getAllFolders, moveItem } from '@/app/actions';

interface MoveModalProps {
  item: any;
  onClose: () => void;
}

export default function MoveModal({ item, onClose }: MoveModalProps) {
  const [availableFolders, setAvailableFolders] = useState<any[]>([]);
  const [targetFolderId, setTargetFolderId] = useState<string>('root');
  const [loading, setLoading] = useState(false);

  // Busca pastas ao abrir o modal
  useEffect(() => {
    getAllFolders().then((folders) => {
      // Filtra para não mostrar o próprio item se for pasta
      setAvailableFolders(folders.filter((f) => f.id !== item.id));
    });
  }, [item]);

  async function handleMove() {
    setLoading(true);
    const finalTargetId = targetFolderId === 'root' ? null : targetFolderId;
    
    const result = await moveItem(item.id, finalTargetId);
    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-700">Mover Item</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Mover <strong className="text-indigo-600">{item.name}</strong> para:
          </p>
          
          <select 
            value={targetFolderId}
            onChange={(e) => setTargetFolderId(e.target.value)}
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white mb-6"
          >
            <option value="root">🏠 Home (Raiz)</option>
            {availableFolders.map((f) => (
              <option key={f.id} value={f.id}>📁 {f.name}</option>
            ))}
          </select>

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
              Cancelar
            </button>
            <button 
              onClick={handleMove}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              {loading ? 'Movendo...' : 'Confirmar Mover'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}