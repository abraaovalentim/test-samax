// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getItems } from '@/app/actions'; // Importamos sua função de leitura
import { FileSystemItemType } from '@prisma/client';

export async function GET() {
  try {
    // 1. Limpeza: Apaga tudo para o teste ser limpo (CUIDADO EM PROD!)
    await prisma.fileSystemItem.deleteMany();

    // 2. Criar uma Pasta Raiz "Docs"
    const rootFolder = await prisma.fileSystemItem.create({
      data: {
        name: 'Docs',
        type: FileSystemItemType.FOLDER,
        parentId: null
      }
    });

    // 3. Criar um Arquivo dentro de "Docs" (Tamanho 1000 bytes)
    await prisma.fileSystemItem.create({
      data: {
        name: 'Relatorio.pdf',
        type: FileSystemItemType.FILE,
        parentId: rootFolder.id,
        size: 1000
      }
    });

    // 4. Criar outro Arquivo dentro de "Docs" (Tamanho 500 bytes)
    await prisma.fileSystemItem.create({
      data: {
        name: 'Foto.png',
        type: FileSystemItemType.FILE,
        parentId: rootFolder.id,
        size: 500
      }
    });

    // 5. TESTE DE CONSTRAINT: Tentar criar 'Foto.png' de novo (Deve falhar)
    let duplicidadeTest = "PASSOU (Erro capturado corretamente)";
    try {
      await prisma.fileSystemItem.create({
        data: {
          name: 'Foto.png', // Mesmo nome
          type: FileSystemItemType.FILE,
          parentId: rootFolder.id,
          size: 999
        }
      });
      duplicidadeTest = "FALHOU (Permitiu duplicata)";
    } catch (e) {
      // Esperamos que caia aqui
    }

    // 6. TESTE DE LÓGICA: Chamar sua Server Action para ver se calcula o tamanho
    // Deve retornar a pasta 'Docs' com size = 1500 (1000 + 500)
    const itemsFromAction = await getItems(null);
    
    const folderResult = itemsFromAction.find(i => i.name === 'Docs');
    const tamanhoCorreto = folderResult?.size === 1500;

    return NextResponse.json({
      status: "Testes Finalizados",
      resultados: {
        criacao_banco: "OK",
        teste_duplicidade: duplicidadeTest,
        calculo_tamanho: tamanhoCorreto ? `OK (1500 bytes)` : `ERRO (Deu ${folderResult?.size})`,
        items_retornados: itemsFromAction
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}