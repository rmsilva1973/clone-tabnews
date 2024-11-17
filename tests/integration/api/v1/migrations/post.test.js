import orchestrator from "tests/orchestrator.js";
import database from "infra/database.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

async function checkMigrationCount(migrationName) {
  const queryResult = await database.query(
    `SELECT count(*) from public.pg_migrations where name='${migrationName}';`,
  );
  const result = parseInt(queryResult.rows[0]["count"]);
  return result;
}

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response.status).toBe(201);

        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);

        expect(responseBody.length).toBeGreaterThan(0);

        responseBody.map((item) => {
          checkMigrationCount(item.name).then((result) => {
            expect(result).toBe(1);
          });
        });
      });
      test("For the second time", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response.status).toBe(200);

        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);

        expect(responseBody.length).toBe(0);
      });
    });
  });
});
