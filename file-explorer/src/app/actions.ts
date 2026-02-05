'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { FileSystemItemType } from '@prisma/client';
import type { FileSystemItem } from '@prisma/client';

/* ---------------------------------- */
/* Helpers                             */
/* ---------------------------------- */

async function getRecursiveSize(
  itemId: string,
  itemType: FileSystemItemType,
  storedSize: number
): Promise<number> {
  if (itemType === FileSystemItemType.FILE) {
    return storedSize;
  }

  const children = await prisma.fileSystemItem.findMany({
    where: { parentId: itemId },
  });

  const sizes = await Promise.all(
    children.map((child) =>
      getRecursiveSize(child.id, child.type, child.size)
    )
  );

  return sizes.reduce((acc, curr) => acc + curr, 0);
}

/* ---------------------------------- */
/* Actions                             */
/* ---------------------------------- */

export async function getItems(parentId: string | null) {
  console.log(
    `🔍 Buscando itens da pasta: ${parentId ?? 'RAIZ (null)'}`
  );

  const items = await prisma.fileSystemItem.findMany({
    where: { parentId },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });

  const sorted = items.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'FOLDER' ? -1 : 1;
  });

  const withSize = await Promise.all(
    sorted.map(async (item) => ({
      ...item,
      size: await getRecursiveSize(item.id, item.type, item.size),
    }))
  );

  return withSize;
}

export async function createItem(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const type = formData.get('type') as FileSystemItemType;
    const rawParentId = formData.get('parentId') as string | null;

    const parentId =
      !rawParentId || rawParentId === 'null' ? null : rawParentId;

    console.log('📝 Criando item:', { name, type, parentId });

    const existing = await prisma.fileSystemItem.findFirst({
      where: { name, parentId, type },
    });

    if (existing) {
      return { success: false, error: 'Item já existe nesta pasta.' };
    }

    await prisma.fileSystemItem.create({
      data: {
        name,
        type,
        parentId,
        size:
          type === FileSystemItemType.FILE
            ? Math.floor(Math.random() * 5000) + 1000
            : 0,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Erro ao criar item.' };
  }
}

export async function deleteItem(id: string) {
  await prisma.fileSystemItem.delete({ where: { id } });
  revalidatePath('/');
}

type Breadcrumb = {
  id: string;
  name: string;
};

export async function getBreadcrumbs(
  folderId: string | null
): Promise<Breadcrumb[]> {
  if (!folderId) return [];

  const crumbs: Breadcrumb[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder: Pick<FileSystemItem, 'id' | 'name' | 'parentId'> | null =
      await prisma.fileSystemItem.findUnique({
        where: { id: currentId },
        select: { id: true, name: true, parentId: true },
      });

    if (!folder) break;

    crumbs.unshift({ id: folder.id, name: folder.name });
    currentId = folder.parentId;
  }

  return crumbs;
}
