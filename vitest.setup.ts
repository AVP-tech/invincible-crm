import fs from "node:fs";
import path from "node:path";
import { beforeAll } from "vitest";
import { DatabaseSync } from "node:sqlite";

const databasePath = path.resolve(process.cwd(), "prisma", "test.db");
const migrationsRoot = path.resolve(process.cwd(), "prisma", "migrations");

beforeAll(() => {
  if (fs.existsSync(databasePath)) {
    fs.rmSync(databasePath);
  }

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const database = new DatabaseSync(databasePath);
  database.exec("PRAGMA foreign_keys = ON;");

  const migrationDirectories = fs
    .readdirSync(migrationsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const migrationName of migrationDirectories) {
    const migrationPath = path.join(migrationsRoot, migrationName, "migration.sql");
    const migration = fs.readFileSync(migrationPath, "utf8");
    database.exec(migration);
  }

  database.close();
});
