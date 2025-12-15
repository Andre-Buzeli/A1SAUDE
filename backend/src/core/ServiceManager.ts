/**
 * ServiceManager - Gerencia inicialização ordenada de serviços com dependências
 */

export interface Service {
  name: string;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

interface ServiceNode {
  service: Service;
  dependencies: string[];
  initialized: boolean;
}

export class ServiceManager {
  private services: Map<string, ServiceNode> = new Map();
  private initializationOrder: string[] = [];
  private isInitialized: boolean = false;

  /**
   * Registra um serviço com suas dependências
   */
  register(service: Service, dependencies: string[] = []): void {
    if (this.services.has(service.name)) {
      throw new Error(`Serviço ${service.name} já está registrado`);
    }

    this.services.set(service.name, {
      service,
      dependencies,
      initialized: false
    });

    console.log(`[ServiceManager] Serviço registrado: ${service.name}`);
  }

  /**
   * Calcula a ordem de inicialização baseada em dependências (topological sort)
   */
  private calculateInitializationOrder(): void {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (serviceName: string): void => {
      if (visited.has(serviceName)) return;
      
      if (visiting.has(serviceName)) {
        throw new Error(`Dependência circular detectada envolvendo: ${serviceName}`);
      }

      visiting.add(serviceName);

      const node = this.services.get(serviceName);
      if (!node) {
        throw new Error(`Serviço ${serviceName} não encontrado`);
      }

      // Visitar dependências primeiro
      for (const dep of node.dependencies) {
        if (!this.services.has(dep)) {
          throw new Error(`Dependência ${dep} do serviço ${serviceName} não está registrada`);
        }
        visit(dep);
      }

      visiting.delete(serviceName);
      visited.add(serviceName);
      order.push(serviceName);
    };

    // Visitar todos os serviços
    for (const serviceName of this.services.keys()) {
      visit(serviceName);
    }

    this.initializationOrder = order;
  }

  /**
   * Inicializa todos os serviços na ordem correta
   */
  async initializeAll(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[ServiceManager] Serviços já foram inicializados');
      return;
    }

    console.log('[ServiceManager] Iniciando serviços...');

    // Calcular ordem de inicialização
    this.calculateInitializationOrder();

    // Inicializar serviços na ordem
    for (const serviceName of this.initializationOrder) {
      const node = this.services.get(serviceName);
      if (!node) continue;

      try {
        console.log(`[ServiceManager] Inicializando: ${serviceName}...`);
        await node.service.initialize();
        node.initialized = true;
        console.log(`[ServiceManager] ✓ ${serviceName} inicializado`);
      } catch (error) {
        console.error(`[ServiceManager] ✗ Erro ao inicializar ${serviceName}:`, error);
        throw new Error(`Falha ao inicializar serviço ${serviceName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    this.isInitialized = true;
    console.log('[ServiceManager] ✓ Todos os serviços inicializados com sucesso');
  }

  /**
   * Desliga todos os serviços na ordem reversa
   */
  async shutdownAll(): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[ServiceManager] Serviços não estão inicializados');
      return;
    }

    console.log('[ServiceManager] Desligando serviços...');

    // Desligar em ordem reversa
    const shutdownOrder = [...this.initializationOrder].reverse();

    for (const serviceName of shutdownOrder) {
      const node = this.services.get(serviceName);
      if (!node || !node.initialized) continue;

      try {
        console.log(`[ServiceManager] Desligando: ${serviceName}...`);
        await node.service.shutdown();
        node.initialized = false;
        console.log(`[ServiceManager] ✓ ${serviceName} desligado`);
      } catch (error) {
        console.error(`[ServiceManager] ✗ Erro ao desligar ${serviceName}:`, error);
        // Continuar desligando outros serviços mesmo se um falhar
      }
    }

    this.isInitialized = false;
    console.log('[ServiceManager] ✓ Todos os serviços desligados');
  }

  /**
   * Verifica saúde de todos os serviços
   */
  async healthCheckAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [name, node] of this.services) {
      if (!node.initialized) {
        results.set(name, false);
        continue;
      }

      try {
        const isHealthy = await node.service.healthCheck();
        results.set(name, isHealthy);
      } catch (error) {
        console.error(`[ServiceManager] Health check falhou para ${name}:`, error);
        results.set(name, false);
      }
    }

    return results;
  }

  /**
   * Obtém um serviço específico
   */
  getService<T extends Service>(name: string): T | null {
    const node = this.services.get(name);
    return node ? (node.service as T) : null;
  }

  /**
   * Verifica se um serviço está inicializado
   */
  isServiceInitialized(name: string): boolean {
    const node = this.services.get(name);
    return node ? node.initialized : false;
  }

  /**
   * Obtém status de todos os serviços
   */
  getStatus(): { name: string; initialized: boolean; dependencies: string[] }[] {
    return Array.from(this.services.entries()).map(([name, node]) => ({
      name,
      initialized: node.initialized,
      dependencies: node.dependencies
    }));
  }
}

// Exporta instância singleton
export const serviceManager = new ServiceManager();
