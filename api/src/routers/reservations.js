import express from "express";
import knex from "../database_client.js";

const router = express.Router();


//Adds a new meal to the database
router.post("/", async (req, res) => {
  try {
    const newRes = {
    number_of_guests: req.body.number_of_guests,
    meal_id: req.body.meal_id,
    created_date: req.body.created_date,
    contact_phonenumber: req.body.contact_phonenumber,
    contact_name: req.body.contact_name,
    contact_email: req.body.contact_email,
    created_date: new Date()
    };
    await knex("reservation").insert(newRes);
    res.status(201).send("It has been done!");
  } catch (error) {
    console.error("Error inserting meal:", error);
    res.send({ error: "Failed to create meal" });
  }
});


//Returns all reservations

router.get("/all-reservations", async (req, res) => {

  try {
    const allRes =  await knex("reservation").select("*");
    res.json(allRes);
  } catch (error) {
    console.log("Error fetching all meals:",error);
    res.status(500).json({ error: "Failed to fetch all meals" });
  }
});


//Returns a reservation by id
router.get("/findById/:id", async (req, res) => {
  const thisID = Number(req.params.id);
  try {
    const findByID =  await knex("reservation").select("*").where("id", thisID);
    res.json(findByID);
  } catch (error) {
    console.log("Error fetching reservation:",error);
    res.status(500).json({ error: "Failed to fetch reservation" });
  }
});

//Updates the reservation by id
router.put("/updates/:id", async (req, res) => {
  const thisID = Number(req.params.id);
  const dataToUpdate = req.body;
  try {
    await knex("reservation").select("*").where("id", thisID).update(dataToUpdate);
    res.send("Your data has been updated!");

  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
});


//Deletes the reservation by id
router.delete("/deletes/:id", async (req, res) => {
  const thisID = Number(req.params.id);
  try {
    const deletedCount = await knex('reservation').where({ id: thisID }).del();
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.send("The reservation has been deleted successfully!");
  } catch (error) {
    res.status(500).json({ error: "Failed to delete reservation", details: error.message });
  }
});


export default router;
