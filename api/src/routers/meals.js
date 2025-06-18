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


// Homework week3
router.get("/", async (req, res) => {

  const q =  Object.keys(req.query)[0];
  const q2 = Object.keys(req.query)[1];
  const value = req.query[q];
  const value2 = req.query[q2];

  //Returns all meals that are cheaper than maxPrice.	
  if(q == "maxPrice" && !isNaN(Number(value)) && value){
    try {
      const result =  await knex("meal").select("*").where("price", "<", value);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to do this query!", details: error.message });
    }
  }

  //availableReservations	
  if(q == "availableReservations"){

    try {
      if (value === "true") {                           
        const result = await knex("meal")
        .leftJoin("reservation", "meal.id", "reservation.meal_id")
        .groupBy("meal.id")
        .select("meal.*")
        .count("reservation.id as reservationsCount")
        .having("reservationsCount", ">", 0);

        res.json(result);
      }else if(value === "false") {
        const result = await knex("meal")
        .leftJoin("reservation", "meal.id", "reservation.meal_id")
        .groupBy("meal.id")
        .select("meal.*")
        .count("reservation.id as reservationsCount")
        .having("reservationsCount", "=", 0);

        res.json(result);
      }else{
        res.send("The value must be either 'true' or 'false'");
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to do this query!", details: error.message });
    }
  }

  //title
  if(q == "title"){
    try {
      const result =  await knex("meal").select("*").where("title", "LIKE", `%${value}%`);
      if(result.length > 0){
        res.json(result);
      }else{
        res.send("No meals found matching this title!")
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to do this query!", details: error.message });
    }
  }

  //Returns all meals where the date for when is after the given date.
  if (q === "dateAfter") {
    try {
      const result = await knex("meal").select("*").where("when", ">", value);
      if (result.length > 0) {
        res.json(result);
      } else {
        res.send("No meals found after this date.");
      }
    } catch (error) {
      res.status(500).json({ error: "Query failed", details: error.message });
    }
  }

  //Returns all meals where the date for when is before the given date.
  if (q === "dateBefore") {
    try {
      const result = await knex("meal").select("*").where("when", "<", value);
      if (result.length > 0) {
        res.json(result);
      } else {
        res.send("No meals found before this date.");
      }
    } catch (error) {
      res.status(500).json({ error: "Query failed", details: error.message });
    }
  }

  //Returns the given number of meals.	
  if(q == "limit"){
    try {
      if(Number(value) > 0){
        const result = await knex("meal").select("*").limit(Number(value));
        res.json(result);
      }else {
        res.send("Inter the number of limit correctly!");
      }
    } catch (error) {
      res.status(500).json({ error: "Query failed", details: error.message });
    }
  } 

  //Returns all meals sorted in the given direction. Only works combined with the sortKey and allows asc or desc.	
  if(q == "sortKey" && q2 == "sortDir"){
    try {
      if(value == "price" || value == "when" || value == "max_reservations"){
      const result = await knex("meal").select("*").orderBy(value, value2);
      res.json(result);
      }else{
      res.send("You can not sort this column!")
      } 
    } catch (error) {
      res.status(500).json({ error: "Query failed", details: error.message });
    }
  }else  if(q == "sortKey"){          //Returns all meals sorted by the given key. Allows when, max_reservations and price as keys
    try {
      if(value == "price" || value == "when" || value == "max_reservations"){
      const result = await knex("meal").select("*").orderBy(value, "asc");
      res.json(result);
      }else{
      res.send("You can not sort this column!")
      } 
    } catch (error) {
      res.status(500).json({ error: "Query failed", details: error.message });
    }
  }

});


//Returns all reviews for a specific meal.

router.get("/:meal_id/reviews", async (req, res) => {
  const mealID = req.params;
  try {
    const reviews = await knex("review").select("*").where("meal_id", mealID.meal_id);

    if (reviews.length > 0) {
      res.json(reviews);
    } else {
      res.status(404).json({ message: "No reviews found for this meal." });
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});


export default router;
