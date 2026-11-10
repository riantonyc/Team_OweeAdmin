import { Athlete } from "./types";

export interface BracketMatch {
  id: string;
  roundIndex: number;
  matchIndex: number;
  roundName: string;
  redAthlete: Athlete | null;
  blueAthlete: Athlete | null;
  winnerId: number | null;
  winMethod?: "Poin" | "KO" | "RSC" | "WO" | "DQ";
  isBye?: boolean;
}

export interface ClassBracket {
  classKey: string; // e.g. "KELAS 48 KG-PUTRA"
  bracketSize: number; // 2, 4, 8, 16
  rounds: {
    name: string;
    matches: BracketMatch[];
  }[];
}

export function generateBracket(athletesInClass: Athlete[], classKey: string): ClassBracket {
  const count = athletesInClass.length;
  if (count === 0) {
    return { classKey, bracketSize: 0, rounds: [] };
  }

  // Determine standard single-elimination bracket size: 2, 4, 8, 16
  let bracketSize = 2;
  if (count > 8) bracketSize = 16;
  else if (count > 4) bracketSize = 8;
  else if (count > 2) bracketSize = 4;

  const totalRounds = Math.log2(bracketSize);

  // Intelligent seeding: shuffle athletes, try to keep same contingents separated in first round
  const shuffled = [...athletesInClass].sort(() => Math.random() - 0.5);

  // Group by contingent to avoid same contingent in consecutive slots
  const byContingent: Record<string, Athlete[]> = {};
  shuffled.forEach((a) => {
    if (!byContingent[a.kontingen]) byContingent[a.kontingen] = [];
    byContingent[a.kontingen].push(a);
  });

  const distributed: (Athlete | null)[] = [];
  const contingentKeys = Object.keys(byContingent);
  let hasMore = true;
  let cycle = 0;

  while (hasMore && distributed.length < count) {
    hasMore = false;
    contingentKeys.forEach((key) => {
      const list = byContingent[key];
      if (cycle < list.length) {
        distributed.push(list[cycle]);
        hasMore = true;
      }
    });
    cycle++;
  }

  // Fill up to bracketSize with BYEs (null)
  const initialSlots: (Athlete | null)[] = Array(bracketSize).fill(null);
  for (let i = 0; i < count; i++) {
    initialSlots[i] = distributed[i] || null;
  }

  const roundNames =
    bracketSize === 16
      ? ["Babak Penyisihan", "Perempat Final", "Semifinal", "Final"]
      : bracketSize === 8
      ? ["Perempat Final", "Semifinal", "Final"]
      : bracketSize === 4
      ? ["Semifinal", "Final"]
      : ["Final"];

  const rounds: { name: string; matches: BracketMatch[] }[] = [];

  // Round 0 (First Round)
  const firstRoundMatchesCount = bracketSize / 2;
  const firstRoundMatches: BracketMatch[] = [];

  for (let m = 0; m < firstRoundMatchesCount; m++) {
    const red = initialSlots[m * 2] || null;
    const blue = initialSlots[m * 2 + 1] || null;

    let winnerId: number | null = null;
    let isBye = false;

    // Automatic BYE progression
    if (red && !blue) {
      winnerId = red.id;
      isBye = true;
    } else if (!red && blue) {
      winnerId = blue.id;
      isBye = true;
    }

    firstRoundMatches.push({
      id: `R0-M${m}`,
      roundIndex: 0,
      matchIndex: m,
      roundName: roundNames[0],
      redAthlete: red,
      blueAthlete: blue,
      winnerId,
      isBye,
      winMethod: isBye ? "WO" : undefined,
    });
  }

  rounds.push({ name: roundNames[0], matches: firstRoundMatches });

  // Subsequent rounds (QF, SF, Final)
  for (let r = 1; r < totalRounds; r++) {
    const prevMatches = rounds[r - 1].matches;
    const currentMatchesCount = prevMatches.length / 2;
    const currentMatches: BracketMatch[] = [];

    for (let m = 0; m < currentMatchesCount; m++) {
      const parentRed = prevMatches[m * 2];
      const parentBlue = prevMatches[m * 2 + 1];

      const redAthlete =
        parentRed.winnerId === parentRed.redAthlete?.id
          ? parentRed.redAthlete
          : parentRed.winnerId === parentRed.blueAthlete?.id
          ? parentRed.blueAthlete
          : null;

      const blueAthlete =
        parentBlue.winnerId === parentBlue.redAthlete?.id
          ? parentBlue.redAthlete
          : parentBlue.winnerId === parentBlue.blueAthlete?.id
          ? parentBlue.blueAthlete
          : null;

      let winnerId: number | null = null;
      let isBye = false;

      if (redAthlete && !blueAthlete && parentBlue.isBye) {
        winnerId = redAthlete.id;
        isBye = true;
      }

      currentMatches.push({
        id: `R${r}-M${m}`,
        roundIndex: r,
        matchIndex: m,
        roundName: roundNames[r],
        redAthlete,
        blueAthlete,
        winnerId,
        isBye,
      });
    }

    rounds.push({ name: roundNames[r], matches: currentMatches });
  }

  return {
    classKey,
    bracketSize,
    rounds,
  };
}

export function updateMatchWinner(
  bracket: ClassBracket,
  roundIndex: number,
  matchIndex: number,
  winnerId: number | null,
  winMethod: "Poin" | "KO" | "RSC" | "WO" | "DQ" = "Poin"
): ClassBracket {
  const newBracket = JSON.parse(JSON.stringify(bracket)) as ClassBracket;
  const currentMatch = newBracket.rounds[roundIndex].matches[matchIndex];
  currentMatch.winnerId = winnerId;
  currentMatch.winMethod = winMethod;

  // Propagate to next round if available
  const nextRoundIndex = roundIndex + 1;
  if (nextRoundIndex < newBracket.rounds.length) {
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const isRedParent = matchIndex % 2 === 0;
    const nextMatch = newBracket.rounds[nextRoundIndex].matches[nextMatchIndex];

    const winningAthlete =
      winnerId === currentMatch.redAthlete?.id
        ? currentMatch.redAthlete
        : winnerId === currentMatch.blueAthlete?.id
        ? currentMatch.blueAthlete
        : null;

    if (isRedParent) {
      nextMatch.redAthlete = winningAthlete;
    } else {
      nextMatch.blueAthlete = winningAthlete;
    }

    // Reset next match winner if winning athlete changed
    if (!winningAthlete || (nextMatch.winnerId && nextMatch.winnerId !== winningAthlete.id && !nextMatch.isBye)) {
      nextMatch.winnerId = null;
      nextMatch.winMethod = undefined;
    }
  }

  return newBracket;
}
