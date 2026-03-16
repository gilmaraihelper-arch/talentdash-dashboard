# Relatório de Revisão de Código - TalentDash Frontend

**Data:** 16/03/2026  
**Projeto:** TalentDash (React + TypeScript + Vite)  
**Autor:** Alex 🎨 (Subagente Frontend)

---

## 📊 Resumo Executivo

O código do TalentDash apresenta uma arquitetura funcional com boas práticas em algumas áreas, mas possui **problemas críticos de qualidade**, **bugs potenciais** e **oportunidades significativas de melhoria**. A aplicação é um MVP visual bem estruturado, mas precisa de atenção em aspectos de performance, segurança e manutenibilidade.

### Distribuição de Problemas por Prioridade

| Prioridade | Quantidade | Status |
|------------|------------|--------|
| 🔴 Crítico | 4 | Requer ação imediata |
| 🟠 Alto | 8 | Deve ser corrigido na próxima sprint |
| 🟡 Médio | 12 | Recomendado para refactoring |
| 🟢 Baixo | 6 | Melhorias opcionais |

---

## 🔴 CRÍTICO

### 1. Problema de Memory Leak no useStore
**Arquivo:** `hooks/useStore.ts`  
**Linha:** 46-56

```typescript
useEffect(() => {
  const token = getAuthToken();
  if (token) {
    loadUser();
  }
}, []);
```

**Problema:** A função `loadUser` é async e não possui mecanismo de cleanup. Se o componente desmontar durante a execução, pode ocorrer memory leak e tentativa de atualizar estado em componente desmontado.

**Sugestão:**
```typescript
useEffect(() => {
  let isMounted = true;
  const token = getAuthToken();
  
  if (token) {
    loadUser().then(() => {
      if (!isMounted) return;
    });
  }
  
  return () => { isMounted = false; };
}, []);
```

---

### 2. XSS Vulnerável em Links de Currículo
**Arquivo:** `sections/CandidateDetailPage.tsx`  
**Linha:** 76-85

```typescript
<a 
  href={displayCandidate.curriculo}
  target="_blank"
  rel="noopener noreferrer"
>
```

**Problema:** Não há validação do conteúdo do link. URLs maliciosas (javascript:, data:) podem ser injetadas.

**Sugestão:**
```typescript
const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};
```

---

### 3. Uso de `any` em Tipagem de Erros
**Arquivo:** Múltiplos (`useStore.ts`, `services/api.ts`)

**Problema:** Padrão `err: any` usado extensivamente, eliminando a segurança de tipos do TypeScript.

**Ocorrências:**
- `useStore.ts`: Linhas 61, 88, 129, 159, 190, 230

**Sugestão:**
```typescript
interface ApiError {
  message: string;
  code?: string;
}

// Uso
} catch (err: unknown) {
  const error = err as ApiError;
  setError(error.message || 'Erro desconhecido');
}
```

---

### 4. Race Condition em Operações Assíncronas
**Arquivo:** `hooks/useStore.ts`  
**Linha:** 143-169

**Problema:** Múltiplas operações de criação/edição podem ocorrer simultaneamente sem controle de concorrência.

```typescript
const createJob = useCallback(async (...) => {
  // Não há verificação se já existe uma operação em andamento
  setIsLoading(true);
  // ... operação
}, []);
```

**Sugestão:** Implementar um AbortController ou flag de pending para cada operação.

---

## 🟠 ALTO

### 5. Duplicação de Código de Tema
**Arquivo:** `sections/DashboardPage.tsx` (Linhas 43-74) e `types/index.ts`

**Problema:** Definição de cores do tema duplicada em múltiplos lugares com leves variações.

**Sugestão:** Centralizar em um único tema provider/context.

---

### 6. Falta de Sanitização de Input
**Arquivo:** `sections/CreateJobPage.tsx`  
**Linha:** 241-247

```typescript
const field: CustomField = {
  id: `cf-${Date.now()}`,
  name: newFieldName.trim(), // Apenas trim, sem sanitização
  // ...
};
```

**Problema:** Nomes de campos podem conter caracteres especiais que causam problemas na exportação/CSV.

---

### 7. LocalStorage sem Limitação
**Arquivo:** `services/api.ts`  
**Linha:** 8-18

**Problema:** Mock DB armazena dados ilimitados no localStorage. Sem tratamento de quota exceeded.

---

### 8. Problema de Performance em useMemo
**Arquivo:** `sections/DashboardPage.tsx`  
**Linha:** 107-115

```typescript
const jobCandidates = useMemo(() => {
  if (!job) return [];
  const stateCandidates = getJobCandidates(job.id);
  if (stateCandidates.length > 0) return stateCandidates;
  return mockCandidates.filter(c => c.jobId === job.id || job.id === 'demo-job');
}, [job, getJobCandidates, state.candidates]); // state.candidates muda frequentemente
```

**Problema:** `state.candidates` é um array que muda referência a cada update, invalidando o memo desnecessariamente.

---

### 9. Confirmação Nativa do Browser
**Arquivo:** `sections/DashboardPage.tsx`  
**Linha:** 153

```typescript
if (confirm('Tem certeza que deseja excluir este candidato?'))
```

**Problema:** `confirm` bloqueia a thread principal. Deveria usar Dialog do próprio design system.

---

### 10. Chave de Geração de ID Fraca
**Arquivo:** `services/api.ts`  
**Linha:** 25

```typescript
const generateId = () => Math.random().toString(36).substring(2, 15);
```

**Problema:** Math.random() não é criptograficamente seguro e pode gerar colisões.

**Sugestão:**
```typescript
const generateId = () => crypto.randomUUID();
```

---

### 11. Dados Mockados em Produção
**Arquivo:** `sections/LandingPage.tsx`  
**Linha:** 184-344

**Problema:** Arquivo de 15KB+ contém apenas dados mockados de demonstração que são carregados em produção.

**Sugestão:** Mover para arquivo separado e lazy load.

---

### 12. Acessibilidade - Botões Sem aria-label
**Arquivo:** `sections/DashboardPage.tsx`  
**Linha:** Múltiplas

**Problema:** Ícones como botões não possuem labels para leitores de tela.

---

## 🟡 MÉDIO

### 13. Código de Status HTTP Ignorado
**Arquivo:** `services/api.ts`  
**Linha:** 63-76

**Problema:** Apenas diferencia entre ok/not ok, não trata códigos específicos (401, 403, 429).

---

### 14. Prop Drilling Excessivo
**Arquivo:** `App.tsx` e `sections/*`

**Problema:** `store` é passado manualmente por props para todas as páginas. Context API seria mais adequado.

---

### 15. Não Uso de React.memo para Componentes Pesados
**Arquivo:** `sections/DashboardPage.tsx`

**Problema:** `CandidateCard`, `KPICard` e outros componentes internos não usam memo, causando re-renders desnecessários.

---

### 16. URL Params Não Tipados
**Arquivo:** `sections/DashboardPage.tsx`  
**Linha:** 126

```typescript
const shareUrl = `${window.location.origin}?job=${job?.id || 'demo'}`;
```

**Problema:** Construção manual de URL sem encodeURIComponent.

---

### 17. Estado de Formulário Não Normalizado
**Arquivo:** `sections/AddCandidatesPage.tsx`  
**Linha:** 30

```typescript
const [manualForm, setManualForm] = useState<Record<string, any>>({
  status: 'triagem',
});
```

**Problema:** Uso de `Record<string, any>` elimina type safety.

---

### 18. Componente Muito Grande
**Arquivo:** `sections/CreateJobPage.tsx`

**Problema:** Arquivo com 800+ linhas. Múltiplas responsabilidades (wizard + form + dialog).

**Sugestão:** Extrair steps em componentes separados.

---

### 19. Magic Numbers
**Arquivo:** `sections/LandingPage.tsx`

**Problema:** Valores como 20 candidatos mockados, cores hex hardcoded espalhadas.

---

### 20. Falta de Loading State em Exportações
**Arquivo:** `utils/export.ts`

**Problema:** Operações de exportação (PDF/Excel) não possuem feedback de progresso para o usuário.

---

### 21. Tratamento de Erro Genérico
**Arquivo:** `services/api.ts`  
**Linha:** 78-80

```typescript
} catch (error) {
  // Se falhar (backend offline), usar mock/localStorage
```

**Problema:** Qualquer erro (não só offline) cai no mock, dificultando debugging.

---

### 22. CSS Inline em Estilos Dinâmicos
**Arquivo:** `sections/DashboardPage.tsx`  
**Linha:** 259

```typescript
style={{ backgroundColor: theme.primary }}
```

**Problema:** Estilos inline dificultam manutenção e não aproveitam o caching do CSS.

---

### 23. Variável Não Utilizada
**Arquivo:** `sections/UserDashboardPage.tsx`  
**Linha:** 45

```typescript
const [, setEditingJob] = useState<string | null>(null);
```

**Problema:** Setter declarado mas nunca usado.

---

### 24. Mock Data Não Condicional
**Arquivo:** `sections/CandidateDetailPage.tsx`  
**Linha:** 17-20

```typescript
// Fallback para mockados na demo
const displayCandidate = candidate || mockCandidates[0];
```

**Problema:** Fallback automático pode confundir em produção.

---

## 🟢 BAIXO

### 25. Console.log em Código de Produção
**Arquivo:** `services/api.ts`  
**Linha:** 79

```typescript
console.log('Backend offline, usando localStorage fallback');
```

---

### 26. Comentários Desatualizados
**Arquivo:** `App.tsx`  
**Linha:** 6

```typescript
// MVP Visual com fluxo passo a passo
```

**Problema:** Comentário genérico que não agrega valor.

---

### 27. Importações Não Utilizadas
**Arquivo:** `sections/CreateJobPage.tsx`  
**Linha:** Várias

**Problema:** Ícones importados mas não todos usados.

---

### 28. Código Comentado
**Arquivo:** `sections/DashboardPage.tsx`

**Problema:** Blocos de código comentados espalhados.

---

### 29. Nomenclatura Inconsistente
**Arquivo:** `types/index.ts`

**Problema:** Alguns tipos em português, outros em inglês (`nome`, `idade` vs `createdAt`, `updatedAt`).

---

### 30. Uso de `as any`
**Arquivo:** `sections/LandingPage.tsx`  
**Linha:** 449

```typescript
dashboardModel: modelId as any,
```

---

## 📈 Oportunidades de Performance

### 1. Code Splitting
```typescript
// Implementar lazy loading para páginas
const DashboardPage = lazy(() => import('./sections/DashboardPage'));
```

### 2. Memoização de Componentes
```typescript
const CandidateCard = memo(function CandidateCard({ ... }) {
  // implementação
});
```

### 3. Virtualização de Listas
Para listas grandes de candidatos, implementar react-window ou similar.

### 4. Debounce em Busca
```typescript
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 300);
```

---

## 🎨 Problemas de UX/UI

### 1. Feedback de Erro Insuficiente
- Erros de API mostram apenas toast/console
- Não há retry automático

### 2. Estados de Loading Inconsistentes
- Algumas ações têm spinner, outras não
- Transições de página sem feedback

### 3. Responsividade
- Tabelas não são responsivas em mobile
- Gráficos podem quebrar em telas pequenas

### 4. Navegação
- Não há breadcrumbs estruturados
- Botão "voltar" comportamento inconsistente

---

## ✅ Recomendações de Melhores Práticas

### 1. Adotar Zod para Validação
```typescript
import { z } from 'zod';

const candidateSchema = z.object({
  nome: z.string().min(2),
  idade: z.number().min(18).max(100),
  // ...
});
```

### 2. Implementar React Query
Substituir useStore por React Query para:
- Caching automático
- Refetching
- Gerenciamento de estado de servidor

### 3. Adicionar Testes
```typescript
// Component tests
describe('DashboardPage', () => {
  it('should render candidate list', () => {
    // test
  });
});
```

### 4. Configurar ESLint Mais Estrito
```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": "error"
}
```

---

## 📝 Plano de Ação Recomendado

### Sprint 1 (Crítico)
1. [ ] Fix memory leak em useStore
2. [ ] Sanitizar inputs XSS
3. [ ] Substituir `any` por tipos adequados
4. [ ] Adicionar controle de concorrência

### Sprint 2 (Alto)
1. [ ] Extrair tema para Context
2. [ ] Implementar AbortController
3. [ ] Mover mocks para lazy loading
4. [ ] Substituir confirm nativo

### Sprint 3 (Médio)
1. [ ] Refactoring de componentes grandes
2. [ ] Adicionar React.memo
3. [ ] Implementar debounce
4. [ ] Melhorar tratamento de erros HTTP

### Sprint 4 (Baixo/Polimento)
1. [ ] Limpar console.logs
2. [ ] Padronizar nomenclatura
3. [ ] Adicionar testes
4. [ ] Documentar componentes

---

## 📊 Métricas de Qualidade

| Métrica | Valor Atual | Meta |
|---------|-------------|------|
| Cobertura de Testes | 0% | 70% |
| Uso de `any` | 25+ ocorrências | 0 |
| Componentes > 300 linhas | 5 | 0 |
| Console.logs | 8+ | 0 |
| Duplicação de código | ~15% | <5% |

---

**Fim do Relatório**
