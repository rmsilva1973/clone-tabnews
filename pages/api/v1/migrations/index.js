import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function status(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pg_migrations",
  };
  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigrationOptions);
    await dbClient.end();
    response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const deployedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });
    await dbClient.end();
    if (deployedMigrations.length > 0) {
      return response.status(201).json(deployedMigrations);
    }
    return response.status(200).json(deployedMigrations);
  }

  return response.status(405);
}
