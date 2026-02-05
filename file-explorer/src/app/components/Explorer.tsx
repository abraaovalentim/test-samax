'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Folder, 
  Trash2, 
  Plus, 
  Home, 
  ChevronRight, 
  Search 
} from 'lucide-react';
import { createItem, deleteItem } from '@/app/actions';

interface ExplorerProps {
  items: any[];
  parentId: string | null;
  breadcrumbs: { id: string; name: string }[];
}

export default function Explorer({
  items,
  parentId,
  breadcrumbs,
}: ExplorerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lógica intacta
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

  // Lógica intacta
  async function handleDelete(id: string) {
    if (!confirm('Tem certeza?')) return;
    await deleteItem(id);
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      
      {/* --- HEADER & BREADCRUMBS --- */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
        
        {/* Breadcrumbs Estilizados */}
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

        {/* Botão Novo Item */}
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

      {/* --- FORMULÁRIO DE CRIAÇÃO --- */}
      {isCreating && (
        <div className="bg-slate-50 border-b border-slate-100 p-6 animate-in slide-in-from-top-2 fade-in duration-200">
          <form action={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <input type="hidden" name="parentId" value={parentId ?? ''} />
            
            <div className="flex-1">
              <input
                name="name"
                required
                autoFocus
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                placeholder="Nome do arquivo ou pasta..."
              />
            </div>
            
            <div className="sm:w-48">
              <select 
                name="type" 
                className="w-full border border-slate-300 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="FOLDER">Pasta</option>
                <option value="FILE">Arquivo</option>
              </select>
            </div>

            <button
              disabled={isSubmitting}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Criando...' : 'Salvar'}
            </button>
          </form>
        </div>
      )}

      {/* --- LISTAGEM DE ITENS --- */}
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
              <div
                key={item.id}
                className="group flex justify-between items-center p-4 hover:bg-slate-50 transition-colors cursor-default"
              >
                {/* Nome e Ícone (Clicável se for pasta) */}
                <div
                  onClick={() =>
                    item.type === 'FOLDER' &&
                    router.push(`/?folderId=${item.id}`)
                  }
                  className={`
                    flex items-center gap-3 flex-1 
                    ${item.type === 'FOLDER' ? 'cursor-pointer' : ''}
                  `}
                >
                  {/* Ícone Condicional */}
                  {item.type === 'FOLDER' ? (
                    <Folder className="text-amber-400 fill-amber-100 w-6 h-6" />
                  ) : (
                    <FileText className="text-slate-400 w-6 h-6" />
                  )}
                  
                  <span className={`font-medium ${item.type === 'FOLDER' ? 'text-slate-700 group-hover:text-indigo-700' : 'text-slate-600'}`}>
                    {item.name}
                  </span>
                </div>

                {/* Info e Ações */}
                <div className="flex items-center gap-6">
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    {(item.size / 1024).toFixed(1)} KB
                  </span>
                  
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}