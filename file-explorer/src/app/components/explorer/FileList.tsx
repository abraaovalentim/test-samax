'use client';

import { Folder, FileText, ArrowRightLeft, Trash2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FileListProps {
  items: any[];
  isSearching: boolean;
  onDelete: (id: string) => void;
  onMoveRequest: (item: any) => void;
}

export default function FileList({ items, isSearching, onDelete, onMoveRequest }: FileListProps) {
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        {isSearching ? (
           <div className="text-center">
             <Search size={32} className="mx-auto mb-3 opacity-20" />
             <p>Nenhum resultado encontrado.</p>
           </div>
        ) : (
          <div className="text-center">
            <Folder size={32} className="mx-auto mb-3 opacity-20" />
            <p>Esta pasta está vazia</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50 min-h-[300px] bg-white">
      {items.map((item) => (
        <div key={item.id} className="group flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
          <div
            onClick={() => item.type === 'FOLDER' && router.push(`/?folderId=${item.id}`)}
            className={`flex items-center gap-3 flex-1 ${item.type === 'FOLDER' ? 'cursor-pointer' : ''}`}
          >
            {item.type === 'FOLDER' ? (
              <Folder className="text-amber-400 fill-amber-100 w-6 h-6 shrink-0" />
            ) : (
              <FileText className="text-slate-400 w-6 h-6 shrink-0" />
            )}
            <span className={`font-medium ${item.type === 'FOLDER' ? 'text-slate-700 group-hover:text-indigo-700' : 'text-slate-600'}`}>
              {item.name}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded hidden sm:block">
              {(item.size / 1024).toFixed(1)} KB
            </span>
            <button onClick={() => onMoveRequest(item)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Mover">
              <ArrowRightLeft size={18} />
            </button>
            <button onClick={() => onDelete(item.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Excluir">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}