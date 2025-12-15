# Sistema de Gestão de Estoque da Farmácia

Sistema completo para gerenciamento de medicamentos, controle de estoque, dispensação e alertas automatizados.

## Visão Geral

O sistema de farmácia oferece controle total sobre:

- **Medicamentos**: Cadastro, atualização e controle de validade
- **Estoque**: Controle de entrada/saída, alertas automáticos
- **Dispensação**: Registro de medicamentos para pacientes
- **Relatórios**: Análises de consumo, financeiro e tendências
- **Alertas**: Notificações de estoque baixo, vencimento próximo

## Componentes Principais

### PharmacyDashboard

Dashboard principal com visão geral do estoque e alertas críticos.

```tsx
import { PharmacyDashboard } from '@/components/pharmacy';

<PharmacyDashboard />
```

**Funcionalidades:**
- KPIs em tempo real (total medicamentos, valor em estoque, etc.)
- Alertas críticos (estoque baixo, medicamentos vencendo)
- Gráfico de status do estoque
- Atividade recente
- Ações rápidas

### PharmacyStockControl

Controle completo do estoque com filtros e busca avançada.

```tsx
import { PharmacyStockControl } from '@/components/pharmacy';

<PharmacyStockControl />
```

**Funcionalidades:**
- Visualização de estoque por medicamento
- Filtros por categoria, tarja, status
- Busca em tempo real
- Controle de quantidade e valor
- Alertas visuais por status

### PharmacyDispensation

Sistema de dispensação de medicamentos para pacientes.

```tsx
import { PharmacyDispensation } from '@/components/pharmacy';

<PharmacyDispensation />
```

**Funcionalidades:**
- Cadastro de pacientes
- Seleção de medicamentos
- Controle de dosagem e frequência
- Validação de estoque
- Registro de prescrições

### PharmacyEntry

Registro de entrada de medicamentos (compras/fornecimento).

```tsx
import { PharmacyEntry } from '@/components/pharmacy';

<PharmacyEntry />
```

**Funcionalidades:**
- Cadastro de fornecedores
- Controle de lotes e validade
- Registro de valores
- Condições de armazenamento
- Validação automática

## Hook Personalizado

### usePharmacy

Hook que gerencia todo o estado da farmácia e operações.

```tsx
import { usePharmacy } from '@/hooks/usePharmacy';

const {
  medications,
  stock,
  movements,
  alerts,
  dashboardData,
  loading,
  registerEntry,
  registerDispensation,
  searchMedications
} = usePharmacy();
```

## Estrutura de Dados

### Medicamentos (PharmacyMedication)

```typescript
interface PharmacyMedication {
  id: string;
  nomeComercial: string;
  principioAtivo: string;
  dosagem: string;
  apresentacao: string;
  viaAdministracao: string;
  categoria: string;
  tarja: 'Sem tarja' | 'Vermelha' | 'Preta';
  laboratorio: string;
  estoqueMinimo: number;
  estoqueMaximo: number;
  valorUnitario: number;
  necessitaPrescricao: boolean;
  medicamentoControlado: boolean;
  // ... outros campos
}
```

### Estoque (PharmacyStock)

```typescript
interface PharmacyStock {
  medicationId: string;
  medication: PharmacyMedication;
  quantidadeTotal: number;
  valorTotalEstoque: number;
  batches: MedicationBatch[];
  statusEstoque: 'normal' | 'baixo' | 'critico' | 'excessivo';
  ultimoMovimento: Date;
  alertas: StockAlert[];
}
```

### Movimentações (PharmacyMovement)

```typescript
interface PharmacyMovement {
  id: string;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao';
  medicationId: string;
  quantidade: number;
  valorUnitario: number;
  responsavelId: string;
  dataMovimento: Date;
  pacienteId?: string; // Para saídas
  // ... outros campos
}
```

## Funcionalidades Avançadas

### Controle de Estoque Automático

- **Alertas Inteligentes**: Notificações baseadas em regras configuráveis
- **Status Automático**: Cálculo automático do status do estoque
- **Previsão**: Alertas de reposição automática
- **Controle de Lotes**: Rastreamento por lote e fornecedor

### Validação em Tempo Real

- **Estoque Suficiente**: Verificação automática antes da dispensação
- **Validade**: Controle rigoroso de datas de vencimento
- **Prescrição**: Validação de necessidade de prescrição
- **Controle Especial**: Verificação de medicamentos controlados

### Relatórios e Analytics

- **Consumo por Período**: Análise histórica de dispensações
- **Relatório Financeiro**: Controle de custos e lucros
- **Análise de Tendências**: Previsão de demanda
- **Auditoria Completa**: Rastreamento de todas as operações

## Status do Estoque

### Cálculo Automático

```typescript
const getStockStatus = (currentStock: number, minStock: number, maxStock: number) => {
  const percentage = (currentStock / maxStock) * 100;

  if (percentage <= 10) return 'critico';
  if (percentage <= 20) return 'baixo';
  if (percentage > 120) return 'excessivo';
  return 'normal';
};
```

### Cores Visuais

- **Crítico** (< 10%): Vermelho - Ação imediata necessária
- **Baixo** (10-20%): Amarelo - Reposição recomendada
- **Normal** (20-120%): Verde - Estoque adequado
- **Excessivo** (> 120%): Azul - Possível superestoque

## Alertas Automáticos

### Tipos de Alertas

1. **Estoque Baixo**: Quando atinge nível mínimo
2. **Estoque Crítico**: Quando estoque muito baixo
3. **Próximo Vencimento**: Medicamentos vencendo em 30 dias
4. **Vencido**: Medicamentos já vencidos
5. **Excessivo**: Estoque acima do máximo recomendado

### Severidade

- **Baixa**: Informações gerais
- **Média**: Atenção necessária
- **Alta**: Ação necessária
- **Crítica**: Ação imediata obrigatória

## Dispensação de Medicamentos

### Processo Completo

1. **Identificação do Paciente**
   - Busca por nome ou ID
   - Validação de dados

2. **Seleção de Medicamentos**
   - Busca inteligente
   - Validação de estoque
   - Controle de prescrição

3. **Definição de Tratamento**
   - Dosagem e frequência
   - Duração do tratamento
   - Instruções de uso

4. **Registro e Validação**
   - Verificação de estoque
   - Registro da dispensação
   - Atualização automática do estoque

### Validações Automáticas

- **Estoque Disponível**: Verificação antes da dispensação
- **Prescrição Obrigatória**: Controle de medicamentos que precisam receita
- **Controle Especial**: Verificação de medicamentos controlados
- **Dosagem Segura**: Alertas de dosagem fora do padrão

## Entrada de Medicamentos

### Processo de Registro

1. **Seleção do Medicamento**
   - Cadastro ou busca existente
   - Validação de dados

2. **Informações do Lote**
   - Número do lote
   - Data de fabricação/validade
   - Fornecedor

3. **Controle de Quantidade**
   - Quantidade recebida
   - Valores de compra/venda
   - Local de armazenamento

4. **Condições Especiais**
   - Temperatura de armazenamento
   - Umidade necessária
   - Observações importantes

### Validações de Entrada

- **Datas Válidas**: Validade deve ser futura
- **Valores Positivos**: Quantidade e valores > 0
- **Campos Obrigatórios**: Medicamento, lote, fornecedor
- **Local de Armazenamento**: Deve ser especificado

## Relatórios Disponíveis

### Relatórios Operacionais

- **Consumo Diário**: Dispensações por dia
- **Estoque Atual**: Situação completa do estoque
- **Movimentações**: Entradas e saídas por período
- **Alertas**: Histórico de alertas gerados

### Relatórios Gerenciais

- **Análise Financeira**: Custos, lucros e margens
- **Tendências de Consumo**: Padrões de uso
- **Eficiência de Estoque**: Rotação e cobertura
- **Performance de Fornecedores**: Qualidade e prazo

### Relatórios Regulatórios

- **Controle de Medicamentos**: Dispensações de controlados
- **Auditoria**: Todas as operações realizadas
- **Inventário**: Contagem física vs sistema
- **Validade**: Medicamentos próximos do vencimento

## Integração com API

### Endpoints Principais

```typescript
// Dashboard
GET /api/pharmacy/dashboard

// Medicamentos
GET /api/pharmacy/medications
POST /api/pharmacy/medications
PUT /api/pharmacy/medications/:id

// Estoque
GET /api/pharmacy/stock
POST /api/pharmacy/stock/entry
POST /api/pharmacy/stock/dispensation

// Movimentações
GET /api/pharmacy/movements

// Alertas
GET /api/pharmacy/alerts
PUT /api/pharmacy/alerts/:id/resolve

// Relatórios
GET /api/pharmacy/reports/:type
```

### Exemplo de Integração

```typescript
const handleDispensation = async (dispensationData) => {
  try {
    const response = await api.post('/api/pharmacy/stock/dispensation', dispensationData);
    // Atualizar UI com sucesso
  } catch (error) {
    // Tratar erro
  }
};
```

## Configurações do Sistema

### Parâmetros de Estoque

```json
{
  "estoqueBaixoPercentual": 20,
  "estoqueCriticoPercentual": 10,
  "diasAlertaVencimento": 30,
  "diasAlertaReposicao": 7
}
```

### Configurações Gerais

- **Controle de Acesso**: Níveis de permissão por usuário
- **Auditoria**: Registro de todas as operações
- **Backup**: Frequência de backup automático
- **Notificações**: Canais de alerta (email, SMS, sistema)

## Segurança e Compliance

### Controle de Acesso

- **Perfis de Usuário**: Farmacêutico, auxiliar, administrador
- **Permissões Granulares**: Controle por módulo e ação
- **Auditoria Completa**: Log de todas as operações

### Compliance Regulatório

- **Medicamentos Controlados**: Controle rigoroso de dispensação
- **Prescrição Obrigatória**: Validação automática
- **Rastreabilidade**: Controle completo da cadeia de custódia
- **Relatórios Regulatórios**: Geração automática para órgãos fiscalizadores

## Próximas Funcionalidades

- [ ] **Código de Barras**: Leitura automática
- [ ] **Integração SUS**: Sistema Nacional de Saúde
- [ ] **Prescrição Eletrônica**: Integração com médicos
- [ ] **Farmácia Digital**: Aplicativo para pacientes
- [ ] **IA Preditiva**: Previsão de demanda
- [ ] **Blockchain**: Rastreabilidade imutável

## Manutenção e Suporte

### Logs e Monitoramento

- **Logs Detalhados**: Todas as operações registradas
- **Monitoramento em Tempo Real**: Status do sistema
- **Alertas de Sistema**: Problemas técnicos
- **Backup Automático**: Recuperação de dados

### Suporte Técnico

- **Documentação Completa**: Guias de uso e configuração
- **Base de Conhecimento**: Soluções para problemas comuns
- **Suporte 24/7**: Equipe técnica especializada
- **Atualizações**: Melhorias e correções contínuas

---

## Conclusão

O sistema de gestão de estoque da farmácia oferece uma solução completa e integrada para o controle total de medicamentos, desde a entrada até a dispensação, com foco em segurança, eficiência e compliance regulatório.

A arquitetura modular permite fácil manutenção e expansão, enquanto a interface intuitiva garante usabilidade para todos os perfis de usuário.







