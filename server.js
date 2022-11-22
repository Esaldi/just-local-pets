require("dotenv").config();   // Read environment variables from .env
const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5163;
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

express()
  .use(express.static(path.join(__dirname, "public")))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", async(req, res) => {
    const response = await fetch(
      "https://api.petfinder.com/v2/oauth2/token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "grant_type": "client_credentials",
          "client_id": process.env.CLIENT_ID,
          "client_secret": process.env.CLIENT_SECRET
        })
      });
    const data = await response.json();
    const args = {
      "access_token": data.access_token,
      "expires_at": Date.now() + data.expires_in * 1000
    };

    res.render("pages/index", args);
   })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

