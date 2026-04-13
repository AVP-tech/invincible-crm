import fs from "node:fs";
import path from "node:path";
import { beforeAll } from "vitest";
import { DatabaseSync } from "node:sqlite";

const databasePath = path.resolve(process.cwd(), "prisma", "test.db");
const schemaSourcePath = path.resolve(process.cwd(), "prisma", "dev.db");

beforeAll(() => {
  if (!fs.existsSync(schemaSourcePath)) {
    throw new Error(`Could not find the SQLite schema source at ${schemaSourcePath}`);
  }

  if (fs.existsSync(databasePath)) {
    fs.rmSync(databasePath);
  }

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const sourceDatabase = new DatabaseSync(schemaSourcePath);
  const testDatabase = new DatabaseSync(databasePath);
  const schemaStatements = sourceDatabase
    .prepare(
      `SELECT sql
       FROM sqlite_master
       WHERE sql IS NOT NULL
         AND name NOT LIKE 'sqlite_%'
       ORDER BY CASE type WHEN 'table' THEN 1 WHEN 'index' THEN 2 WHEN 'trigger' THEN 3 ELSE 4 END, name`,
    )
    .all() as Array<{ sql: string }>;

  testDatabase.exec("PRAGMA foreign_keys = ON;");

  for (const statement of schemaStatements) {
    testDatabase.exec(statement.sql);
  }

  testDatabase.close();
  sourceDatabase.close();
});
