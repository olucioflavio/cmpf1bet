# Sistema Automático de Abertura e Fechamento de Apostas

## Regras Implementadas

### 📅 Abertura de Apostas
- **Quando**: 5 dias antes da data da corrida
- **Horário**: Meia-noite (00:00) do dia de abertura

### 🔒 Fechamento de Apostas
- **Quando**: Sexta-feira antes da corrida
- **Horário**: 23:59:59

### Exemplos:
- **Corrida no Domingo**: Apostas fecham na sexta-feira anterior às 23:59
- **Corrida no Sábado**: Apostas fecham na sexta-feira anterior às 23:59
- **Corrida na Sexta**: Apostas fecham na sexta-feira da semana anterior às 23:59
- **Corrida em outros dias**: Apostas fecham na sexta-feira anterior às 23:59

## Arquivos Modificados

### 1. `utils/raceStatus.ts` (NOVO)
Utilitário com funções para:
- `calculateRaceStatus()`: Calcula o status automático baseado na data
- `getOpeningDate()`: Retorna quando as apostas abrem
- `getClosingDate()`: Retorna quando as apostas fecham
- `getRaceBettingInfo()`: Retorna todas as informações de apostas

### 2. `app/race/[id]/page.tsx`
- Importa e usa `calculateRaceStatus()` e `getRaceBettingInfo()`
- Exibe informações visuais sobre abertura/fechamento
- Mostra mensagens dinâmicas baseadas no status:
  - **Scheduled**: Quando abrem e fecham as apostas
  - **Open**: Quando fecham as apostas
  - **Closed**: Quando fecharam as apostas

### 3. `app/race/[id]/actions.ts`
- Validação server-side antes de aceitar apostas
- Impede apostas se status não for 'open'
- Mensagens de erro específicas para cada situação

### 4. `app/page.tsx`
- Usa status automático para encontrar próxima corrida aberta
- Exibe status correto no calendário de corridas
- Mostra indicadores visuais (verde = aberto, cinza = fechado)

## Status Possíveis

1. **scheduled**: Apostas ainda não abriram
2. **open**: Apostas abertas (entre 5 dias antes e sexta 23:59)
3. **closed**: Apostas fechadas (após sexta 23:59)
4. **finished**: Corrida finalizada (definido pelo admin)

## Comportamento

- O status é calculado **dinamicamente** baseado na data atual
- Não é necessário atualizar manualmente o status no banco de dados
- O status 'finished' só pode ser definido pelo admin e é preservado
- Validação tanto no frontend quanto no backend

## Segurança

✅ Validação server-side impede apostas fora do período
✅ Mensagens claras para o usuário
✅ Status calculado automaticamente, sem manipulação manual
✅ Admin pode sobrescrever quando necessário

## Controle Manual do Admin

O admin tem controle total sobre o status de cada corrida através do painel administrativo (`/admin`):

### Ações Disponíveis

1. **Open** (Verde): Força a abertura manual das apostas
   - Sobrescreve o status automático
   - Útil para casos especiais ou testes

2. **Close** (Vermelho): Força o fechamento manual das apostas
   - Impede novas apostas mesmo se estiver no período automático
   - Útil para emergências ou mudanças de última hora

3. **Finish** (Cinza): Marca a corrida como finalizada
   - Usado após inserir os resultados oficiais
   - Status permanente (não volta para automático)

4. **🔄 Reset Auto** (Azul): Reseta para status automático
   - Remove qualquer override manual
   - Volta a calcular o status baseado na data
   - Só aparece quando há override manual ativo

### Interface Admin

A página admin mostra duas colunas de status:

- **Status Automático**: O que o sistema calcularia baseado na data
  - Mostra quando abre/fecha automaticamente
  - Sempre visível para referência

- **Status Manual**: O status atual definido no banco
  - Mostra se há override manual (⚠️ MANUAL)
  - Este é o status que o sistema usa de fato

### Exemplo de Uso

**Cenário 1 - Abertura Antecipada:**
1. Status automático mostra "Scheduled" (ainda não abriu)
2. Admin clica em "Open" para abrir manualmente
3. Status manual muda para "open" com tag ⚠️ MANUAL
4. Apostas ficam disponíveis imediatamente

**Cenário 2 - Fechamento de Emergência:**
1. Status automático mostra "Open" (período normal)
2. Admin clica em "Close" para fechar manualmente
3. Status manual muda para "closed" com tag ⚠️ MANUAL
4. Apostas são bloqueadas imediatamente

**Cenário 3 - Voltar ao Automático:**
1. Corrida tem override manual ativo
2. Admin clica em "🔄 Reset Auto"
3. Status volta para "scheduled"
4. Sistema retoma cálculo automático
