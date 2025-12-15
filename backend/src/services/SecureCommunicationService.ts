import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export interface SyncSecurityConfig {
  jwtSecret: string;
  localSystemSecret: string;
  centralSystemSecret: string;
  tokenExpiry: string;
  encryptionAlgorithm: string;
  hashAlgorithm: string;
}

export interface SecureSyncPackage {
  token: string;
  data: string;
  hash: string;
  timestamp: number;
}

export interface SyncPayload {
  events: any[];
  establishmentId: string;
  timestamp: number;
  nonce: string;
}

export class SecureCommunicationService {
  private config: SyncSecurityConfig;

  constructor(config: SyncSecurityConfig) {
    this.config = config;
  }

  createSecureSyncPackage(events: any[], establishmentId: string): SecureSyncPackage {
    const token = this.generateLocalSystemToken(establishmentId);
    const payload: SyncPayload = {
      events,
      establishmentId,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    };
    
    const encryptedData = this.encryptMessage(JSON.stringify(payload), this.config.localSystemSecret);
    const hash = this.createDataHash(events);
    
    return { token, data: encryptedData, hash, timestamp: Date.now() };
  }

  async validateAndProcessSyncPackage(
    packageData: SecureSyncPackage,
    senderEstablishmentId: string
  ): Promise<{ isValid: boolean; payload?: SyncPayload; error?: string }> {
    try {
      const tokenPayload = jwt.verify(packageData.token, this.config.jwtSecret) as any;
      
      if (tokenPayload.establishmentId !== senderEstablishmentId) {
        return { isValid: false, error: 'Token establishment ID mismatch' };
      }
      
      if (tokenPayload.exp && tokenPayload.exp < Date.now() / 1000) {
        return { isValid: false, error: 'Token expired' };
      }
      
      const decryptedData = this.decryptMessage(packageData.data, this.config.centralSystemSecret);
      const payload: SyncPayload = JSON.parse(decryptedData);
      
      const expectedHash = this.createDataHash(payload.events);
      if (expectedHash !== packageData.hash) {
        return { isValid: false, error: 'Data hash mismatch' };
      }
      
      const now = Date.now();
      const packageAge = now - payload.timestamp;
      const maxAge = 5 * 60 * 1000;
      
      if (packageAge > maxAge) {
        return { isValid: false, error: 'Package too old (possible replay attack)' };
      }
      
      if (!payload.nonce || payload.nonce.length < 16) {
        return { isValid: false, error: 'Invalid nonce' };
      }
      
      return { isValid: true, payload };
      
    } catch (error) {
      return { isValid: false, error: `Validation failed: ${error.message}` };
    }
  }

  generateLocalSystemToken(establishmentId: string): string {
    const payload = {
      establishmentId,
      type: 'local-system',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60)
    };
    
    return jwt.sign(payload, this.config.jwtSecret);
  }

  encryptMessage(message: string, key: string): string {
    const algorithm = this.config.encryptionAlgorithm;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  decryptMessage(encryptedMessage: string, key: string): string {
    const algorithm = this.config.encryptionAlgorithm;
    const parts = encryptedMessage.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted message format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(algorithm, key);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  createDataHash(data: any): string {
    const dataString = JSON.stringify(data);
    return crypto.createHash(this.config.hashAlgorithm).update(dataString).digest('hex');
  }

  generateApiToken(establishmentId: string, permissions: string[] = []): string {
    const payload = {
      establishmentId,
      permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };
    
    return jwt.sign(payload, this.config.jwtSecret);
  }

  validateApiToken(token: string): { isValid: boolean; establishmentId?: string; permissions?: string[]; error?: string } {
    try {
      const payload = jwt.verify(token, this.config.jwtSecret) as any;
      
      return {
        isValid: true,
        establishmentId: payload.establishmentId,
        permissions: payload.permissions || []
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }
}

export function createSecureCommunicationService(config?: Partial<SyncSecurityConfig>): SecureCommunicationService {
  const finalConfig: SyncSecurityConfig = {
    jwtSecret: process.env.SYNC_JWT_SECRET || 'sync-jwt-secret-2024-a1-saude',
    localSystemSecret: process.env.LOCAL_SYSTEM_SECRET || 'local-system-secret-key-2024',
    centralSystemSecret: process.env.CENTRAL_SYSTEM_SECRET || 'central-system-secret-key-2024',
    tokenExpiry: '1h',
    encryptionAlgorithm: 'aes-256-cbc',
    hashAlgorithm: 'sha256',
    ...config
  };
  
  return new SecureCommunicationService(finalConfig);
}