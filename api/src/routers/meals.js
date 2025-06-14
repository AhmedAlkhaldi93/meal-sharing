import express from "express";
import knex from "../database_client.js";

const router = express.Router();


//Adds a new meal to the database
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

//Returns all meals
router.get("/all-meals", async (req, res) => {

  try {
    const allMeals =  await knex("meal").select("*");
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

//Returns the meal by id
router.get("/findById/:id", async (req, res) => {
  const thisID = Number(req.params.id);
  try {
    const findByID =  await knex("meal").select("*").where("id", thisID);
    res.json(findByID);            // localhost:3001/api/meals/findById/<thisID>
  } catch (error) {
    console.log("Error fetching last meal:",error);
    res.status(500).json({ error: "Failed to fetch last meal" });
  }
});

//Updates the meal by id
router.put("/updates/:id", async (req, res) => {
  const thisID = Number(req.params.id);
  const dataToUpdate = req.body;
  try {
    await knex("meal").select("*").where("id", thisID).update(dataToUpdate);
    res.send("Your data has been updated!");

  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
});


//Deletes the meal by id
router.delete("/deletes/:id", async (req, res) => {
  const thisID = Number(req.params.id);
  try {
    const deletedCount = await knex('meal').where({ id: thisID }).del();
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    res.send("The meal has been deleted successfully!");
  } catch (error) {
    res.status(500).json({ error: "Failed to delete meal", details: error.message });
  }
});


export default router;
