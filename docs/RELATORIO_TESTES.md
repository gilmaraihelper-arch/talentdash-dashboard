# Relatório de Testes E2E - TalentDash

**Data dos Testes:** 16/03/2026  
**URL Testada:** https://talentdash.vercel.app  
**Testador:** Carol (QA Engineer)

---

## Resumo Executivo

Foram realizados testes end-to-end nos principais fluxos do TalentDash. O sistema apresenta **funcionalidades principais operacionais**, mas com **bugs críticos** que afetam a experiência do usuário e a persistência de dados.

### Status Geral
| Funcionalidade | Status | Severidade |
|----------------|--------|------------|
| Cadastro de Usuário | ✅ Funcional | - |
| Login | ⚠️ Parcial | Média |
| Criação de Mapeamento | ✅ Funcional | - |
| Adição de Candidatos | ❌ Bug | **Alta** |
| Persistência de Sessão | ❌ Bug | **Alta** |
| Compartilhar Mapeamento | ❌ Bug | Média |
| Edição de Dashboard | ✅ Funcional | - |
| Navegação | ⚠️ Parcial | Média |

---

## Testes Realizados

### 1. Cadastro de Usuário ✅

**Fluxo Testado:**
1. Acessar página inicial
2. Clicar "Criar Conta Grátis"
3. Selecionar plano Free
4. Preencher dados (nome, email, senha, empresa)
5. Aceitar termos
6. Submeter cadastro

**Resultado:** ✅ **FUNCIONAL**
- Cadastro realizado com sucesso
- Usuário foi criado e redirecionado para o dashboard
- Dados persistidos corretamente

**Observação:** O formulário foi limpo na primeira tentativa de submissão (possível double-submit prevention falhando).

---

### 2. Login ⚠️

**Fluxo Testado:**
1. Acessar página de login
2. Preencher email e senha
3. Clicar "Entrar"

**Resultado:** ⚠️ **PARCIAL**
- Login funciona corretamente
- **Problema:** Sessão é perdida frequentemente ao navegar entre páginas

---

### 3. Criação de Mapeamento/Vaga ✅

**Fluxo Testado:**
1. Clicar "Novo Mapeamento"
2. Selecionar template "Tecnologia (TI)"
3. Preencher nome e descrição
4. Verificar critérios pré-configurados
5. Selecionar tema de cores (Esmeralda)
6. Revisar e criar

**Resultado:** ✅ **FUNCIONAL**
- Wizard de 5 passos funcionando corretamente
- Templates pré-configurados carregam os critérios corretamente
- Personalização de tema funciona
- Mapeamento é criado e aparece na lista

**Screenshots:**
- `screenshots/dashboard_apos_cadastro.png` - Dashboard após cadastro
- `screenshots/mapeamento_vazio.png` - Mapeamento sem candidatos (bug)

---

### 4. Adição de Candidatos ❌

**Fluxo Testado:**
1. Acessar mapeamento criado
2. Clicar "Adicionar Candidato"
3. Preencher formulário com dados do candidato
4. Submeter formulário

**Resultado:** ❌ **BUG CRÍTICO**
- Formulário é exibido corretamente
- Validações funcionam
- Botão de submissão habilita corretamente
- **Problema:** Candidato não persiste no banco de dados

**Evidência:**
- Após submissão, dashboard mostra "0 candidatos"
- Contador geral mostra "1 candidato" mas não aparece em nenhum mapeamento
- Recarregar página não resolve

---

### 5. Navegação entre Páginas ⚠️

**Fluxo Testado:**
- Navegar entre dashboard e mapeamentos
- Usar botão de voltar
- Acessar URLs diretamente

**Resultado:** ⚠️ **PROBLEMAS ENCONTRADOS**
- /dashboard retorna erro 404
- Sessão é perdida ao navegar para página inicial
- Usuário precisa fazer login novamente

---

### 6. Funcionalidades do Mapeamento

#### Editar Dashboard ✅
- **Status:** Funcional
- Modo edição permite reordenar widgets
- Opções de adicionar/remover widgets
- Botões de salvar e resetar funcionam

**Screenshot:**
![Modo Edição do Dashboard](./screenshot_edicao.png)

#### Compartilhar ❌
- **Status:** Bug
- Botão fica ativo mas não abre nenhum dialog/modal
- Nenhuma funcionalidade de compartilhamento é exibida

#### Tema ⚠️
- **Status:** Não testado completamente
- Botão disponível mas comportamento não verificado

#### Exportar ⚠️
- **Status:** Não testado
- Botão disponível

---

## Lista de Bugs Encontrados

### 🔴 CRÍTICO (Alta Severidade)

#### BUG-001: Candidatos não persistem após cadastro
- **Descrição:** Ao adicionar um candidato através do formulário, os dados são submetidos mas não aparecem no dashboard
- **Passos para Reproduzir:**
  1. Criar um mapeamento
  2. Clicar "Adicionar Candidato"
  3. Preencher todos os campos obrigatórios
  4. Clicar "Cadastrar e Ver Dashboard"
  5. Verificar que o candidato não aparece na lista
- **Impacto:** Impossível usar o sistema para gestão de candidatos
- **Recomendação:** Verificar API de criação de candidatos e persistência no banco

#### BUG-002: Sessão é perdida frequentemente
- **Descrição:** Ao navegar entre páginas ou usar botão de voltar, o usuário é deslogado e redirecionado para a landing page
- **Passos para Reproduzir:**
  1. Fazer login
  2. Acessar um mapeamento
  3. Clicar no logo para voltar à página inicial
  4. Verificar que sessão foi perdida
- **Impacto:** Experiência de usuário ruim, necessidade de fazer login repetidamente
- **Recomendação:** Implementar persistência de sessão (localStorage/sessionStorage) e refresh de token

---

### 🟡 MÉDIO (Média Severidade)

#### BUG-003: Rota /dashboard retorna 404
- **Descrição:** Tentar acessar diretamente /dashboard resulta em erro NOT_FOUND
- **Impacto:** Navegação direta por URL não funciona
- **Recomendação:** Configurar rota corretamente no Vercel/Next.js ou redirecionar para página correta

#### BUG-004: Botão "Compartilhar" não funciona
- **Descrição:** Clicar no botão "Compartilhar" não abre nenhuma interface
- **Impacto:** Funcionalidade de compartilhamento indisponível
- **Recomendação:** Implementar modal de compartilhamento ou remover botão se não estiver pronto

#### BUG-005: Formulário de cadastro limpa dados na primeira submissão
- **Descrição:** Ao tentar submeter o formulário de cadastro pela primeira vez, os campos são validados como vazios mesmo estando preenchidos
- **Impacto:** Usuário precisa preencher os dados duas vezes
- **Recomendação:** Verificar estado do formulário e validação

---

### 🟢 BAIXO (Baixa Severidade)

#### BUG-006: Criação de mapeamento redireciona incorretamente
- **Descrição:** Após criar um mapeamento, o usuário é redirecionado para o início do wizard em vez do dashboard do mapeamento
- **Impacto:** Navegação confusa
- **Recomendação:** Redirecionar para a página do mapeamento criado ou para a lista

---

## Recomendações de Correção

### Prioridade 1 (Corrigir Imediatamente)
1. **BUG-001 (Candidatos):** Verificar endpoint POST /api/candidates e lógica de associação com mapeamento
2. **BUG-002 (Sessão):** Implementar middleware de autenticação e persistência de token

### Prioridade 2 (Semana 1)
3. **BUG-003 (Rota 404):** Configurar rewrites no Vercel ou ajustar estrutura de rotas
4. **BUG-004 (Compartilhar):** Implementar funcionalidade ou ocultar botão

### Prioridade 3 (Melhorias UX)
5. **BUG-005 (Formulário):** Revisar estado dos inputs
6. **BUG-006 (Redirecionamento):** Ajustar navegação pós-criação

---

## Testes Não Realizados

- Importação de planilha CSV/Excel
- Exportação de dados
- Alteração de tema de cores em mapeamento existente
- Fluxo de "Esqueceu a senha"
- Comparação lado a lado de candidatos
- Filtros e busca

---

## Conclusão

O TalentDash apresenta uma **interface bonita e bem projetada**, com um fluxo de criação de mapeamentos funcional. No entanto, **bugs críticos na persistência de dados** (candidatos) e **problemas de sessão** impedem o uso produtivo do sistema.

**Principais Preocupações:**
1. Funcionalidade core (gestão de candidatos) não está operacional
2. Experiência de usuário comprometida por perda de sessão
3. Algumas funcionalidades parecem incompletas (compartilhar)

**Recomendação:** Corrigir BUG-001 e BUG-002 antes de qualquer lançamento.

---

**Arquivos de Evidência:**
- Screenshot 1: Dashboard após criação do mapeamento
- Screenshot 2: Modo edição do dashboard

---

*Relatório gerado por Carol - QA Engineer*  
*TalentDash Testing - 16/03/2026*
