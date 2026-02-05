'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, Folder, Trash2, Plus, Home, ChevronRight, 
  ArrowRightLeft, X 
} from 'lucide-react'; // Adicionei ArrowRightLeft e X
import { createItem, deleteItem, moveItem, getAllFolders } from '@/app/actions';

interface ExplorerProps {
  items: any[];
  parentId: string | null;
  breadcrumbs: { id: string; name: string }[];
}

export default function Explorer({ items, parentId, breadcrumbs }: ExplorerProps) {
  const router = useRouter();
  
  // Estados existentes
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NOVOS ESTADOS PARA O MOVER ---
  const [itemToMove, setItemToMove] = useState<any | null>(null); // Item sendo movido
  const [availableFolders, setAvailableFolders] = useState<any[]>([]); // Lista de pastas destino
  const [targetFolderId, setTargetFolderId] = useState<string>('root'); // Destino selecionado ('root' = raiz)
  const [isMovingLoading, setIsMovingLoading] = useState(false);

  // --- HANDLERS EXISTENTES ---
  async function handleCreate(formData: FormData) {
    setIsSubmitting(true);
    const result = await createItem(formData);
    setIsSubmitting(false);

    if (result?.success) {
      setIsCreating(false);
    } else {
      alert(result?.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza?')) return;
    await deleteItem(id);
  }

  // --- NOVOS HANDLERS DE MOVER ---

  // Ao clicar no botão de mover
  async function openMoveModal(item: any) {
    setItemToMove(item);
    setTargetFolderId('root'); // Reseta para raiz por padrão
    
    // Busca pastas disponíveis
    const folders = await getAllFolders();
    
    // Filtra visualmente: não mostramos a própria pasta que estamos movendo como destino
    // (A validação real de segurança ainda ocorre no backend)
    const validFolders = folders.filter(f => f.id !== item.id);
    setAvailableFolders(validFolders);
  }

  async function handleMoveSubmit() {
    if (!itemToMove) return;
    setIsMovingLoading(true);

    // Converte 'root' string para null real do banco
    const finalTargetId = targetFolderId === 'root' ? null : targetFolderId;

    const result = await moveItem(itemToMove.id, finalTargetId);
    
    setIsMovingLoading(false);

    if (result.success) {
      setItemToMove(null); // Fecha modal
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative">
      
      {/* --- HEADER & BREADCRUMBS --- */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        <nav className="flex flex-wrap items-center text-sm text-slate-500">
          <button 
            onClick={() => router.push('/')} 
            className="flex items-center hover:text-indigo-600 transition-colors hover:bg-indigo-50 px-2 py-1 rounded-md -ml-2"
          >
            <Home size={16} className="mr-1.5" />
            <span className="font-semibold">Home</span>
          </button>
          
          {breadcrumbs.map((b) => (
            <span key={b.id} className="flex items-center">
              <ChevronRight size={14} className="mx-1 text-slate-300" />
              <button 
                onClick={() => router.push(`/?folderId=${b.id}`)}
                className="hover:text-indigo-600 transition-colors hover:bg-indigo-50 px-2 py-1 rounded-md truncate max-w-[150px]"
              >
                {b.name}
              </button>
            </span>
          ))}
        </nav>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm
            ${isCreating 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
            }
          `}
        >
          <Plus size={18} /> 
          {isCreating ? 'Cancelar' : 'Novo Item'}
        </button>
      </div>

      {/* --- FORM DE CRIAÇÃO --- */}
      {isCreating && (
        <div className="bg-slate-50 border-b border-slate-100 p-6 animate-in slide-in-from-top-2 fade-in duration-200">
          <form action={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <input type="hidden" name="parentId" value={parentId ?? ''} />
            <input
              name="name"
              required
              autoFocus
              className="flex-1 border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Nome..."
            />
            <select name="type" className="sm:w-48 border border-slate-300 p-2.5 rounded-lg bg-white">
              <option value="FOLDER">Pasta</option>
              <option value="FILE">Arquivo</option>
            </select>
            <button disabled={isSubmitting} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700">
              {isSubmitting ? '...' : 'Salvar'}
            </button>
          </form>
        </div>
      )}

      {/* --- LISTAGEM --- */}
      <div className="bg-white min-h-[300px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="bg-slate-50 p-4 rounded-full mb-3">
              <Folder size={32} className="opacity-20" />
            </div>
            <p>Esta pasta está vazia</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {items.map((item) => (
              <div key={item.id} className="group flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                
                {/* Nome/Clique */}
                <div
                  onClick={() => item.type === 'FOLDER' && router.push(`/?folderId=${item.id}`)}
                  className={`flex items-center gap-3 flex-1 ${item.type === 'FOLDER' ? 'cursor-pointer' : ''}`}
                >
                  {item.type === 'FOLDER' ? (
                    <Folder className="text-amber-400 fill-amber-100 w-6 h-6" />
                  ) : (
                    <FileText className="text-slate-400 w-6 h-6" />
                  )}
                  <span className={`font-medium ${item.type === 'FOLDER' ? 'text-slate-700 group-hover:text-indigo-700' : 'text-slate-600'}`}>
                    {item.name}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded hidden sm:block">
                    {(item.size / 1024).toFixed(1)} KB
                  </span>
                  
                  {/* Botão Mover */}
                  <button 
                    onClick={() => openMoveModal(item)}
                    className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Mover"
                  >
                    <ArrowRightLeft size={18} />
                  </button>

                  {/* Botão Deletar */}
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL DE MOVER (Simples e Funcional) --- */}
      {itemToMove && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-700">Mover Item</h3>
              <button onClick={() => setItemToMove(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Mover <strong className="text-indigo-600">{itemToMove.name}</strong> para:
              </p>
              
              <div className="space-y-2">
                <select 
                  value={targetFolderId}
                  onChange={(e) => setTargetFolderId(e.target.value)}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="root">🏠 Home (Raiz)</option>
                  {availableFolders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      📁 {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setItemToMove(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleMoveSubmit}
                  disabled={isMovingLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                >
                  {isMovingLoading ? 'Movendo...' : 'Confirmar Mover'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}