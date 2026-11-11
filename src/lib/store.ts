import fs from "fs";
import path from "path";
import { Athlete } from "./types";
import { INITIAL_ATHLETES } from "./initialData";
import {
  isDbConfigured,
  getDbAthletes,
  getDbAthleteById,
  addDbAthlete,
  updateDbAthlete,
  deleteDbAthlete,
  resetDbAthletes,
} from "./db";

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
// FILE/MEMORY FALLBACK HELPERS
// ==========================================
async function getFileAthletes(): Promise<Athlete[]> {
  if (memoryAthletes && memoryAthletes.length > 0) return memoryAthletes;
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
  await saveFileAthletes(memoryAthletes!);
  return memoryAthletes!;
}

async function saveFileAthletes(athletes: Athlete[]): Promise<void> {
  memoryAthletes = athletes;
  ensureDataDir();

  try {
    fs.writeFileSync(ATHLETES_FILE, JSON.stringify(athletes, null, 2), "utf8");
  } catch (err) {
    console.warn("Notice: Could not persist athletes file, cached in memory.");
  }
}

// ==========================================
// UNIFIED ATHLETES CRUD (POSTGRESQL + FALLBACK)
// ==========================================
export async function getAthletes(): Promise<Athlete[]> {
  if (isDbConfigured) {
    try {
      return await getDbAthletes();
    } catch (err) {
      console.warn("PostgreSQL getAthletes failed, falling back to local file:", err);
    }
  }
  return getFileAthletes();
}

export async function getAthleteById(id: number): Promise<Athlete | null> {
  if (isDbConfigured) {
    try {
      return await getDbAthleteById(id);
    } catch (err) {
      console.warn("PostgreSQL getAthleteById failed, falling back to local file:", err);
    }
  }
  const list = await getFileAthletes();
  return list.find((a) => a.id === id) || null;
}

export async function addAthlete(data: Omit<Athlete, "id">): Promise<Athlete> {
  if (isDbConfigured) {
    try {
      return await addDbAthlete(data);
    } catch (err) {
      console.warn("PostgreSQL addAthlete failed, falling back to local file:", err);
    }
  }
  const list = await getFileAthletes();
  const nextId = list.length > 0 ? Math.max(...list.map((a) => a.id)) + 1 : 1;
  const newAthlete: Athlete = { ...data, id: nextId };
  list.push(newAthlete);
  await saveFileAthletes(list);
  return newAthlete;
}

export async function updateAthlete(
  id: number,
  data: Partial<Omit<Athlete, "id">>
): Promise<Athlete | null> {
  if (isDbConfigured) {
    try {
      return await updateDbAthlete(id, data);
    } catch (err) {
      console.warn("PostgreSQL updateAthlete failed, falling back to local file:", err);
    }
  }
  const list = await getFileAthletes();
  const index = list.findIndex((a) => a.id === id);
  if (index === -1) return null;

  list[index] = { ...list[index], ...data };
  await saveFileAthletes(list);
  return list[index];
}

export async function deleteAthlete(id: number): Promise<boolean> {
  if (isDbConfigured) {
    try {
      return await deleteDbAthlete(id);
    } catch (err) {
      console.warn("PostgreSQL deleteAthlete failed, falling back to local file:", err);
    }
  }
  const list = await getFileAthletes();
  const initialLength = list.length;
  const filtered = list.filter((a) => a.id !== id);

  if (filtered.length !== initialLength) {
    await saveFileAthletes(filtered);
    return true;
  }
  return false;
}

export async function resetAthletes(): Promise<Athlete[]> {
  if (isDbConfigured) {
    try {
      return await resetDbAthletes();
    } catch (err) {
      console.warn("PostgreSQL resetAthletes failed, falling back to local file:", err);
    }
  }
  const fresh = JSON.parse(JSON.stringify(INITIAL_ATHLETES));
  await saveFileAthletes(fresh);
  return fresh;
}
