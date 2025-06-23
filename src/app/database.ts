import knex, { Knex } from "knex";
import config from "../config/config";

let dbInstance: Knex;

/**
 * Creates a database connection using Knex.js.
 * This function initializes the database connection only once and returns the instance.
 * It uses PostgreSQL as the database client.
 *
 * @returns {Knex} The Knex instance for database operations.
 */

const createDbCon = () => {
  if (!dbInstance) {
    dbInstance = knex({
      client: "pg",
      connection: {
        host: config.DB_HOST,
        port: parseInt(config.DB_PORT),
        user: config.DB_USER,
        password: config.DB_PASS,
        database: config.DB_NAME,
        ssl: {
          rejectUnauthorized: false,
        },
      },
      pool: {
        min: 5,
        max: 100,
      },
      acquireConnectionTimeout: 10000,
    });

    console.log("✅ Database connected successfully! 💻");
  }
  return dbInstance;
};

export const db = createDbCon();
