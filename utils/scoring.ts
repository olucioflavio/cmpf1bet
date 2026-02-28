export interface Bet {
    pole_driver_id: number | string | null;
    p1_driver_id: number | string | null;
    p2_driver_id: number | string | null;
    p3_driver_id: number | string | null;
    p4_driver_id: number | string | null;
    p5_driver_id: number | string | null;
    bortoleto_pos: number | string | null;
    variable_driver_pos: number | string | null;
    catapulta?: boolean;
}

export interface Result {
    pole_driver_id: number | string | null;
    p1_driver_id: number | string | null;
    p2_driver_id: number | string | null;
    p3_driver_id: number | string | null;
    p4_driver_id: number | string | null;
    p5_driver_id: number | string | null;
    bortoleto_pos: number | string | null;
    variable_driver_pos: number | string | null;
}

export function calculateBetScore(bet: Bet, result: Result): number {
    let score = 0;

    // Pole Position
    if (bet.pole_driver_id && bet.pole_driver_id.toString() === result.pole_driver_id?.toString()) {
        score += 1;
    }

    // Top 5 Positions (Exact)
    const p1Match = bet.p1_driver_id && bet.p1_driver_id.toString() === result.p1_driver_id?.toString();
    const p2Match = bet.p2_driver_id && bet.p2_driver_id.toString() === result.p2_driver_id?.toString();
    const p3Match = bet.p3_driver_id && bet.p3_driver_id.toString() === result.p3_driver_id?.toString();
    const p4Match = bet.p4_driver_id && bet.p4_driver_id.toString() === result.p4_driver_id?.toString();
    const p5Match = bet.p5_driver_id && bet.p5_driver_id.toString() === result.p5_driver_id?.toString();

    if (p1Match) score += 1;
    if (p2Match) score += 1;
    if (p3Match) score += 1;
    if (p4Match) score += 1;
    if (p5Match) score += 1;

    // Bonus for top 3 correct
    if (p1Match && p2Match && p3Match) {
        score += 1;
    }

    // Bonus for all Top 5 correct (+1 on top of the +1 from top 3)
    if (p1Match && p2Match && p3Match && p4Match && p5Match) {
        score += 1;
    }

    // Bortoleto Position
    if (bet.bortoleto_pos && bet.bortoleto_pos.toString() === result.bortoleto_pos?.toString()) {
        score += 1;
    }

    // Variable Driver Position
    if (bet.variable_driver_pos && bet.variable_driver_pos.toString() === result.variable_driver_pos?.toString()) {
        score += 1;
    }

    // Apply Catapulta multiplier
    if (bet.catapulta) {
        score *= 2;
    }

    return score;
}
