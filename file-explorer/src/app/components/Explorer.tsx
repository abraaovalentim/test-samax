'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { deleteItem } from '@/app/actions';

// Imports dos novos sub-componentes
import ExplorerHeader from './explorer/ExplorerHeader';
import CreateForm from './explorer/CreateForm';
import FileList from './explorer/FileList';
import MoveModal from './explorer/MoveModal';

interface ExplorerProps {
  items: any[];
  parentId: string | null;
  breadcrumbs: { id: string; name: string }[];
}

export default function Explorer({ items, parentId, breadcrumbs }: ExplorerProps) {
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [itemToMove, setItemToMove] = useState<any | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza?')) return;
    await deleteItem(id);
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative">
      
      <ExplorerHeader 
        breadcrumbs={breadcrumbs}
        isCreating={isCreating}
        onToggleCreate={() => setIsCreating(!isCreating)}
      />

      {isCreating && (
        <CreateForm 
          parentId={parentId} 
          onSuccess={() => setIsCreating(false)} 
        />
      )}

      <FileList 
        items={items}
        isSearching={!!searchParams.get('q')}
        onDelete={handleDelete}
        onMoveRequest={setItemToMove} // Passa a função que abre o modal
      />

      {itemToMove && (
        <MoveModal 
          item={itemToMove} 
          onClose={() => setItemToMove(null)} 
        />
      )}
      
    </div>
  );
}