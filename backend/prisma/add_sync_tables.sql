-- Tabela para eventos de sincronização
CREATE TABLE IF NOT EXISTS "SyncEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para cache offline
CREATE TABLE IF NOT EXISTS "OfflineCache" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "data" TEXT NOT NULL,
  "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ttl" INTEGER NOT NULL DEFAULT 3600,
  "expiresAt" DATETIME NOT NULL,
  "accessCount" INTEGER NOT NULL DEFAULT 0,
  "lastAccessed" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para operações offline
CREATE TABLE IF NOT EXISTS "OfflineOperation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "method" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "headers" TEXT,
  "body" TEXT,
  "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "response" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS "SyncEvent_type_status_idx" ON "SyncEvent"("type", "status");
CREATE INDEX IF NOT EXISTS "SyncEvent_timestamp_idx" ON "SyncEvent"("timestamp");
CREATE INDEX IF NOT EXISTS "SyncEvent_status_retryCount_idx" ON "SyncEvent"("status", "retryCount");
CREATE INDEX IF NOT EXISTS "OfflineCache_key_idx" ON "OfflineCache"("key");
CREATE INDEX IF NOT EXISTS "OfflineCache_expiresAt_idx" ON "OfflineCache"("expiresAt");
CREATE INDEX IF NOT EXISTS "OfflineOperation_status_retryCount_idx" ON "OfflineOperation"("status", "retryCount");
CREATE INDEX IF NOT EXISTS "OfflineOperation_timestamp_idx" ON "OfflineOperation"("timestamp");