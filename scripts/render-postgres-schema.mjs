import fs from "node:fs";
import path from "node:path";

const sourcePath = path.resolve(process.cwd(), "prisma", "schema.prisma");
const targetPath = path.resolve(process.cwd(), "prisma", "schema.postgres.prisma");

const source = fs.readFileSync(sourcePath, "utf8");
const rendered = source.replace('provider = "sqlite"', 'provider = "postgresql"');

fs.writeFileSync(targetPath, rendered);
console.log(`Rendered Postgres Prisma schema to ${targetPath}`);
