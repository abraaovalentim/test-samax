import { getItems, getBreadcrumbs } from './actions';
import Explorer from './components/Explorer';
import { HardDrive } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const folderId =
    typeof resolvedSearchParams.folderId === 'string'
      ? resolvedSearchParams.folderId
      : null;

  // 🔥 ATUALIZADO: Captura o termo de busca "q"
  const query = 
    typeof resolvedSearchParams.q === 'string'
      ? resolvedSearchParams.q
      : undefined;

  const [items, breadcrumbs] = await Promise.all([
    getItems(folderId, query), // Passamos a query para a busca
    getBreadcrumbs(folderId),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto mb-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
            <HardDrive className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Drive Manager
          </h1>
        </div>
        <p className="text-slate-500 font-medium">Avaliação Técnica • MVP</p>
      </div>

      <Explorer
        items={items}
        parentId={folderId}
        breadcrumbs={breadcrumbs}
      />
    </main>
  );
}