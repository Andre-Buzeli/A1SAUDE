# Sistema de Mapa de Leitos

Sistema completo para visualização e edição visual do mapa de leitos hospitalares, com interface intuitiva e ferramentas avançadas.

## Componentes Principais

### BedMapVisualizer

Componente principal que alterna entre modos de visualização e edição.

```tsx
import { BedMapVisualizer } from '@/components/bed-map';

<BedMapVisualizer
  bedMap={bedMapData}
  loading={isLoading}
  selectedUnit={selectedUnit}
  onUnitChange={setSelectedUnit}
  onSaveLayout={handleSaveLayout}
/>
```

### BedMapEditor

Editor visual completo com ferramentas para modificar o layout dos leitos.

```tsx
import { BedMapEditor } from '@/components/bed-map';

<BedMapEditor
  initialLayout={layout}
  onSave={async (layout) => {
    // Salvar layout na API
  }}
  onCancel={() => {
    // Voltar para visualização
  }}
/>
```

## Hook Personalizado

### useBedMapEditor

Hook que gerencia todo o estado do editor visual.

```tsx
import { useBedMapEditor } from '@/hooks/useBedMapEditor';

const {
  isEditMode,
  selectedTool,
  selectedBedId,
  layout,
  hasUnsavedChanges,
  toggleEditMode,
  selectTool,
  startDrag,
  updateDrag,
  endDrag,
  addBed,
  deleteBed,
  deleteWall,
  saveLayout,
  resetLayout
} = useBedMapEditor(initialLayout);
```

## Ferramentas do Editor

### Ferramentas Disponíveis

| Ferramenta | Ícone | Descrição |
|------------|-------|-----------|
| **Selecionar** | MousePointer | Selecionar e visualizar detalhes de leitos |
| **Mover** | Move | Arrastar leitos para reposicioná-los |
| **Desenhar Parede** | PenTool | Desenhar paredes clicando e arrastando |
| **Adicionar Leito** | Plus | Adicionar novo leito clicando na área vazia |
| **Apagar** | Trash2 | Remover leitos ou paredes clicando neles |

### Como Usar as Ferramentas

#### Selecionar Leito
1. Clique na ferramenta "Selecionar"
2. Clique em qualquer leito
3. Um painel lateral aparecerá com detalhes editáveis

#### Mover Leito
1. Clique na ferramenta "Mover"
2. Clique e arraste um leito para reposicioná-lo
3. O leito será reposicionado automaticamente

#### Desenhar Parede
1. Clique na ferramenta "Desenhar Parede"
2. Clique no ponto inicial
3. Arraste até o ponto final
4. Solte para criar a parede

#### Adicionar Leito
1. Clique na ferramenta "Adicionar Leito"
2. Clique em qualquer área vazia do canvas
3. Um novo leito será criado na posição clicada

#### Apagar Elementos
1. Clique na ferramenta "Apagar"
2. Clique no leito ou parede que deseja remover
3. O elemento será removido imediatamente

## Estrutura de Dados

### BedPosition
```typescript
interface BedPosition {
  id: string;              // ID único do leito
  x: number;              // Posição X no canvas
  y: number;              // Posição Y no canvas
  width: number;          // Largura do leito
  height: number;         // Altura do leito
  number: string;         // Número/identificação do leito
  type: string;           // Tipo (standard, icu, surgery)
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  unit: string;           // Unidade/setor
  patient?: {             // Paciente internado (opcional)
    id: string;
    name: string;
    admissionDate: string;
  };
}
```

### Wall
```typescript
interface Wall {
  id: string;             // ID único da parede
  x1: number;             // Ponto inicial X
  y1: number;             // Ponto inicial Y
  x2: number;             // Ponto final X
  y2: number;             // Ponto final Y
  type: 'wall' | 'door';  // Tipo da parede
}
```

### BedMapLayout
```typescript
interface BedMapLayout {
  beds: BedPosition[];           // Array de leitos
  walls: Wall[];                 // Array de paredes
  units: string[];               // Lista de unidades
  canvasSize: {                  // Tamanho do canvas
    width: number;
    height: number;
  };
}
```

## Funcionalidades Avançadas

### Drag and Drop
- Sistema de arrastar e soltar nativo do HTML5
- Limitação automática aos limites do canvas
- Prevenção de sobreposição de elementos
- Feedback visual durante o movimento

### Canvas Interativo
- Grade de fundo para alinhamento visual
- Zoom e pan (planejado para futuras versões)
- Responsividade automática
- Limites de canvas configuráveis

### Persistência de Dados
- Salvamento automático de alterações
- Indicador visual de mudanças não salvas
- Possibilidade de resetar para estado anterior
- Validação de dados antes do salvamento

### Interface de Usuário

#### Modo Visualização
- Visualização em tempo real do status dos leitos
- Estatísticas por unidade
- Filtros por unidade/setor
- Cores por status (disponível, ocupado, manutenção, limpeza)

#### Modo Edição
- Barra de ferramentas flutuante
- Painel lateral de propriedades
- Pré-visualização em tempo real
- Instruções contextuais

### Acessibilidade

- Navegação completa por teclado
- Labels adequadas para leitores de tela
- Contraste de cores adequado
- Indicadores visuais claros

## Integração com API

### Endpoints Sugeridos

```typescript
// Carregar layout atual
GET /api/hospital/beds/layout

// Salvar novo layout
POST /api/hospital/beds/layout
Body: BedMapLayout

// Atualizar status de leito
PUT /api/hospital/beds/:id/status
Body: { status: 'occupied', patientId?: string }

// Obter dados de ocupação
GET /api/hospital/beds/occupancy
```

### Exemplo de Implementação

```typescript
const handleSaveLayout = async (layout: BedMapLayout) => {
  try {
    const response = await api.post('/api/hospital/beds/layout', layout);
    toast.success('Layout salvo com sucesso!');
    return { success: true };
  } catch (error) {
    toast.error('Erro ao salvar layout');
    return { success: false, error };
  }
};
```

## Personalização

### Estilos Visuais

O componente usa Tailwind CSS e pode ser personalizado através de:

- Variáveis CSS personalizadas
- Classes de tema
- Props de estilização
- Componentes base customizáveis

### Configurações

```typescript
const editorConfig = {
  canvasSize: { width: 1200, height: 800 },
  gridSize: 20,
  bedSize: { width: 60, height: 40 },
  colors: {
    available: '#10B981',
    occupied: '#EF4444',
    maintenance: '#F59E0B',
    cleaning: '#3B82F6'
  }
};
```

## Próximas Funcionalidades

- [ ] Zoom e pan no canvas
- [ ] Templates pré-definidos de layout
- [ ] Importação/exportação de layouts
- [ ] Histórico de versões
- [ ] Compartilhamento de layouts
- [ ] Integração com sistemas de planejamento hospitalar

## Solução de Problemas

### Problemas Comuns

1. **Leitos não se movem**
   - Verifique se a ferramenta "Mover" está selecionada
   - Certifique-se de clicar no leito e não na parede

2. **Paredes não aparecem**
   - Verifique se está no modo de edição
   - Certifique-se de arrastar (não apenas clicar)

3. **Alterações não salvam**
   - Verifique conexão com a API
   - Confirme que não há erros de validação

### Debug

Para ativar o modo debug, adicione `?debug=true` à URL:

```typescript
const isDebug = new URLSearchParams(window.location.search).get('debug') === 'true';

if (isDebug) {
  console.log('BedMap Debug:', layout);
}
```

## Contribuição

Para contribuir com melhorias:

1. Siga os padrões de código estabelecidos
2. Adicione testes para novas funcionalidades
3. Atualize a documentação
4. Mantenha compatibilidade com versões anteriores









