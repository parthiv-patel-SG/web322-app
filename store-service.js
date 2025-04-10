const Sequelize = require('sequelize');

// Replace these values with your ElephantSQL credentials
var sequelize = new Sequelize({
    database: "neondb", 
    username: "neondb_owner",
    password: "npg_lcA5LBVn0oGd",
    host: 'ep-crimson-darkness-a5ewf0wi-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Test the database connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection to the database has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Define Item model
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

// Define Category model
const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// Define relationships between models
Item.belongsTo(Category, {foreignKey: 'category'});

// Initialize function to sync the database
function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject("unable to sync the database");
            });
    });
}

// Get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

// Get items by category
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                category: category
            }
        })
        .then((data) => {
            if (data.length > 0) {
                resolve(data);
            } else {
                reject("no results returned");
            }
        })
        .catch((err) => {
            reject("no results returned");
        });
    });
}

// Get items by min date
function getItemsByMinDate(minDateStr) {
    const { gte } = Sequelize.Op;
    
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then((data) => {
            if (data.length > 0) {
                resolve(data);
            } else {
                reject("no results returned");
            }
        })
        .catch((err) => {
            reject("no results returned");
        });
    });
}

// Get item by ID
function getItemById(id) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                id: id
            }
        })
        .then((data) => {
            if (data.length > 0) {
                resolve(data[0]);
            } else {
                reject("no results returned");
            }
        })
        .catch((err) => {
            reject("no results returned");
        });
    });
}

// Add a new item
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        // Set published property
        itemData.published = (itemData.published) ? true : false;
        
        // Replace empty strings with null
        for (let prop in itemData) {
            if (itemData[prop] === "") {
                itemData[prop] = null;
            }
        }
        
        // Set postDate to current date
        itemData.postDate = new Date();
        
        // Create the item
        Item.create(itemData)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject("unable to create item");
            });
    });
}

// Get published items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true
            }
        })
        .then((data) => {
            console.log(data);
            if (data.length > 0) {
                resolve(data);
            } else {
                reject("no results returned");
            }
        })
        .catch((err) => {
            reject("no results returned");
        });
    });
}

// Get published items by category
function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true,
                category: category
            }
        })
        .then((data) => {
            if (data.length > 0) {
                resolve(data);
            } else {
                reject("no results returned");
            }
        })
        .catch((err) => {
            reject("no results returned");
        });
    });
}

// Get all categories
function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

// Add a new category
function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
        // Replace empty strings with null
        for (let prop in categoryData) {
            if (categoryData[prop] === "") {
                categoryData[prop] = null;
            }
        }
        
        // Create the category
        Category.create(categoryData)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject("unable to create category");
            });
    });
}

// Delete category by ID
function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        })
        .then((rowsDeleted) => {
            if (rowsDeleted > 0) {
                resolve();
            } else {
                reject("Category not found");
            }
        })
        .catch((err) => {
            reject("unable to delete category");
        });
    });
}

// Delete item by ID
function deleteItemById(id) {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: {
                id: id
            }
        })
        .then((rowsDeleted) => {
            if (rowsDeleted > 0) {
                resolve();
            } else {
                reject("Item not found");
            }
        })
        .catch((err) => {
            reject("unable to delete item");
        });
    });
}

module.exports = {
    initialize,
    getAllItems,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    addItem,
    getPublishedItems,
    getPublishedItemsByCategory,
    getCategories,
    addCategory,
    deleteCategoryById,
    deleteItemById
};