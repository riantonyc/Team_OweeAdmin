import fs from "fs";
import path from "path";
import { Athlete } from "./types";
import { INITIAL_ATHLETES } from "./initialData";
import { ClassBracket } from "./bracketUtils";

const DATA_DIR = path.join(process.cwd(), "data");
const ATHLETES_FILE = path.join(DATA_DIR, "athletes.json");
const BRACKETS_FILE = path.join(DATA_DIR, "brackets.json");

let memoryAthletes: Athlete[] | null = null;
let memoryBrackets: Record<string, ClassBracket> | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("Notice: File system directory creation failed, using memory only.");
  }
}

// ==========================================
// ATHLETES CRUD
// ==========================================
export async function getAthletes(): Promise<Athlete[]> {
  if (memoryAthletes) return memoryAthletes;
  ensureDataDir();

  try {
    if (fs.existsSync(ATHLETES_FILE)) {
      const content = fs.readFileSync(ATHLETES_FILE, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryAthletes = parsed;
        return memoryAthletes;
      }
    }
  } catch (err) {
    console.error("Error reading athletes from disk:", err);
  }

  memoryAthletes = JSON.parse(JSON.stringify(INITIAL_ATHLETES));
  return memoryAthletes!;
}

export async function saveAthletes(athletes: Athlete[]): Promise<void> {
  memoryAthletes = athletes;
  ensureDataDir();

  try {
    fs.writeFileSync(ATHLETES_FILE, JSON.stringify(athletes, null, 2), "utf8");
  } catch (err) {
    console.warn("Notice: Could not persist athletes file, cached in memory.");
  }
}

export async function getAthleteById(id: number): Promise<Athlete | null> {
  const list = await getAthletes();
  return list.find((a) => a.id === id) || null;
}

export async function addAthlete(data: Omit<Athlete, "id">): Promise<Athlete> {
  const list = await getAthletes();
  const nextId = list.length > 0 ? Math.max(...list.map((a) => a.id)) + 1 : 1;
  const newAthlete: Athlete = { ...data, id: nextId };
  list.push(newAthlete);
  await saveAthletes(list);
  return newAthlete;
}

export async function updateAthlete(id: number, data: Partial<Omit<Athlete, "id">>): Promise<Athlete | null> {
  const list = await getAthletes();
  const index = list.findIndex((a) => a.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...data };
  await saveAthletes(list);
  return list[index];
}

export async function deleteAthlete(id: number): Promise<boolean> {
  const list = await getAthletes();
  const initialLength = list.length;
  const filtered = list.filter((a) => a.id !== id);

  if (filtered.length !== initialLength) {
    await saveAthletes(filtered);
    return true;
  }
  return false;
}

export async function resetAthletes(): Promise<Athlete[]> {
  const fresh = JSON.parse(JSON.stringify(INITIAL_ATHLETES));
  await saveAthletes(fresh);
  return fresh;
}

// ==========================================
// TOURNAMENT BRACKETS CRUD
// ==========================================
export async function getBrackets(): Promise<Record<string, ClassBracket>> {
  if (memoryBrackets) return memoryBrackets;
  ensureDataDir();

  try {
    if (fs.existsSync(BRACKETS_FILE)) {
      const content = fs.readFileSync(BRACKETS_FILE, "utf8");
      memoryBrackets = JSON.parse(content);
      return memoryBrackets!;
    }
  } catch (err) {
    console.warn("Could not read brackets file, initializing empty:", err);
  }

  memoryBrackets = {};
  return memoryBrackets;
}

export async function saveBracket(classKey: string, bracket: ClassBracket): Promise<void> {
  const brackets = await getBrackets();
  brackets[classKey] = bracket;
  memoryBrackets = brackets;
  ensureDataDir();

  try {
    fs.writeFileSync(BRACKETS_FILE, JSON.stringify(brackets, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write brackets file, cached in memory only.");
  }
}
