import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

process.loadEnvFile?.(".env");

function resolveDatabasePath(databaseUrl) {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error("Only SQLite file URLs are supported by the local bootstrap script.");
  }

  const filePath = databaseUrl.replace(/^file:/, "");
  return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), "prisma", filePath);
}

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const dbPath = resolveDatabasePath(databaseUrl);
const migrationsRoot = path.resolve(process.cwd(), "prisma", "migrations");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const database = new DatabaseSync(dbPath);
database.exec("PRAGMA foreign_keys = ON;");
database.exec('CREATE TABLE IF NOT EXISTS "__app_migrations" ("name" TEXT NOT NULL PRIMARY KEY, "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);');

const appliedMigrationNames = new Set(
  database
    .prepare('SELECT "name" FROM "__app_migrations"')
    .all()
    .map((row) => String(row.name))
);

const migrationDirectories = fs
  .readdirSync(migrationsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const migrationName of migrationDirectories) {
  if (appliedMigrationNames.has(migrationName)) {
    continue;
  }

  const sqlPath = path.join(migrationsRoot, migrationName, "migration.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  database.exec("BEGIN");

  try {
    database.exec(sql);
    database.prepare('INSERT INTO "__app_migrations" ("name") VALUES (?)').run(migrationName);
    database.exec("COMMIT");
    console.log(`Applied migration ${migrationName}`);
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

database.close();
console.log(`SQLite database ready at ${dbPath}`);
