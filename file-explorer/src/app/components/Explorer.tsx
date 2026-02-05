'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { File, Folder, Trash2, Plus } from 'lucide-react';
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow border mt-10">
      {/* Breadcrumbs */}
      <div className="flex justify-between items-center mb-6">
        <nav className="text-sm text-gray-600">
          <button onClick={() => router.push('/')} className="font-bold">
            Home
          </button>
          {breadcrumbs.map((b) => (
            <span key={b.id}>
              {' / '}
              <button onClick={() => router.push(`/?folderId=${b.id}`)}>
                {b.name}
              </button>
            </span>
          ))}
        </nav>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Plus size={16} /> Novo Item
        </button>
      </div>

      {isCreating && (
        <form action={handleCreate} className="mb-6 flex gap-2">
          <input type="hidden" name="parentId" value={parentId ?? ''} />
          <input
            name="name"
            required
            className="border p-2 rounded flex-1"
            placeholder="Nome"
          />
          <select name="type" className="border p-2 rounded">
            <option value="FOLDER">Pasta</option>
            <option value="FILE">Arquivo</option>
          </select>
          <button
            disabled={isSubmitting}
            className="bg-green-600 text-white px-4 rounded"
          >
            Criar
          </button>
        </form>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between p-3 border rounded hover:bg-gray-50"
          >
            <div
              onClick={() =>
                item.type === 'FOLDER' &&
                router.push(`/?folderId=${item.id}`)
              }
              className="flex gap-2 cursor-pointer"
            >
              {item.type === 'FOLDER' ? <Folder /> : <File />}
              {item.name}
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-sm text-gray-500">
                {(item.size / 1024).toFixed(1)} KB
              </span>
              <button onClick={() => handleDelete(item.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
