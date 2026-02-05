'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { File, Folder, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { createItem, deleteItem } from '@/app/actions';

// Interface local para tipagem
interface ExplorerProps {
  items: any[]; // Usando any para simplificar, mas idealmente seria o tipo do Prisma
  parentId: string | null;
  breadcrumbs: { id: string, name: string }[];
}

export default function Explorer({ items, parentId, breadcrumbs }: ExplorerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função wrapper para criar item e limpar form
  async function handleCreate(formData: FormData) {
    setIsSubmitting(true);
    const result = await createItem(formData);
    setIsSubmitting(false);
    
    if (result?.success) {
      setIsCreating(false);
    } else {
      alert(result?.error || 'Erro ao criar item');
    }
  }

  // Função wrapper para deletar
  async function handleDelete(id: string) {
    if (!confirm('Tem certeza? Isso apagará todo o conteúdo interno.')) return;
    await deleteItem(id);
  }

  // Função para navegar
  const handleNavigate = (id: string, type: string) => {
    if (type === 'FOLDER') {
      router.push(`/?folderId=${id}`);
    } else {
      alert('Visualização de arquivo não implementada neste MVP.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200 mt-10">
      
      {/* --- HEADER & BREADCRUMBS --- */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <nav className="flex items-center text-sm text-gray-600">
           <button onClick={() => router.push('/')} className="hover:text-blue-600 font-bold mr-2">
             Home
           </button>
           {breadcrumbs.map((crumb) => (
             <span key={crumb.id} className="flex items-center">
               <span className="mx-1">/</span>
               <button 
                 onClick={() => router.push(`/?folderId=${crumb.id}`)}
                 className="hover:text-blue-600 truncate max-w-[100px]"
               >
                 {crumb.name}
               </button>
             </span>
           ))}
        </nav>
        
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Novo Item
        </button>
      </div>

      {/* --- FORMULÁRIO DE CRIAÇÃO (Aparece ao clicar em Novo Item) --- */}
      {isCreating && (
        <form action={handleCreate} className="bg-gray-50 p-4 rounded-md mb-6 border border-blue-100 animate-in fade-in slide-in-from-top-2">
          <input type="hidden" name="parentId" value={parentId || ''} />
          
          <div className="flex gap-4">
            <input 
              name="name" 
              required 
              placeholder="Nome do item..." 
              className="flex-1 border p-2 rounded text-black"
            />
            <select name="type" className="border p-2 rounded text-black">
              <option value="FOLDER">Pasta</option>
              <option value="FILE">Arquivo</option>
            </select>
            <button 
              disabled={isSubmitting}
              type="submit" 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {isSubmitting ? '...' : 'Criar'}
            </button>
          </div>
        </form>
      )}

      {/* --- LISTAGEM DE ARQUIVOS --- */}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-center py-10 text-gray-400">Pasta vazia</div>
        )}

        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-200 group transition-all"
          >
            {/* Ícone e Nome (Clicável) */}
            <div 
              onClick={() => handleNavigate(item.id, item.type)}
              className="flex items-center gap-3 flex-1 cursor-pointer"
            >
              {item.type === 'FOLDER' 
                ? <Folder className="text-blue-500 fill-blue-50" /> 
                : <File className="text-gray-400" />
              }
              <span className="font-medium text-gray-700">{item.name}</span>
            </div>

            {/* Metadados e Ações */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>
                {item.type === 'FOLDER' 
                  ? (item.size > 0 ? `${(item.size / 1024).toFixed(1)} KB` : 'Vazio') 
                  : `${(item.size / 1024).toFixed(1)} KB`}
              </span>
              
              <button 
                onClick={() => handleDelete(item.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Deletar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}