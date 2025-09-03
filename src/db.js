import pg from "pg";
import env from "dotenv";
import * as userService from "./services/userServices.js";

env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

db.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export const query = (text, params) => db.query(text, params);
// -------------------- CONTROLLER FOR LAWYERS' CASE SPECIALTIES 

export const getLawyersByCaseCategoryTypes = async (req, res) => {
  try {
    const lawyers = await userService.getLawyersByCaseCategoryTypes();
    res.status(200).json(lawyers);
  } catch (err) {
    console.error("Error fetching lawyers by case category types", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};  