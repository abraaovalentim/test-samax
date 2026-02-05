'use server'

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
// Importe o Enum gerado pelo Prisma para usar na tipagem
import { FileSystemItemType } from '@prisma/client'; 
import type { FileSystemItem } from '@prisma/client';

// --- FUNÇÕES AUXILIARES ---

/**
 * Calcula o tamanho total de uma pasta recursivamente.
 * Decisão de Design: Cálculo "On-Read" para garantir consistência sem complexidade de sincronização.
 */
async function getRecursiveSize(itemId: string, itemType: FileSystemItemType, storedSize: number): Promise<number> {
  // Se for arquivo, o tamanho é o valor do banco
  if (itemType === FileSystemItemType.FILE) {
    return storedSize;
  }

  // Se for pasta, buscamos os filhos para somar
  const children = await prisma.fileSystemItem.findMany({
    where: { parentId: itemId }
  });

  let totalSize = 0;
  // Promise.all para resolver as somas dos filhos em paralelo
  const sizes = await Promise.all(children.map(child => 
    getRecursiveSize(child.id, child.type, child.size)
  ));
  
  totalSize = sizes.reduce((acc, curr) => acc + curr, 0);
  return totalSize;
}

// --- SERVER ACTIONS (Chamadas pelo Front) ---

/**
 * Busca itens de uma pasta e calcula seus tamanhos reais
 */
export async function getItems(parentId: string | null) {
  const items = await prisma.fileSystemItem.findMany({
    where: { parentId: parentId },
    orderBy: [
      { type: 'desc' }, // FOLDER vem antes de FILE (alfabeticamente FOLDER > FILE? Não, espera...)
      // Ajuste: 'FOLDER' vem depois de 'FILE' alfabeticamente. 
      // Se quiser Pastas primeiro, precisamos de lógica extra ou ordenar por nome e agrupar no front.
      // Vamos ordenar por nome por enquanto para simplificar.
      { name: 'asc' }
    ]
  });

  // Processamos os tamanhos
  // DICA: Para o teste, se a performance ficar ruim, remova o cálculo recursivo e retorne apenas 'item.size'
  const itemsWithSize = await Promise.all(items.map(async (item) => {
    const calculatedSize = await getRecursiveSize(item.id, item.type, item.size);
    return { ...item, size: calculatedSize };
  }));

  // Ordenação manual simples: Pastas primeiro
  return itemsWithSize.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === FileSystemItemType.FOLDER ? -1 : 1;
  });
}

/**
 * Cria Arquivo ou Pasta
 */
export async function createItem(formData: FormData) {
  const name = formData.get('name') as string;
  const parentIdRaw = formData.get('parentId') as string;
  const typeRaw = formData.get('type') as string;
  
  // Converter strings vazias para null (para a raiz)
  const parentId = parentIdRaw === 'null' || parentIdRaw === '' ? null : parentIdRaw;
  
  // Validar e converter o tipo para o Enum
  const type = typeRaw === 'FOLDER' ? FileSystemItemType.FOLDER : FileSystemItemType.FILE;

  // Se for arquivo, gera um tamanho aleatório para simular upload (entre 1KB e 5MB)
  // Se for pasta, tamanho é 0
  const size = type === FileSystemItemType.FILE ? Math.floor(Math.random() * 5 * 1024 * 1024) : 0;

  try {
    await prisma.fileSystemItem.create({
      data: {
        name,
        parentId,
        type,
        size
      }
    });
    
    revalidatePath('/'); // Atualiza cache do Next.js
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Erro ao criar item. Verifique se o nome já existe.' };
  }
}

/**
 * Deleta item (Cascata deleta filhos automaticamente)
 */
export async function deleteItem(id: string) {
  try {
    await prisma.fileSystemItem.delete({
      where: { id }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao deletar item.' };
  }
}

type Breadcrumb = {
  id: string;
  name: string;
};

export async function getBreadcrumbs(
  folderId: string | null
): Promise<Breadcrumb[]> {
  if (!folderId) return [];

  const breadcrumbs: Breadcrumb[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder: Pick<FileSystemItem, 'id' | 'name' | 'parentId'> | null =
      await prisma.fileSystemItem.findUnique({
        where: { id: currentId },
        select: { id: true, name: true, parentId: true }
      });

    if (!folder) break;

    breadcrumbs.unshift({
      id: folder.id,
      name: folder.name
    });

    currentId = folder.parentId;
  }

  return breadcrumbs;
}
