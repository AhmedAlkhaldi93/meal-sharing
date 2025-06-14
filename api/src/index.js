import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import knex from "./database_client.js";
import nestedRouter from "./routers/nested.js";
import mealsRouter from "./routers/meals.js";
import resRouter from "./routers/reservations.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const apiRouter = express.Router();
apiRouter.use("/meals", mealsRouter);
apiRouter.use("/reservation", resRouter);


apiRouter.get("/", async (req, res) => {
  const dbClient = process.env.DB_CLIENT;
  let query;

  if (dbClient === "pg") {
    query =
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';";
  } else if (dbClient === "mysql" || dbClient === "mysql2") {
    query = "SHOW TABLES;";
  } else if (dbClient === "sqlite3") {
    query = "SELECT name FROM sqlite_master WHERE type='table';";
  } else {
    return res.status(400).json({ error: "Unsupported DB_CLIENT" });
  }

  try {
    const result = await knex.raw(query);
    let tables = [];
    if (dbClient === "pg") {
      tables = result.rows.map(row => row.tablename);
    } else if (dbClient === "sqlite3") {
      tables = result.map(row => row.name);
    } else if (dbClient === "mysql" || dbClient === "mysql2") {
      tables = result[0].map(row => Object.values(row)[0]);
    }

    res.json(tables);
  } catch (error) {
    console.error("❌ Error fetching tables:", error);
    res.status(500).json({ error: "Failed to fetch table list" });
  }
});


apiRouter.use("/nested", nestedRouter);

app.use("/api", apiRouter);

app.listen(process.env.PORT, () => {
  console.log(`✅ API listening on port ${process.env.PORT}`);
}); 
