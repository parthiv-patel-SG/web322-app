/*********************************************************************************
WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: ___Parthiv Patel___________________
Student ID: ____153136221__________
Date: _____06th-Feb-2025___________
Cyclic Web App URL: ____I have deplohyed on render(https://web322-app-0tmv.onrender.com)___________________________________________________
GitHub Repository URL: ____https://github.com/parthiv-patel-SG/web322-app__________________________________________________
********************************************************************************/

const express = require("express");
const path = require("path");
const itemData = require("./store-service"); // Import the store-service module
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { EDESTADDRREQ } = require("constants");

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dfp2aqn56', // Replace with your Cloudinary Cloud Name
    api_key: '226366235986687',       // Replace with your Cloudinary API Key
    api_secret: 'h9blJFF2envzDbMiXs0QVEyNr60', // Replace with your Cloudinary API Secret
    secure: true
});

// Create the upload variable for multer (without disk storage)
const upload = multer(); // no { storage: storage } since we are not using disk storage

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Add our middleware function for handling active route highlighting
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = (route === "") ? "/" : "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Initialize store service before handling routes
itemData
    .initialize()
    .then(() => {
        console.log("Store data initialized successfully.");

        // Default route - redirect to /shop
        app.get("/", (req, res) => {
            res.redirect("/shop");
        });

        // About page
        app.get("/about", (req, res) => {
            res.render("about", {
                activeRoute: "/about"
            });
        });

        // Add Item page
        app.get("/items/add", (req, res) => {
            res.render("addItem", {
                activeRoute: "/items/add"
            });
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
                itemData.addItem(req.body)
                    .then((newItem) => {
                        console.log("New item added:", newItem);
                        res.redirect("/items"); // Redirect to the /items route after adding the item
                    })
                    .catch((err) => {
                        res.status(500).send("Error adding item.");
                    });
            }
        });

        // Shop route
        app.get("/shop", (req, res) => {
            let viewData = {};
            
            try {
                let items;
                
                if (req.query.category) {
                    // Filter by category
                    items = itemData.getPublishedItemsByCategory(req.query.category);
                } else {
                    // Show all items
                    items = itemData.getPublishedItems();
                }
                
                items.then(data => {
                    viewData.posts = data;
                    
                    // Get categories
                    return itemData.getCategories();
                }).then(categoryData => {
                    viewData.categories = categoryData;
                    
                    // Get the latest post
                    if (viewData.posts.length > 0) {
                        // Sort by date (newest first)
                        viewData.posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
                        
                        // Set the latest post
                        viewData.post = viewData.posts[0];
                    }
                    
                    // Render the shop view
                    res.render("shop", { 
                        data: viewData,
                        activeRoute: "/shop",
                        viewingCategory: req.query.category
                    });
                }).catch(err => {
                    viewData.message = "No results";
                    res.render("shop", { 
                        data: viewData,
                        activeRoute: "/shop",
                        viewingCategory: req.query.category
                    });
                });
            } catch (err) {
                viewData.message = "No results";
                res.render("shop", { 
                    data: viewData,
                    activeRoute: "/shop",
                    viewingCategory: req.query.category
                });
            }
        });
        
        // Shop by ID route
        app.get("/shop/:id", (req, res) => {
            let viewData = {};
            
            try {
                // Get the requested post
                let items = itemData.getItemById(req.params.id);
                
                items.then(data => {
                    if (data) {
                        viewData.post = data;
                        
                        // Get published items and categories
                        if (req.query.category) {
                            return itemData.getPublishedItemsByCategory(req.query.category);
                        } else {
                            return itemData.getPublishedItems();
                        }
                    } else {
                        throw new Error('No results returned');
                    }
                }).then(items => {
                    viewData.posts = items;
                    
                    // Get categories
                    return itemData.getCategories();
                }).then(categoryData => {
                    viewData.categories = categoryData;
                    
                    // Render the shop view
                    res.render("shop", { 
                        data: viewData,
                        activeRoute: "/shop",
                        viewingCategory: req.query.category
                    });
                }).catch(err => {
                    viewData.message = "No results";
                    res.render("shop", { 
                        data: viewData,
                        activeRoute: "/shop",
                        viewingCategory: req.query.category
                    });
                });
            } catch (err) {
                viewData.message = "No results";
                res.render("shop", { 
                    data: viewData,
                    activeRoute: "/shop",
                    viewingCategory: req.query.category
                });
            }
        });
        
        // Items route
        app.get("/items", (req, res) => {
            // Apply filters if present
            let itemPromise;
            
            if (req.query.category) {
                itemPromise = itemData.getItemsByCategory(req.query.category);
            } else if (req.query.minDate) {
                itemPromise = itemData.getItemsByMinDate(req.query.minDate);
            } else {
                itemPromise = itemData.getAllItems();
            }
            
            // Process the promise
            itemPromise
                .then(data => {
                    res.render("items", { 
                        items: data,
                        activeRoute: "/items"
                    });
                })
                .catch(err => {
                    res.render("items", { 
                        message: "No results",
                        activeRoute: "/items"
                    });
                });
        });
        
        // Categories route
        app.get("/categories", (req, res) => {
            itemData.getCategories()
                .then(data => {
                    res.render("categories", { 
                        categories: data,
                        activeRoute: "/categories"
                    });
                })
                .catch(err => {
                    res.render("categories", { 
                        message: "No results",
                        activeRoute: "/categories"
                    });
                });
        });

        // Handle 404 - Page Not Found for undefined routes
        app.use((req, res) => {
            res.status(404).render("404", {
                activeRoute: "/404"
            });
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