import { getItems, getBreadcrumbs } from './actions';
import Explorer from './components/Explorer';

// Isso força o Next.js a não fazer cache estático desta página, 
// garantindo que os dados estejam sempre frescos.
export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // 1. Ler o ID da pasta da URL (?folderId=...)
  const folderId = typeof searchParams.folderId === 'string' ? searchParams.folderId : null;

  // 2. Buscar dados em paralelo (Performance!)
  const [items, breadcrumbs] = await Promise.all([
    getItems(folderId),
    getBreadcrumbs(folderId)
  ]);

  // 3. Renderizar o Client Component
  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">File Manager System</h1>
        <p className="text-gray-500">Avaliação Técnica - MVP</p>
      </div>

      <Explorer 
        items={items} 
        parentId={folderId} 
        breadcrumbs={breadcrumbs}
      />
    </main>
  );
}