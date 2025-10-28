import knex, { Knex } from "knex";
import config from "../config/config";

let dbInstance: Knex;

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
        ssl:
          // process.env.NODE_ENV === "production"
          //   ?
          {
            rejectUnauthorized: false,
          },
        // : false,
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
