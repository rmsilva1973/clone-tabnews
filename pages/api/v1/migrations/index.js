import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function status(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.statu(405).json({
      error: `Method ${request.method} not allowed`,
    });
  }

  let dbClient;
  try {
    dbClient = await database.getNewClient();
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
      response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const deployedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });
      if (deployedMigrations.length > 0) {
        return response.status(201).json(deployedMigrations);
      }
      return response.status(200).json(deployedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
