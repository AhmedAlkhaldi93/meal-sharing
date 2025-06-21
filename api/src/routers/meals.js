import express from "express";
import knex from "../database_client.js";

const router = express.Router();

// ✅ POST /api/meals

router.post("/", async (req, res) => {
  try {
    const newMeal = {
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    price: req.body.price,
    max_reservations: req.body.max_reservations,
    when: req.body.when,
    created_date: new Date()
    };
    await knex("meal").insert(newMeal);
    res.status(201).send("done!");
  } catch (error) {
    console.error("Error inserting meal:", error);
    res.send({ error: "Failed to create meal" });
  }
});

// answers for the first week
router.get("/future-meals", async (req, res) => {
  try {
    const futureMeals = await knex("meal")
      .where("when", ">", new Date());

    res.json(futureMeals);
  } catch (error) {
    console.error("Error fetching future meals:", error);
    res.status(500).json({ error: "Failed to fetch future meals" });
  }
});

router.get("/past-meals", async (req, res) => {
  try {
    const pastMeals = await knex("meal")
      .where("when", "<", new Date());

    res.json(pastMeals);
  } catch (error) {
    console.error("Error fetching future meals:", error);
    res.status(500).json({ error: "Failed to fetch past meals" });
  }
});

router.get("/all-meals", async (req, res) => {

  try {
    const allMeals =  await knex("meal").select("*").orderBy("id", "asc");
    res.json(allMeals);
  } catch (error) {
    console.log("Error fetching all meals:",error);
    res.status(500).json({ error: "Failed to fetch all meals" });
  }
});

router.get("/first-meal", async (req, res) => {

  try {
    const firstMeal =  await knex("meal").select("*").orderBy("id", "asc");
    res.json(firstMeal[0]);
  } catch (error) {
    console.log("Error fetching first meal:",error);
    res.status(500).json({ error: "Failed to fetch first meal" });
  }
});

router.get("/last-meal", async (req, res) => {

  try {
    const lastMeal =  await knex("meal").select("*").orderBy("id", "asc");
    const index = lastMeal.length - 1;
    res.json(lastMeal[index]);
  } catch (error) {
    console.log("Error fetching last meal:",error);
    res.status(500).json({ error: "Failed to fetch last meal" });
  }
});



export default router;
