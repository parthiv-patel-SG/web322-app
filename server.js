/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: ___Parthiv patel___________________
Student ID: ____153136221__________
Date: _____06th-Feb-2025___________
Cyclic Web App URL: ____I have deplohyed on render(https://web322-app-0tmv.onrender.com)___________________________________________________
GitHub Repository URL: ____https://github.com/parthiv-patel-SG/web322-app__________________________________________________
********************************************************************************/

/*
           NOTE FOR PROFESSOR :-
i have deployed the website on render, but it says on using the free version, my server will go on sleep on an inactivity of certain time period
and after that it will take a little time to load the server for the first time due to inactivity. If this happens please be patient for a minute or 2.

I'll also paste my replit coverpage link, its here (https://eb92fe2d-9e3f-4514-bebf-e6dd681ca1a1-00-1ze6jbaxe3kmo.worf.replit.dev/about) 
 But for it to work, my server should be online from my replit account, so if you want to see it over there, you might need to contact me 
 to ask me to go online from my account.*/ 


const express = require("express");
const path = require("path");
const storeService = require("./store-service"); // Import the store-service module

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Initialize store service before handling routes
storeService
    .initialize()
    .then(() => {
        console.log("Store data initialized successfully.");

        // /about route - serves the about page
        app.get("/", (req, res) => {
            res.redirect("/about");
        });
        app.get("/about", (req, res) => {
            res.sendFile(path.join(__dirname, "views", "about.html")); 
        });

        // Getting all the items data for shop route.
        app.get("/shop", (req, res) => {
            storeService
                .getAllItems()
                .then((data) => {
                    res.json(data); // Send all items data back to the client
                })
                .catch((err) => {
                    res.json({ message: err }); // Error response 
                });
        });

        // Getting all the published items data for items route.
        app.get("/items", (req, res) => {
            storeService
                .getPublishedItems()
                .then((data) => {
                    res.json(data); // Send data back to the client
                })
                .catch((err) => {
                    res.json({ message: err }); // Error response 
                });
        });

        // getting all categories for categories route
        app.get("/categories", (req, res) => {
            storeService
                .getCategories()
                .then((data) => {
                    res.json(data); // Send categories data back to the client
                })
                .catch((err) => {
                    res.json({ message: err }); // Error response if data retrieval fails
                });
        });

        // Handle 404 - Page Not Found for undefined routes
        app.use((req, res) => {
            res.status(404).send("Page Not Found");
        });

        // Start the server
        app.listen(HTTP_PORT, () => {
            console.log(`Express http server listening on port ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        // If initialization fails, log the error
        console.error("Error initializing store data:", err);
    });
