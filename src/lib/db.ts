import { Pool } from "pg";
import { Athlete } from "./types";
import { INITIAL_ATHLETES } from "./initialData";

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

export const isDbConfigured = Boolean(connectionString && connectionString.trim().length > 0);

let pool: Pool | null = null;
let isInitialized = false;

function getPool(): Pool | null {
  if (!isDbConfigured) return null;
  if (!pool) {
    const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
    pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  const p = getPool();
  if (!p || isInitialized) return;

  try {
    // 1. Create table athletes if not exists
    await p.query(`
      CREATE TABLE IF NOT EXISTS athletes (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        kontingen VARCHAR(100) NOT NULL,
        kategori VARCHAR(50) NOT NULL,
        kelas VARCHAR(100) NOT NULL,
        dob VARCHAR(50) NOT NULL,
        temuan VARCHAR(50) DEFAULT '-',
        status VARCHAR(50) DEFAULT 'Aktif',
        catatan TEXT DEFAULT ''
      );
    `);

    // 2. Check if table is empty
    const countRes = await p.query("SELECT COUNT(*) AS total FROM athletes");
    const count = parseInt(countRes.rows[0]?.total || "0", 10);

    // 3. Auto-seed with 76 official athletes if empty
    if (count === 0) {
      console.log("Seeding PostgreSQL database with 76 official athletes...");
      for (const a of INITIAL_ATHLETES) {
        await p.query(
          `INSERT INTO athletes (id, nama, kontingen, kategori, kelas, dob, temuan, status, catatan)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.nama, a.kontingen, a.kategori, a.kelas, a.dob, a.temuan, a.status, a.catatan || ""]
        );
      }
      // Reset serial sequence to max id
      await p.query(`SELECT setval(pg_get_serial_sequence('athletes', 'id'), coalesce(max(id), 1)) FROM athletes;`);
    }

    isInitialized = true;
  } catch (err) {
    console.error("Failed to initialize PostgreSQL athletes table:", err);
  }
}

export async function getDbAthletes(): Promise<Athlete[]> {
  const p = getPool();
  if (!p) throw new Error("Database not configured");
  await initDb();

  const res = await p.query(
    "SELECT id, nama, kontingen, kategori, kelas, dob, temuan, status, catatan FROM athletes ORDER BY id ASC"
  );

  return res.rows.map((row) => ({
    id: row.id,
    nama: row.nama,
    kontingen: row.kontingen,
    kategori: row.kategori,
    kelas: row.kelas,
    dob: row.dob,
    temuan: row.temuan || "-",
    status: row.status || "Aktif",
    catatan: row.catatan || "",
  }));
}

export async function getDbAthleteById(id: number): Promise<Athlete | null> {
  const p = getPool();
  if (!p) throw new Error("Database not configured");
  await initDb();

  const res = await p.query(
    "SELECT id, nama, kontingen, kategori, kelas, dob, temuan, status, catatan FROM athletes WHERE id = $1",
    [id]
  );

  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    nama: row.nama,
    kontingen: row.kontingen,
    kategori: row.kategori,
    kelas: row.kelas,
    dob: row.dob,
    temuan: row.temuan || "-",
    status: row.status || "Aktif",
    catatan: row.catatan || "",
  };
}

export async function addDbAthlete(data: Omit<Athlete, "id">): Promise<Athlete> {
  const p = getPool();
  if (!p) throw new Error("Database not configured");
  await initDb();

  const res = await p.query(
    `INSERT INTO athletes (nama, kontingen, kategori, kelas, dob, temuan, status, catatan)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, nama, kontingen, kategori, kelas, dob, temuan, status, catatan`,
    [
      data.nama,
      data.kontingen,
      data.kategori,
      data.kelas,
      data.dob,
      data.temuan || "-",
      data.status || "Aktif",
      data.catatan || "",
    ]
  );

  const row = res.rows[0];
  return {
    id: row.id,
    nama: row.nama,
    kontingen: row.kontingen,
    kategori: row.kategori,
    kelas: row.kelas,
    dob: row.dob,
    temuan: row.temuan || "-",
    status: row.status || "Aktif",
    catatan: row.catatan || "",
  };
}

export async function updateDbAthlete(
  id: number,
  data: Partial<Omit<Athlete, "id">>
): Promise<Athlete | null> {
  const p = getPool();
  if (!p) throw new Error("Database not configured");
  await initDb();

  const current = await getDbAthleteById(id);
  if (!current) return null;

  const updated = { ...current, ...data };

  const res = await p.query(
    `UPDATE athletes
     SET nama = $1, kontingen = $2, kategori = $3, kelas = $4, dob = $5, temuan = $6, status = $7, catatan = $8
     WHERE id = $9
     RETURNING id, nama, kontingen, kategori, kelas, dob, temuan, status, catatan`,
    [
      updated.nama,
      updated.kontingen,
      updated.kategori,
      updated.kelas,
      updated.dob,
      updated.temuan,
      updated.status,
      updated.catatan,
      id,
    ]
  );

  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    nama: row.nama,
    kontingen: row.kontingen,
    kategori: row.kategori,
    kelas: row.kelas,
    dob: row.dob,
    temuan: row.temuan || "-",
    status: row.status || "Aktif",
    catatan: row.catatan || "",
  };
}

export async function deleteDbAthlete(id: number): Promise<boolean> {
  const p = getPool();
  if (!p) throw new Error("Database not configured");
  await initDb();

  const res = await p.query("DELETE FROM athletes WHERE id = $1", [id]);
  return (res.rowCount || 0) > 0;
}

export async function resetDbAthletes(): Promise<Athlete[]> {
  const p = getPool();
  if (!p) throw new Error("Database not configured");
  await initDb();

  // Truncate table and reseed with 76 athletes
  await p.query("TRUNCATE TABLE athletes RESTART IDENTITY;");

  for (const a of INITIAL_ATHLETES) {
    await p.query(
      `INSERT INTO athletes (id, nama, kontingen, kategori, kelas, dob, temuan, status, catatan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [a.id, a.nama, a.kontingen, a.kategori, a.kelas, a.dob, a.temuan, a.status, a.catatan || ""]
    );
  }

  await p.query(`SELECT setval(pg_get_serial_sequence('athletes', 'id'), coalesce(max(id), 1)) FROM athletes;`);

  return getDbAthletes();
}

