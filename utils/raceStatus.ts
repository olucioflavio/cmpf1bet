/**
 * Calcula o status de uma corrida baseado em regras automáticas:
 * - Abertura: 5 dias antes da data da corrida
 * - Fechamento: Sexta-feira às 23:59 antes da corrida
 * - Finished: Quando o admin insere os resultados
 */

export type RaceStatus = 'scheduled' | 'open' | 'closed' | 'finished'

export interface RaceWithDate {
    date: string | Date
    status?: string
}

/**
 * Calcula o status automático de uma corrida baseado na data
 * IMPORTANTE: Respeita status manual definido pelo admin!
 * - Se status for 'open', 'closed' ou 'finished' -> mantém (override manual)
 * - Se status for 'scheduled' -> calcula automaticamente baseado na data
 * 
 * @param raceDate Data da corrida
 * @param currentStatus Status atual da corrida no banco de dados
 * @returns Status calculado da corrida
 */
export function calculateRaceStatus(raceDate: string | Date, currentStatus?: string): RaceStatus {
    // REGRA 1: Se há um status manual definido (diferente de 'scheduled'), RESPEITAR
    // Isso permite que o admin force open, closed ou finished manualmente
    if (currentStatus && currentStatus !== 'scheduled') {
        return currentStatus as RaceStatus
    }

    // REGRA 2: Se status é 'scheduled' (ou não definido), calcular automaticamente
    const now = new Date()
    const race = new Date(raceDate)

    // Calcular a sexta-feira anterior à corrida às 23:59
    const closingDate = getClosingDate(race)

    // Calcular 5 dias antes da corrida (abertura)
    const openingDate = new Date(race)
    openingDate.setDate(openingDate.getDate() - 5)
    openingDate.setHours(0, 0, 0, 0) // Meia-noite do dia de abertura

    // Lógica de status automático:
    // 1. Se passou da sexta-feira 23:59 antes da corrida -> closed
    // 2. Se está entre 5 dias antes e sexta-feira 23:59 -> open
    // 3. Se ainda não chegou 5 dias antes -> scheduled

    if (now > closingDate) {
        return 'closed'
    } else if (now >= openingDate) {
        return 'open'
    } else {
        return 'scheduled'
    }
}

/**
 * Calcula APENAS o status automático baseado na data, ignorando qualquer override manual
 * Usado para mostrar na interface admin o que o sistema calcularia automaticamente
 * 
 * @param raceDate Data da corrida
 * @returns Status que seria calculado automaticamente
 */
export function calculateAutoStatus(raceDate: string | Date): RaceStatus {
    const now = new Date()
    const race = new Date(raceDate)

    // Calcular a sexta-feira anterior à corrida às 23:59
    const closingDate = getClosingDate(race)

    // Calcular 5 dias antes da corrida (abertura)
    const openingDate = new Date(race)
    openingDate.setDate(openingDate.getDate() - 5)
    openingDate.setHours(0, 0, 0, 0)

    if (now > closingDate) {
        return 'closed'
    } else if (now >= openingDate) {
        return 'open'
    } else {
        return 'scheduled'
    }
}

/**
 * Calcula a data de fechamento das apostas (sexta-feira às 23:59 antes da corrida)
 * @param raceDate Data da corrida
 * @returns Data de fechamento
 */
export function getClosingDate(raceDate: Date): Date {
    const race = new Date(raceDate)
    const raceDayOfWeek = race.getDay() // 0 = Domingo, 6 = Sábado

    // Encontrar a sexta-feira anterior
    let daysToSubtract = 0

    if (raceDayOfWeek === 0) { // Domingo
        daysToSubtract = 2 // Sexta-feira anterior
    } else if (raceDayOfWeek === 6) { // Sábado
        daysToSubtract = 1 // Sexta-feira anterior
    } else if (raceDayOfWeek === 5) { // Sexta-feira
        daysToSubtract = 7 // Sexta-feira da semana anterior
    } else { // Segunda a Quinta
        daysToSubtract = raceDayOfWeek + 2 // Sexta-feira anterior
    }

    const closingDate = new Date(race)
    closingDate.setDate(closingDate.getDate() - daysToSubtract)
    closingDate.setHours(23, 59, 59, 999) // 23:59:59.999

    return closingDate
}

/**
 * Calcula a data de abertura das apostas (5 dias antes da corrida)
 * @param raceDate Data da corrida
 * @returns Data de abertura
 */
export function getOpeningDate(raceDate: Date): Date {
    const openingDate = new Date(raceDate)
    openingDate.setDate(openingDate.getDate() - 5)
    openingDate.setHours(0, 0, 0, 0) // Meia-noite
    return openingDate
}

/**
 * Formata uma data para exibição amigável
 */
export function formatDate(date: Date): string {
    return date.toLocaleString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

/**
 * Retorna informações sobre quando as apostas abrem e fecham
 */
export function getRaceBettingInfo(raceDate: string | Date) {
    const race = new Date(raceDate)
    const opening = getOpeningDate(race)
    const closing = getClosingDate(race)
    const status = calculateRaceStatus(raceDate)

    return {
        status,
        openingDate: opening,
        closingDate: closing,
        openingFormatted: formatDate(opening),
        closingFormatted: formatDate(closing),
        isOpen: status === 'open',
        isClosed: status === 'closed' || status === 'finished',
        isScheduled: status === 'scheduled'
    }
}
