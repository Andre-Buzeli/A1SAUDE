# A1 Saúde - Frontend

Sistema frontend do A1 Saúde com tema escuro, glassmorphismo e partículas animadas.

## 🎨 Características Visuais

- **Tema Escuro Premium**: Interface sofisticada em modo escuro inspirada na identidade A1 Saúde
- **Glassmorphismo Refinado**: Efeitos de vidro com blur de 2px e bordas sutis
- **Partículas Animadas**: Fundo com partículas flutuantes suaves em 3 tamanhos
- **Paleta A1 Saúde**: Cores médicas profissionais alinhadas com a marca
- **Logo Oficial**: Logomarca A1 Saúde integrada ao design
- **Tipografia Premium**: Inter com recursos OpenType para melhor legibilidade

## 📁 Estrutura de Páginas

```
src/
├── pages/
│   ├── LoginPage.tsx          # Página de login com partículas
│   ├── DashboardPage.tsx      # Dashboard principal
│   ├── PatientsPage.tsx       # Gestão de pacientes
│   └── AppointmentsPage.tsx   # Gestão de consultas
├── components/
│   └── Layout.tsx             # Layout principal com sidebar
├── App.tsx                    # Roteador principal
├── main.tsx                   # Entry point
└── index.css                  # Estilos globais e tema
```

## 🚀 Páginas Implementadas

### 1. Login (`/login`)
- Formulário de login com glassmorphismo
- Fundo de partículas animadas (3 tamanhos diferentes)
- Validação de campos
- Transições suaves

### 2. Dashboard (`/dashboard`)
- Cards de estatísticas
- Próximas consultas
- Alertas do sistema
- Layout responsivo

### 3. Pacientes (`/patients`)
- Lista de pacientes
- Busca e filtros
- Tabela responsiva
- Ações de CRUD

### 4. Consultas (`/appointments`)
- Lista de consultas agendadas
- Filtros por data e especialidade
- Status coloridos (confirmado, pendente, cancelado)
- Cards informativos

## 🎯 Funcionalidades

- **Roteamento**: React Router com rotas protegidas
- **Layout Responsivo**: Sidebar colapsível
- **Navegação**: Menu lateral com ícones
- **Estados Visuais**: Hover, focus, active states
- **Acessibilidade**: Labels, contraste adequado

## 🛠️ Tecnologias

- **React 18** com TypeScript
- **React Router DOM** para navegação
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **Vite** como bundler

## 🎨 Sistema de Cores A1 Saúde

### Paleta Principal
- **A1 Blue**: `--medical-blue` (59 130 246) - Cor principal da marca
- **A1 Teal**: `--medical-teal` (6 182 212) - Cor secundária ciano
- **A1 Green**: `--medical-green` (16 185 129) - Verde saúde/sucesso
- **A1 Red**: `--medical-red` (239 68 68) - Vermelho médico/urgente
- **A1 Amber**: `--medical-amber` (245 158 11) - Âmbar atenção
- **A1 Purple**: `--medical-purple` (147 51 234) - Roxo premium

### Backgrounds Sofisticados
- **Primário**: `--bg-primary` (8 12 23) - Preto azulado profundo
- **Secundário**: `--bg-secondary` (15 23 42) - Azul escuro elegante
- **Terciário**: `--bg-tertiary` (30 41 59) - Azul médio refinado

### Variações de Cor
Cada cor médica possui 3 variações:
- **Light**: Versão mais clara para hover/destaque
- **Base**: Cor principal
- **Dark**: Versão mais escura para pressed/ativo

## 🔧 Comandos

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🌟 Próximas Funcionalidades

- [ ] Autenticação real
- [ ] Página de Exames
- [ ] Página de Relatórios
- [ ] Página de Médicos
- [ ] Configurações do sistema
- [ ] Notificações em tempo real
- [ ] Modo claro (toggle)
- [ ] PWA (Progressive Web App)

## 📱 Responsividade

O sistema é totalmente responsivo com breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎭 Animações

- **Partículas**: 3 tipos com velocidades diferentes
- **Glassmorphismo**: Blur de 2px com transparência
- **Transições**: 300ms ease para interações
- **Hover Effects**: Elevação e mudança de cor