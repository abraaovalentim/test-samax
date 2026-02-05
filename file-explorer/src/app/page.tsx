import { getItems, getBreadcrumbs } from './actions';
import Explorer from './components/Explorer';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 🔥 NEXT 16: searchParams é Promise
  const resolvedSearchParams = await searchParams;

  const folderId =
    typeof resolvedSearchParams.folderId === 'string'
      ? resolvedSearchParams.folderId
      : null;

  const [items, breadcrumbs] = await Promise.all([
    getItems(folderId),
    getBreadcrumbs(folderId),
  ]);

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          File Manager System
        </h1>
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
