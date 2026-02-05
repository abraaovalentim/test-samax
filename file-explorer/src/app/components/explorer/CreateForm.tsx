'use client';

import { useState } from 'react';
import { createItem } from '@/app/actions';

interface CreateFormProps {
  parentId: string | null;
  onSuccess: () => void;
}

export default function CreateForm({ parentId, onSuccess }: CreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(formData: FormData) {
    setIsSubmitting(true);
    const result = await createItem(formData);
    setIsSubmitting(false);

    if (result?.success) {
      onSuccess();
    } else {
      alert(result?.error);
    }
  }

  return (
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
        <button disabled={isSubmitting} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50">
          {isSubmitting ? '...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}