import { Client } from "pg";

async function query(queryObject) {
  database_creds = {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  };
  const client = new Client(database_creds);
  console.log("Credenciais do banco:", database_creds);
  var result = null;
  try {
    await client.connect();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await client.end();
  }
  return result;
}

export default {
  query: query,
};
