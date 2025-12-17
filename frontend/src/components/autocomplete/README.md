# Componentes de Autocomplete

Este diretório contém componentes de autocomplete para seleção de CID-10 e medicamentos, com funcionalidades avançadas de busca e interface visual moderna.

## Componentes Disponíveis

### CID10Select

Componente para seleção de códigos CID-10 (Classificação Internacional de Doenças) com busca em tempo real.

```tsx
import { CID10Select } from '@/components/autocomplete';

<CID10Select
  label="Diagnóstico (CID-10)"
  value={selectedCID10}
  onChange={(value, option) => {
    console.log('Código selecionado:', value);
    console.log('Opção completa:', option);
  }}
  required
  showCategory
/>
```

### MedicationSelect

Componente para seleção de medicamentos com busca por nome comercial, princípio ativo, laboratório, etc.

```tsx
import { MedicationSelect } from '@/components/autocomplete';

<MedicationSelect
  label="Medicamento"
  value={selectedMedication}
  onChange={(value, option) => {
    console.log('ID selecionado:', value);
    console.log('Medicamento completo:', option);
  }}
  required
  showDetails
/>
```

## Propriedades

### CID10Select Props

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `label` | `string` | Não | Rótulo do campo |
| `value` | `string` | Não | Valor selecionado (código CID-10) |
| `onChange` | `(value: string, option?: CID10Option) => void` | Sim | Callback chamado quando uma opção é selecionada |
| `placeholder` | `string` | Não | Placeholder do campo de busca |
| `error` | `string` | Não | Mensagem de erro a ser exibida |
| `required` | `boolean` | Não | Indica se o campo é obrigatório |
| `disabled` | `boolean` | Não | Desabilita o componente |
| `className` | `string` | Não | Classes CSS adicionais |
| `showCategory` | `boolean` | Não | Mostra a categoria da doença (padrão: true) |

### MedicationSelect Props

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `label` | `string` | Não | Rótulo do campo |
| `value` | `string` | Não | Valor selecionado (ID do medicamento) |
| `onChange` | `(value: string, option?: MedicationOption) => void` | Sim | Callback chamado quando uma opção é selecionada |
| `placeholder` | `string` | Não | Placeholder do campo de busca |
| `error` | `string` | Não | Mensagem de erro a ser exibida |
| `required` | `boolean` | Não | Indica se o campo é obrigatório |
| `disabled` | `boolean` | Não | Desabilita o componente |
| `className` | `string` | Não | Classes CSS adicionais |
| `showDetails` | `boolean` | Não | Mostra detalhes adicionais (laboratório, tarja) |

## Hooks Personalizados

### useCID10

Hook para busca otimizada de códigos CID-10.

```tsx
import { useCID10 } from '@/hooks/useAutocomplete';

const MyComponent = () => {
  const { options, isLoading, findByCode, searchByDescription } = useCID10('gripe', 10);

  // Buscar por código específico
  const cid10 = findByCode('J06.9');

  // Buscar por descrição
  const results = searchByDescription('infeccao viral');

  return (
    <div>
      {isLoading ? 'Carregando...' : options.map(option => (
        <div key={option.code}>{option.description}</div>
      ))}
    </div>
  );
};
```

### useMedications

Hook para busca otimizada de medicamentos.

```tsx
import { useMedications } from '@/hooks/useAutocomplete';

const MyComponent = () => {
  const { options, isLoading, findById, searchByActivePrinciple } = useMedications('dipirona', 10);

  // Buscar por ID específico
  const medication = findById('DIPIRONA-500MG');

  // Buscar por princípio ativo
  const results = searchByActivePrinciple('paracetamol');

  return (
    <div>
      {isLoading ? 'Carregando...' : options.map(med => (
        <div key={med.id}>{med.nomeComercial}</div>
      ))}
    </div>
  );
};
```

## Funcionalidades

### Busca em Tempo Real
- Busca instantânea conforme o usuário digita
- Limitação automática de resultados (máximo 100)
- Destaque visual do resultado selecionado

### Navegação por Teclado
- `↑` / `↓`: Navegar entre opções
- `Enter`: Selecionar opção destacada
- `Esc`: Fechar dropdown e limpar busca

### Interface Visual
- Design glassmorphism consistente com o sistema
- Indicadores visuais de tarja (medicamentos)
- Códigos destacados em azul (CID-10)
- Ícones contextuais

### Performance
- Filtragem otimizada com useMemo
- Limitação de resultados para evitar sobrecarga
- Busca case-insensitive

## Dados Disponíveis

### CID-10
- **Arquivo**: `frontend/src/data/cid10.json`
- **Estrutura**: Código, descrição e categoria
- **Quantidade**: Mais de 10.000 códigos
- **Fonte**: Classificação Internacional de Doenças (CID-10)

### Medicamentos
- **Arquivo**: `frontend/src/data/medicamentos.json`
- **Estrutura**: ID único, nome comercial, princípio ativo, dosagem, apresentação, via administração, categoria, tarja, laboratório
- **Quantidade**: 100+ medicamentos comuns
- **Fonte**: Medicamentos brasileiros de referência

## Exemplo de Uso Completo

Veja o componente `AutocompleteExample.tsx` para um exemplo completo de uso dos componentes.

## Considerações de Performance

1. **Limitação de Resultados**: Máximo 100 resultados por busca para evitar lentidão
2. **Debounce**: Considere implementar debounce na busca se necessário
3. **Memoização**: Os hooks usam useMemo para otimizar re-renders
4. **Lazy Loading**: Dados são carregados apenas quando necessário

## Acessibilidade

- Suporte completo a navegação por teclado
- Labels adequados para leitores de tela
- Contraste de cores adequado
- Focus management automático









