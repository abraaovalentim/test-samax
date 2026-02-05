'use client';

import { Home, ChevronRight, Search, Plus } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface HeaderProps {
  breadcrumbs: { id: string; name: string }[];
  isCreating: boolean;
  onToggleCreate: () => void;
}

export default function ExplorerHeader({ breadcrumbs, isCreating, onToggleCreate }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
      params.delete('folderId');
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const isSearching = !!searchParams.get('q');

  return (
    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
      {/* Breadcrumbs */}
      <nav className={`flex flex-wrap items-center text-sm text-slate-500 flex-1 ${isSearching ? 'hidden md:flex opacity-50' : ''}`}>
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

      {/* Search */}
      <div className="relative w-full md:w-64">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
         <input 
           className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white border focus:border-indigo-500 rounded-lg outline-none transition-all text-sm"
           placeholder="Buscar..."
           defaultValue={searchParams.get('q')?.toString()}
           onChange={(e) => handleSearch(e.target.value)}
         />
      </div>

      {/* Action Button */}
      <button
        onClick={onToggleCreate}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm shrink-0
          ${isCreating 
            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
          }
        `}
      >
        <Plus size={18} /> 
        <span className="hidden sm:inline">{isCreating ? 'Cancelar' : 'Novo Item'}</span>
        <span className="sm:hidden">Novo</span>
      </button>
    </div>
  );
}