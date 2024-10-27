import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  var result = await database.query("SHOW server_version");
  const dbVersion = result.rows[0].server_version;

  result = await database.query("SHOW max_connections;");
  const maxConnections = result.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  result = await database.query({
    text: "SELECT COUNT(*)::int AS current_connections FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const openedConnections = result.rows[0].current_connections;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      databases: {
        version: dbVersion,
        max_connections: parseInt(maxConnections),
        opened_connections: openedConnections,
      },
    },
  });
}

export default status;
