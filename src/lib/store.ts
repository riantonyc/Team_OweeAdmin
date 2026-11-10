import fs from "fs";
import path from "path";
import { Athlete } from "./types";
import { INITIAL_ATHLETES } from "./initialData";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "athletes.json");

// In-memory cache for fast read/write
let memoryAthletes: Athlete[] | null = null;

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_ATHLETES, null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Notice: File system writing not available (read-only environment), using in-memory store.");
  }
}

export async function getAthletes(): Promise<Athlete[]> {
  if (memoryAthletes) {
    return memoryAthletes;
  }

  ensureDataFile();

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryAthletes = parsed;
        return memoryAthletes;
      }
    }
  } catch (err) {
    console.error("Error reading athletes from disk, falling back to initial seed:", err);
  }

  memoryAthletes = JSON.parse(JSON.stringify(INITIAL_ATHLETES));
  return memoryAthletes!;
}

export async function saveAthletes(athletes: Athlete[]): Promise<void> {
  memoryAthletes = athletes;
  ensureDataFile();

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(athletes, null, 2), "utf8");
  } catch (err) {
    console.warn("Notice: Could not persist to data file, cached in memory only.");
  }
}

export async function getAthleteById(id: number): Promise<Athlete | null> {
  const list = await getAthletes();
  return list.find((a) => a.id === id) || null;
}

export async function addAthlete(data: Omit<Athlete, "id">): Promise<Athlete> {
  const list = await getAthletes();
  const nextId = list.length > 0 ? Math.max(...list.map((a) => a.id)) + 1 : 1;
  const newAthlete: Athlete = {
    ...data,
    id: nextId,
  };
  list.push(newAthlete);
  await saveAthletes(list);
  return newAthlete;
}

export async function updateAthlete(id: number, data: Partial<Omit<Athlete, "id">>): Promise<Athlete | null> {
  const list = await getAthletes();
  const index = list.findIndex((a) => a.id === id);
  if (index === -1) return null;

  list[index] = {
    ...list[index],
    ...data,
  };

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
