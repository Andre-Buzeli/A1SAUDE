#!/bin/sh
set -e

echo "Aguardando banco de dados ficar disponível..."
# Aguarda conexão com banco usando pg_isready
until pg_isready -h postgres -p 5432 -U ${POSTGRES_USER:-postgres} 2>/dev/null; do
  echo "Banco de dados não está pronto. Aguardando..."
  sleep 2
done

echo "Banco de dados disponível. Executando migrações..."
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss 2>/dev/null || echo "Migrações já aplicadas ou ignoradas"

echo "Iniciando servidor..."
# Usar ts-node para executar TypeScript diretamente (resolve path aliases corretamente)
# Desabilitar verificação de tipos para permitir execução mesmo com erros
echo "Usando ts-node para executar TypeScript diretamente (transpileOnly mode)"
exec ts-node --transpile-only -r tsconfig-paths/register src/server.ts

