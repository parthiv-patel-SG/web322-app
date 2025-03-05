const fs = require('fs'); 
const path = require('path'); 

let items = []; // Global array to hold items
let categories = []; // Global array to hold categories

// Initialize function to read data from JSON files
function initialize() {
    return new Promise((resolve, reject) => {
        // Reading the items.json file
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                reject("Unable to read items.json file"); // error message on reject
                return;
            }
            items = JSON.parse(data); // Parse the data to the items array

            // reads categories.json
            fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                if (err) {
                    reject("Unable to read categories.json file"); // error msg on rejection.
                    return;
                }
                categories = JSON.parse(data); // Parse the data to the categories array
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
// Function to add a new item
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        // Set published to false if not defined
        itemData.published = itemData.published === undefined ? false : itemData.published;

        // Set id to the length of items array + 1
        itemData.id = items.length + 1;

        // Push the new item to the items array
        items.push(itemData);

        // Resolve with the newly added item
        resolve(itemData);
    });
}

// Function to get items by category
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === parseInt(category)); // Match category by value (1,2,3,4,5)
        
        if (filteredItems.length > 0) {
            resolve(filteredItems); // Return filtered items
        } else {
            reject("No items found for the specified category"); // Error if no items found
        }
    });
}

// Function to get items by minimum date
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr); // Convert string to Date object
        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate); // Filter by postDate
        
        if (filteredItems.length > 0) {
            resolve(filteredItems); // Return filtered items
        } else {
            reject("No items found after the specified date"); // Error if no items found
        }
    });
}

// Function to get an item by id
function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id === parseInt(id)); // Find the item by id
        if (item) {
            resolve(item); // Return the item if found
        } else {
            reject("Item not found"); // Reject with an error if not found
        }
    });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};
