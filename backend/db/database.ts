import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __dirname for ES Module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseManager {
  private db: Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'database', 'travelsaathi.db');
  }

  async init(): Promise<void> {
    if (this.db) return;

    const SQL = await initSqlJs();
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (fs.existsSync(this.dbPath)) {
      const fileBuffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(fileBuffer);
      // Safe schema migration for newly added columns
      try {
        this.db.run("ALTER TABLE restaurants ADD COLUMN food_type TEXT DEFAULT 'both';");
        this.save();
      } catch {
        // column already exists, safe to ignore
      }
    } else {
      this.db = new SQL.Database();
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        this.db.run(schemaSql);
        this.save();
      }
    }
  }

  save(): void {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  query<T = any>(sql: string, params: any[] = []): T[] {
    if (!this.db) throw new Error("Database not initialized");
    const cleanParams = params.map((p) => (p === undefined ? null : p));
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(cleanParams);
      const rows: T[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as T);
      }
      return rows;
    } finally {
      stmt.free();
    }
  }

  queryOne<T = any>(sql: string, params: any[] = []): T | null {
    const rows = this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  run(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
    if (!this.db) throw new Error("Database not initialized");
    const cleanParams = params.map((p) => (p === undefined ? null : p));
    const stmt = this.db.prepare(sql);
    try {
      stmt.run(cleanParams);
    } finally {
      stmt.free();
    }

    const res = this.db.exec("SELECT last_insert_rowid() AS id, changes() AS count;");
    const lastInsertRowid = (res[0]?.values[0]?.[0] as number) || 0;
    const changes = (res[0]?.values[0]?.[1] as number) || 0;
    this.save();
    return { changes, lastInsertRowid };
  }

  exec(sql: string): void {
    if (!this.db) throw new Error("Database not initialized");
    this.db.run(sql);
    this.save();
  }
}

export const dbManager = new DatabaseManager();
