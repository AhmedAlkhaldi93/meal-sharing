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
router.get("/:id", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
  const query = req.query;
  const queryKey = Object.keys(query);

  let result = knex("meal").select("meal.*");

  //Returns all meals that are cheaper than maxPrice.	
  if(queryKey.includes("maxPrice") && !isNaN(Number(query.maxPrice)) && query.maxPrice){
    try {
      result =  result.where("price", "<", query.maxPrice);
    } catch (error) {
      res.status(500).json({ error: "Failed to do this query!", details: error.message });
    }
  }

  //availableReservations	
  if(queryKey.includes("availableReservations")){

    try {
      if (query.availableReservations === "true") {                           
        result = result
        .leftJoin("reservation", "meal.id", "reservation.meal_id")
        .groupBy("meal.id")
        .count("reservation.id as reservationsCount")
        .having("reservationsCount", ">", 0);

      }else if(query.availableReservations === "false") {
        result = result
        .leftJoin("reservation", "meal.id", "reservation.meal_id")
        .groupBy("meal.id")
        .count("reservation.id as reservationsCount")
        .having("reservationsCount", "=", 0);
      }else{
        res.send("The value must be either 'true' or 'false'");
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to do this query!", details: error.message });
    }
  }

  //title
  if(queryKey.includes("title")){
    try {
      result =  result.where("title", "LIKE", `%${query.title}%`);
      if(!query.title){
        res.send("No meals found matching this title!")
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to do this query!", details: error.message });
    }
  }

  //Returns all meals where the date for when is after the given date.
  if (queryKey.includes("dateAfter")) {
    try {
      result = result.where("when", ">", query.dateAfter);
      if (!query.dateAfter){
        res.send("No meals found after this date.");
      }
    } catch (error) {
      res.status(500).json({ error: "Query failed", details: error.message });
    }
  }

  //Returns all meals where the date for when is before the given date.
  if (queryKey.includes("dateBefore")) {
    try {
      result = result.where("when", "<", query.dateBefore);
      if (!query.dateBefore){
        res.send("No meals found before this date.");
      }
    } catch (error) {
      res.status(500).json({ error: "Query failed", details: error.message });
    }
  }

  //Returns the given number of meals.	
  if(queryKey.includes("limit")){
    try {
      if(Number(query.limit) > 0){
        result = result.limit(Number(query.limit));
      }else {
        res.send("Inter the number of limit correctly!");
      }
    } catch (error) {
      res.status(500).json({ error: "Query failed", details: error.message });
    }
  } 

  //Returns all meals sorted in the given direction. Only works combined with the sortKey and allows asc or desc.	
  if(queryKey.includes("sortKey") && queryKey.includes("sortDir")){
    try {
      if(query.sortKey == "price" || query.sortKey == "when" || query.sortKey == "max_reservations"){
      result = result.orderBy(query.sortKey, query.sortDir);
      }else{
      res.send("You can not sort this column!")
      } 
    } catch (error) {
      res.status(500).json({ error: "Query failed", details: error.message });
    }
  }else  if(queryKey.includes("sortKey")){          //Returns all meals sorted by the given key. Allows when, max_reservations and price as keys
    try {
      if(query.sortKey == "price" || query.sortKey == "when" || query.sortKey == "max_reservations"){
      result = result.orderBy(query.sortKey, "asc");
      }else{
      res.send("You can not sort this column!")
      } 
    } catch (error) {
      res.status(500).json({ error: "Query failed", details: error.message });
    }
  }

  try {
    const data = await result;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to execute final query", details: error.message });
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
