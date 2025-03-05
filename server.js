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

const express = require("express");
const path = require("path");
const storeService = require("./store-service"); // Import the store-service module
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'YOUR_CLOUD_NAME', // Replace with your Cloudinary Cloud Name
    api_key: 'YOUR_API_KEY',       // Replace with your Cloudinary API Key
    api_secret: 'YOUR_API_SECRET', // Replace with your Cloudinary API Secret
    secure: true
});

// Create the upload variable for multer (without disk storage)
const upload = multer(); // no { storage: storage } since we are not using disk storage

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

        // /items/add route - serves the addItem.html page
        app.get("/items/add", (req, res) => {
            res.sendFile(path.join(__dirname, "views", "addItem.html"));
        });

        // POST /items/add route - handles item creation and image upload
        app.post("/items/add", upload.single("featureImage"), (req, res) => {
            // If there is a file in the request
            if(req.file){
                let streamUpload = (req) => {
                    return new Promise((resolve, reject) => {
                        let stream = cloudinary.uploader.upload_stream(
                            (error, result) => {
                                if (result) {
                                    resolve(result);
                                } else {
                                    reject(error);
                                }
                            }
                        );
        
                        // Stream the file to Cloudinary
                        streamifier.createReadStream(req.file.buffer).pipe(stream);
                    });
                };
        
                async function upload(req) {
                    let result = await streamUpload(req);
                    console.log(result);
                    return result;
                }
        
                // Upload the image and process the item
                upload(req).then((uploaded) => {
                    processItem(uploaded.url);
                }).catch((error) => {
                    console.error("Error uploading image:", error);
                    processItem(""); // Fallback to empty string if upload fails
                });
            } else {
                processItem(""); // No file uploaded, set empty string for image URL
            }
        
            // Function to process the item after upload
            function processItem(imageUrl) {
                req.body.featureImage = imageUrl;
        
                // Use the addItem function to add the item to the store
                storeService.addItem(req.body) // Assuming addItem is now in store-service.js
                    .then((newItem) => {
                        console.log("New item added:", newItem);
                        res.redirect("/items"); // Redirect to the /items route after adding the item
                    })
                    .catch((err) => {
                        res.status(500).send("Error adding item.");
                    });
            }
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
            const { category, minDate } = req.query;
        
            // Check if the category query parameter is provided
            if (category) {
                storeService.getItemsByCategory(category)
                    .then((data) => {
                        res.json(data); // Return filtered items by category
                    })
                    .catch((err) => {
                        res.status(400).json({ message: err }); // Return error if no items found
                    });
            } 
            // Check if the minDate query parameter is provided
            else if (minDate) {
                storeService.getItemsByMinDate(minDate)
                    .then((data) => {
                        res.json(data); // Return filtered items by minimum date
                    })
                    .catch((err) => {
                        res.status(400).json({ message: err }); // Return error if no items found
                    });
            } 
            // No filter, return all items
            else {
                storeService.getAllItems()
                    .then((data) => {
                        res.json(data); // Return all items
                    })
                    .catch((err) => {
                        res.status(400).json({ message: err });
                    });
            }
        });

        app.get("/item/:id", (req, res) => {
            const { id } = req.params; // Get the id from the URL parameters
        
            storeService.getItemById(id)
                .then((data) => {
                    res.json(data); // Return the item as JSON if found
                })
                .catch((err) => {
                    res.status(404).json({ message: err }); // Return an error if no item is found
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
