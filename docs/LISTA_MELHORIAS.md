# Lista de Melhorias - TalentDash

> Análise completa do código para deixar o site 100% pronto para produção/live.
> Data da análise: 16/03/2026

---

## 1. Melhorias Críticas (Devem ser feitas antes do lançamento)

### 1.1 Sistema de Autenticação Real
**Descrição:** O sistema atual usa mock/localStorage para autenticação. É necessário implementar autenticação real com backend.

**Problemas encontrados:**
- `api.ts` usa localStorage como fallback e não valida tokens corretamente
- Login/registro apenas simulam chamadas API com `setTimeout`
- Não há refresh de token
- Senhas armazenadas em plaintext no mock

**Prioridade:** Alta  
**Esforço:** Grande  
**Arquivos afetados:**
- `app/src/services/api.ts`
- `app/src/hooks/useStore.ts`
- `app/src/sections/LoginPage.tsx`
- `app/src/sections/RegisterPage.tsx`

**Ações:**
1. Implementar JWT com refresh token
2. Criar middleware de autenticação
3. Adicionar hash de senhas (bcrypt)
4. Implementar "esqueci minha senha"
5. Adicionar confirmação de email

---

### 1.2 Validação de Dados no Backend
**Descrição:** Não há validação real de dados no backend - tudo é mockado.

**Problemas encontrados:**
- API aceita qualquer dado sem validação
- Não há sanitização de inputs
- Possível injeção nos campos de texto

**Prioridade:** Alta  
**Esforço:** Médio  
**Arquivos afetados:**
- `app/src/services/api.ts`
- Necessário criar backend real (Node.js/Express ou similar)

**Ações:**
1. Criar schema de validação com Zod para todas as APIs
2. Implementar rate limiting
3. Adicionar sanitização de inputs com DOMPurify
4. Validar tipos de arquivo no upload

---

### 1.3 Persistência Real de Dados
**Descrição:** Dados são armazenados apenas no localStorage - volátil e inseguro.

**Problemas encontrados:**
- Dados perdidos ao limpar cache
- Limite de ~5MB do localStorage
- Não há backup
- Concorrência entre abas não tratada

**Prioridade:** Alta  
**Esforço:** Grande  
**Arquivos afetados:**
- `app/src/services/api.ts`
- `app/src/hooks/useStore.ts`

**Ações:**
1. Configurar banco de dados (PostgreSQL recomendado)
2. Implementar Prisma ou similar como ORM
3. Criar migrations
4. Configurar backup automático

---

### 1.4 Proteção de Rotas e Autorização
**Descrição:** Não há proteção de rotas - usuário pode acessar qualquer página diretamente.

**Problemas encontrados:**
- App.tsx renderiza páginas sem verificar autenticação
- Não há verificação de ownership de jobs/candidatos
- Qualquer usuário pode deletar qualquer candidato alterando o ID

**Prioridade:** Alta  
**Esforço:** Médio  
**Arquivos afetados:**
- `app/src/App.tsx`
- `app/src/hooks/useStore.ts`

**Ações:**
1. Criar componente `ProtectedRoute`
2. Verificar autenticação em cada rota privada
3. Implementar RBAC (Role-Based Access Control)
4. Validar ownership nas APIs

---

### 1.5 Tratamento de Erros Global
**Descrição:** Erros não são tratados adequadamente - falhas silenciosas ou crashes.

**Problemas encontrados:**
- Try/catch vazios em vários lugares
- Erros de API não mostram feedback ao usuário
- Não há Error Boundary do React

**Prioridade:** Alta  
**Esforço:** Médio  
**Arquivos afetados:**
- `app/src/hooks/useStore.ts`
- `app/src/App.tsx` (adicionar Error Boundary)

**Ações:**
1. Implementar React Error Boundary
2. Criar sistema de notificações de erro (toast)
3. Adicionar logging de erros (Sentry)
4. Criar fallback UI para erros

---

### 1.6 Exportação PDF - Problemas de Fonte e Encoding
**Descrição:** PDF exportado pode ter problemas com caracteres especiais.

**Problemas encontrados:**
- jsPDF usa fonte Helvetica que não suporta bem caracteres UTF-8
- Nomes com acentos podem quebrar
- Não há fallback para fontes

**Prioridade:** Alta  
**Esforço:** Pequeno  
**Arquivos afetados:**
- `app/src/utils/export.ts`

**Ações:**
1. Configurar fonte customizada que suporte UTF-8 (Noto Sans)
2. Testar exportação com nomes acentuados
3. Adicionar tratamento para caracteres especiais

---

### 1.7 Validação de Formulários Completa
**Descrição:** Validação de formulários é básica e inconsistente.

**Problemas encontrados:**
- LoginPage tem validação manual básica
- AddCandidatesPage não valida campos obrigatórios
- Não há feedback visual de erros em tempo real

**Prioridade:** Alta  
**Esforço:** Médio  
**Arquivos afetados:**
- `app/src/sections/LoginPage.tsx`
- `app/src/sections/RegisterPage.tsx`
- `app/src/sections/AddCandidatesPage.tsx`
- `app/src/sections/CreateJobPage.tsx`

**Ações:**
1. Implementar React Hook Form em todos os formulários
2. Usar Zod para schemas de validação
3. Adicionar validação em tempo real
4. Melhorar feedback visual de erros

---

## 2. Melhorias Importantes (Primeira semana após lançamento)

### 2.1 Testes Automatizados
**Descrição:** Coverage de testes está em 0% - crítico para manutenção.

**Prioridade:** Alta  
**Esforço:** Grande  
**Arquivos afetados:** Todos

**Ações:**
1. Configurar Vitest para testes unitários
2. Configurar Playwright para testes E2E
3. Criar testes para:
   - Exportação (PDF/Excel)
   - Autenticação
   - CRUD de candidatos
   - Dashboard e gráficos
4. Configurar CI/CD para rodar testes
5. Meta: 80% coverage

---

### 2.2 Lazy Loading e Code Splitting
**Descrição:** Bundle único carrega todo o app de uma vez - performance ruim.

**Problemas encontrados:**
- App.tsx importa todas as páginas síncronas
- Não há lazy loading de componentes pesados (gráficos)
- jsPDF e XLSX são carregados na inicialização

**Prioridade:** Alta  
**Esforço:** Médio  
**Arquivos afetados:**
- `app/src/App.tsx`
- `app/src/sections/DashboardPage.tsx`
- `app/src/utils/export.ts`

**Ações:**
1. Implementar `React.lazy()` para todas as páginas
2. Criar chunks separados para:
   - Sistema de autenticação
   - Dashboard (Recharts)
   - Exportação (jspdf, xlsx)
3. Adicionar Suspense com loading states
4. Configurar prefetch de rotas comuns

**Estimativa de ganho:** Redução de 40-60% no bundle inicial

---

### 2.3 Otimização de Re-renders
**Descrição:** Componentes re-renderizam desnecessariamente.

**Problemas encontrados:**
- `DashboardPage.tsx` recalcula estatísticas a cada render
- `LandingPage.tsx` não usa memo para listas estáticas
- `useStore` não tem selectors otimizados

**Prioridade:** Média  
**Esforço:** Médio  
**Arquivos afetados:**
- `app/src/sections/DashboardPage.tsx`
- `app/src/sections/LandingPage.tsx`
- `app/src/hooks/useStore.ts`

**Ações:**
1. Usar `useMemo` para cálculos pesados (stats, funnelData)
2. Usar `useCallback` para handlers passados a filhos
3. Usar `React.memo` para componentes de lista
4. Implementar selectors no useStore (Zustand-style)

---

### 2.4 Estados de Loading e Feedback Visual
**Descrição:** Falta feedback visual durante operações assíncronas.

**Problemas encontrados:**
- Botões não mostram loading state
- Não há skeleton screens
- Exportação de PDF/Excel não mostra progresso

**Prioridade:** Média  
**Esforço:** Médio  
**Arquivos afetados:**
- `app/src/sections/DashboardPage.tsx`
- `app/src/utils/export.ts`
- `app/src/components/ui/custom/LoadingState.tsx`

**Ações:**
1. Adicionar loading states em todos os botões de ação
2. Criar skeleton screens para dashboard
3. Mostrar toast de sucesso/erro nas exportações
4. Adicionar progress bar para operações longas

---

### 2.5 Responsividade Mobile Completa
**Descrição:** Algumas telas não são totalmente responsivas.

**Problemas encontrados:**
- Tabela de candidatos em `DashboardPage` quebra em telas pequenas
- Gráficos podem ficar cortados
- Formulários não se adaptam bem

**Prioridade:** Média  
**Esforço:** Médio  
**Arquivos afetados:**
- `app/src/sections/DashboardPage.tsx`
- `app/src/sections/CandidateDetailPage.tsx`
- `app/src/sections/AddCandidatesPage.tsx`

**Ações:**
1. Implementar tabela responsiva com scroll horizontal
2. Adicionar breakpoint para cards (1 coluna em mobile)
3. Otimizar gráficos para touch
4. Testar em dispositivos reais

---

### 2.6 Acessibilidade (A11y)
**Descrição:** Acessibilidade não foi considerada no desenvolvimento.

**Problemas encontrados:**
- Cores sem contraste suficiente
- Sem suporte para navegação por teclado
- Não há ARIA labels
- Toast notifications não são anunciadas

**Prioridade:** Média  
**Esforço:** Médio  
**Arquivos afetados:** Todos

**Ações:**
1. Adicionar `aria-label` em todos os botões sem texto
2. Implementar foco visível em todos elementos interativos
3. Verificar contraste de cores (WCAG AA)
4. Adicionar skip links
5. Testar com leitor de tela (NVDA/VoiceOver)

---

### 2.7 SEO e Meta Tags
**Descrição:** Aplicação SPA sem SEO - dificulta indexação.

**Prioridade:** Média  
**Esforço:** Pequeno  
**Arquivos afetados:**
- `app/index.html`
- Criar: `app/src/components/SEO.tsx`

**Ações:**
1. Adicionar meta tags Open Graph
2. Configurar título dinâmico por página
3. Adicionar description e keywords
4. Criar sitemap.xml
5. Configurar robots.txt

---

### 2.8 Documentação de Código
**Descrição:** Código carece de documentação - dificulta onboarding.

**Prioridade:** Média  
**Esforço:** Médio  
**Arquivos afetados:** Todos

**Ações:**
1. Documentar funções complexas com JSDoc
2. Criar README.md completo do projeto
3. Documentar API endpoints
4. Criar guia de contribuição
5. Adicionar comentários em lógicas complexas

---

## 3. Melhorias Desejáveis (Podem ser feitas depois)

### 3.1 PWA (Progressive Web App)
**Descrição:** App não funciona offline e não é instalável.

**Prioridade:** Baixa  
**Esforço:** Médio  
**Arquivos afetados:**
- Criar: `app/public/manifest.json`
- Criar: `app/public/sw.js`
- `app/vite.config.ts`

**Ações:**
1. Criar manifest.json
2. Adicionar service worker
3. Implementar cache de assets
4. Configurar ícones para todas as plataformas
5. Adicionar prompt de instalação

---

### 3.2 Internacionalização (i18n)
**Descrição:** App apenas em português - limita mercado.

**Prioridade:** Baixa  
**Esforço:** Médio  
**Arquivos afetados:** Todos os textos

**Ações:**
1. Configurar react-i18next
2. Extrair todas as strings para arquivos de tradução
3. Adicionar suporte a inglês e espanhol
4. Configurar detecção de idioma do navegador

---

### 3.3 Analytics e Tracking
**Descrição:** Sem visibilidade de uso do produto.

**Prioridade:** Baixa  
**Esforço:** Pequeno  
**Arquivos afetados:**
- `app/src/App.tsx`
- `app/src/hooks/useStore.ts`

**Ações:**
1. Configurar Google Analytics 4
2. Adicionar event tracking (exportação, criação de jobs)
3. Configurar Mixpanel para funnels
4. Adicionar heatmaps (Hotjar)

---

### 3.4 Melhorias no Sistema de Exportação

#### 3.4.1 Exportação CSV Nativa
**Descrição:** Não há opção de exportação CSV simples.

**Prioridade:** Baixa  
**Esforço:** Pequeno  
**Arquivo:** `app/src/utils/export.ts`

---

#### 3.4.2 Agendamento de Relatórios
**Descrição:** Usuário não pode agendar envio automático de relatórios.

**Prioridade:** Baixa  
**Esforço:** Grande  
**Ações:**
1. Criar sistema de cron jobs
2. Implementar envio de email
3. Adicionar interface de configuração

---

#### 3.4.3 Preview de Exportação
**Descrição:** Usuário não vê preview antes de exportar.

**Prioridade:** Baixa  
**Esforço:** Médio  
**Arquivos afetados:**
- `app/src/sections/DashboardPage.tsx`
- Criar: `app/src/components/ExportPreview.tsx`

---

### 3.5 Features de Colaboração

#### 3.5.1 Compartilhamento Real
**Descrição:** "Compartilhar" apenas copia URL - não há colaboração.

**Prioridade:** Baixa  
**Esforço:** Grande  
**Ações:**
1. Implementar permissões de acesso
2. Criar sistema de convites por email
3. Adicionar diferentes níveis de acesso (view/edit)

---

#### 3.5.2 Comentários em Candidatos
**Descrição:** Observações são apenas texto simples.

**Prioridade:** Baixa  
**Esforço:** Médio  
**Arquivos afetados:**
- `app/src/sections/CandidateDetailPage.tsx`
- `app/src/types/index.ts`

---

#### 3.5.3 Histórico de Atividades
**Descrição:** Timeline atual é estática/mockada.

**Prioridade:** Baixa  
**Esforço:** Médio  
**Ações:**
1. Criar tabela de audit logs
2. Registrar todas as ações
3. Mostrar timeline real

---

### 3.6 Otimizações de Performance

#### 3.6.1 Virtualização de Listas
**Descrição:** Listas grandes podem causar lag.

**Prioridade:** Baixa  
**Esforço:** Médio  
**Arquivos afetados:**
- `app/src/sections/DashboardPage.tsx`

**Ação:** Implementar `react-window` ou `react-virtualized`

---

#### 3.6.2 Otimização de Imagens
**Descrição:** Logo e imagens não estão otimizadas.

**Prioridade:** Baixa  
**Esforço:** Pequeno  
**Ações:**
1. Converter logos para WebP
2. Implementar lazy loading de imagens
3. Adicionar placeholders

---

## 4. Funcionalidades Futuras (Roadmap)

### 4.1 Inteligência Artificial

#### 4.1.1 Parsing Inteligente de Currículos
- Extrair dados automaticamente de PDFs de currículos
- Usar OCR para imagens
- Integração com APIs de IA (OpenAI, Claude)

#### 4.1.2 Score de Matching
- Algoritmo que calcula compatibilidade candidato x vaga
- Baseado em palavras-chave, experiência, skills
- Ranking automático de candidatos

#### 4.1.3 Sugestões de Entrevista
- Gerar perguntas personalizadas baseadas no perfil
- Análise de gaps no currículo

---

### 4.2 Integrações

#### 4.2.1 Integração com LinkedIn
- Importar candidatos direto do LinkedIn
- Buscar perfis públicos
- Compartilhar vagas

#### 4.2.2 Integração com Gmail/Outlook
- Enviar emails direto do sistema
- Templates de comunicação
- Tracking de abertura

#### 4.2.3 Webhooks
- Notificar sistemas externos de mudanças
- Integração com Slack/Teams
- Zapier/Make.com

---

### 4.3 Features Avançadas

#### 4.3.1 Pipeline Customizável
- Permitir criar etapas personalizadas do funil
- Workflow de aprovação
- Regras automáticas (ex: mover para "Teste" se nota > 7)

#### 4.3.2 Calendário de Entrevistas
- Integração com Google Calendar
- Agendamento automático
- Lembretes por email

#### 4.3.3 Biblioteca de Templates
- Templates de vagas pré-configurados
- Templates de campos personalizados por indústria
- Comunidade de templates

#### 4.3.4 Relatórios Avançados
- Exportação PowerPoint
- Dashboards customizáveis
- Comparativo entre vagas
- Previsões com ML

---

### 4.4 Escalabilidade Enterprise

#### 4.4.1 SSO (Single Sign-On)
- SAML 2.0
- OAuth 2.0 / OpenID Connect
- Google Workspace / Microsoft 365

#### 4.4.2 White Label
- Customização completa de marca
- Domínio próprio
- Cores e logo personalizados

#### 4.4.3 API Pública
- REST API documentada
- GraphQL
- Rate limiting por tier

#### 4.4.4 Compliance
- LGPD/GDPR compliance
- Criptografia end-to-end
- Audit logs completos
- Certificações SOC2

---

## Resumo por Categoria

| Categoria | Qtd Itens | Prioridade Média | Esforço Total |
|-----------|-----------|------------------|---------------|
| Críticas | 7 | Alta | 3 Grandes, 3 Médios, 1 Pequeno |
| Importantes | 8 | Alta/Média | 1 Grande, 5 Médios, 2 Pequenos |
| Desejáveis | 11 | Baixa/Média | 2 Grandes, 5 Médios, 4 Pequenos |
| Futuras | 15 | Baixa | - |

---

## Recomendações de Priorização

### Sprint 1 (Semana 1-2): Fundação
1. Implementar backend real (auth + database)
2. Proteção de rotas
3. Tratamento de erros global

### Sprint 2 (Semana 3-4): Qualidade
1. Validação de formulários completa
2. Lazy loading e code splitting
3. Corrigir PDF encoding

### Sprint 3 (Semana 5-6): Performance & UX
1. Otimização de re-renders
2. Estados de loading
3. Responsividade mobile

### Sprint 4 (Semana 7-8): Polish
1. Testes automatizados
2. Acessibilidade
3. SEO

---

## Notas Técnicas

### Dependências a Avaliar
- `jspdf` + `jspdf-autotable` → Considerar `pdfmake` para melhor suporte UTF-8
- `xlsx` → Pesado, considerar `sheetjs` alternativas mais leves
- `recharts` → Ok, mas monitorar bundle size
- `react-grid-layout` → Verificar se é realmente necessário

### Débito Técnico Identificado
1. Uso de `any` em vários lugares
2. Funções muito longas (DashboardPage.tsx > 600 linhas)
3. Duplicação de código (THEME_COLORS definido em múltiplos lugares)
4. Mock data misturada com código de produção

### Segurança - Itens Pendentes
- [ ] HTTPS obrigatório
- [ ] Headers de segurança (CSP, HSTS)
- [ ] Rate limiting
- [ ] Sanitização de HTML
- [ ] CSRF protection
- [ ] Validação de upload de arquivos
