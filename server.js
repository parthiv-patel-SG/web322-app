const express = require('express');
const path = require('path');
const storeService = require('./store-service'); // Import the store-service module

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Initialize store service before handling routes
storeService.initialize()
    .then(() => {
        console.log("Store data initialized successfully.");

        // Redirect the root URL to the About page
        // Serve the about.html page as the root page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

        // /about route - serves the about page
        app.get('/about', (req, res) => {
            res.sendFile(path.join(__dirname, 'views', 'about.html')); // Ensure about.html exists in views folder
        });

        // /shop route - get all items
        app.get('/shop', (req, res) => {
            storeService.getAllItems()
                .then((data) => {
                    res.json(data); // Send all items data back to the client
                })
                .catch((err) => {
                    res.json({ message: err }); // Error response if data retrieval fails
                });
        });

        // /items route - get all published items
        app.get('/items', (req, res) => {
            storeService.getPublishedItems()
                .then((data) => {
                    res.json(data); // Send published items data back to the client
                })
                .catch((err) => {
                    res.json({ message: err }); // Error response if data retrieval fails
                });
        });

        // /categories route - get all categories
        app.get('/categories', (req, res) => {
            storeService.getCategories()
                .then((data) => {
                    res.json(data); // Send categories data back to the client
                })
                .catch((err) => {
                    res.json({ message: err }); // Error response if data retrieval fails
                });
        });

        // Handle 404 - Page Not Found for undefined routes
        app.use((req, res) => {
            res.status(404).send('Page Not Found');
        });

        // Start the server
        app.listen(HTTP_PORT, () => {
            console.log(`Express http server listening on port ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error initializing store data:", err);
    });
