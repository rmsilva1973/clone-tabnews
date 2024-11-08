import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  cleanDatabase();
});

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function checkMigrationCount(migrationName) {
  const queryResult = await database.query(
    `SELECT count(*) from public.pg_migrations where name='${migrationName}';`,
  );
  const result = parseInt(queryResult.rows[0]["count"]);
  return result;
}

test("POST to /api/v1/migrations should return 200", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response1.status).toBe(201);

  const response1Body = await response1.json();
  expect(Array.isArray(response1Body)).toBe(true);

  expect(response1Body.length).toBeGreaterThan(0);

  response1Body.map((item) => {
    checkMigrationCount(item.name).then((result) => {
      expect(result).toBe(1);
    });
  });

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response2.status).toBe(200);

  const response2Body = await response2.json();
  expect(Array.isArray(response2Body)).toBe(true);

  expect(response2Body.length).toBe(0);
});
