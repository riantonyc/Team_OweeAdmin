import fs from "fs";
import path from "path";
import { Athlete } from "./types";
import { INITIAL_ATHLETES } from "./initialData";

const DATA_DIR = path.join(process.cwd(), "data");
const ATHLETES_FILE = path.join(DATA_DIR, "athletes.json");

let memoryAthletes: Athlete[] | null = null;

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
