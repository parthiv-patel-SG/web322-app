const fs = require('fs'); // Import the fs (filesystem) module to read files
const path = require('path'); // Import path module for better file path management

let items = []; // Global array to hold items
let categories = []; // Global array to hold categories

// Initialize function to read data from JSON files
function initialize() {
    return new Promise((resolve, reject) => {
        // Reading the items.json file
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                reject("Unable to read items.json file"); // Reject if there is an error
                return;
            }
            items = JSON.parse(data); // Parse the data and assign it to the items array

            // Once items.json is read, proceed to read categories.json
            fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                if (err) {
                    reject("Unable to read categories.json file"); // Reject if there is an error
                    return;
                }
                categories = JSON.parse(data); // Parse the data and assign it to the categories array
                resolve(); // Resolve the promise when both files are read successfully
            });
        });
    });
}

// Function to get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items); // Return all items if there are any
        } else {
            reject("No results returned"); // Reject if the array is empty
        }
    });
}

// Function to get only published items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length > 0) {
            resolve(publishedItems); // Return only published items
        } else {
            reject("No results returned"); // Reject if no published items
        }
    });
}

// Function to get all categories
function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories); // Return all categories if there are any
        } else {
            reject("No results returned"); // Reject if the array is empty
        }
    });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories
};
