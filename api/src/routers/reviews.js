import express from "express";
import knex from "../database_client.js";

const router = express.Router();


// Reviews table

//Adds a new review to the database.

router.post("/", async (req, res) => {
  try {
    const newReview = {
      title: req.body.title,
      description: req.body.description,
      meal_id: req.body.meal_id,
      stars: req.body.stars,
      created_date: new Date()
    };

    await knex("review").insert(newReview);
    res.status(201).send("Review has been added successfully!");
  } catch (error) {
    console.error("Error inserting review:", error);
    res.status(500).send({ error: "Failed to create review" });
  }
});


//Returns all reviews table

router.get("/", async (req, res) => {

  try {
    const allRev =  await knex("review").select("*");
    res.json(allRev);
  } catch (error) {
    console.log("Error fetching all reviews table:",error);
    res.status(500).json({ error: "Failed to fetch all reviews table" });
  }
});



//Returns a reviews by id
router.get("/:id", async (req, res) => {
  const thisID = Number(req.params.id);
  try {
    const findByID =  await knex("review").select("*").where("id", thisID);
    if(findByID.length > 0){
        res.json(findByID);
    }else{
        res.send("No review found with this ID!");
    }
  } catch (error) {
    console.log("Error fetching reviews:",error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});


//Updates the review by id

router.put("/:id", async (req, res) => {
  const thisID = Number(req.params.id);
  const dataToUpdate = req.body;
  try {
    await knex("review").select("*").where("id", thisID).update(dataToUpdate);
    res.send("Your data has been updated!");
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
});


//Deletes the review by id

router.delete("/:id", async (req, res) => {
  const thisID = Number(req.params.id);
  try {
    const deletedCount = await knex('review').where({ id: thisID }).del();
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'This review dose not found' });
    }
    res.send("The review has been deleted successfully!");
  } catch (error) {
    res.status(500).json({ error: "Failed to delete this review", details: error.message });
  }
});



export default router;
