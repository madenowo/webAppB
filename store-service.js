

const fs = require("fs");
const { Sequelize, DataTypes, Op } = require("sequelize");

let items = [];
let categories = [];

const sequelize = new Sequelize('kplrdqnv', 'kplrdqnv', 'US_vW8G8fjgCwarbv0km6WHL81RVC4GS', {
  host: 'lallah.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

const Items = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  featureImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  published: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false
  }
});

const Categories = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// 
Items.belongsTo(Categories, { foreignKey: 'category' });

// Function to initialize the database
function initialize() {
  // Perform the database synchronization and insert data from JSON files
  return sequelize.sync({ force: true }) // Pass { force: true } to drop and recreate the tables on each sync
    .then(() => {
      console.log('Database synced');

      // Read data from categories.json and items.json files
      const categoriesData = fs.readFileSync('./data/categories.json', 'utf8');
      const itemsData = fs.readFileSync('./data/items.json', 'utf8');

      // Parse the JSON data into arrays
      const categoriesArr = JSON.parse(categoriesData);
      const itemsArr = JSON.parse(itemsData);

      // Use bulkCreate to insert data into the database tables
      return Categories.bulkCreate(categoriesArr)
        .then(() => Items.bulkCreate(itemsArr))
        .then(() => {
          console.log('Data from JSON files inserted into the database');
        })
        .catch((err) => {
          console.error('Error inserting data from JSON:', err.message);
          throw err;
        });
    })
    .catch((err) => {
      console.error('Database sync error:', err.message);
      throw new Error('Unable to sync the database');
    });
}


// Rest of the code...
// ...

module.exports.initialize = initialize;
module.exports.getItemById = function (id) {
  // Use Sequelize's findOne method to find the item by its id
  return Items.findOne({ where: { id: id } })
    .then((item) => {
      if (item) {
        return item;
      } else {
        throw new Error('No result returned');
      }
    });
}

module.exports.getAllItems = function () {
  // Use Sequelize's findAll method to get all items
  return Items.findAll()
    .then((items) => {
      if (items.length > 0) {
        return items;
      } else {
        throw new Error('No results returned');
      }
    });
}

module.exports.getPublishedItems = function () {
  // Use Sequelize's findAll method with a where clause to get published items
  return Items.findAll({ where: { published: true } })
    .then((items) => {
      if (items.length > 0) {
        return items;
      } else {
        throw new Error('No results returned');
      }
    });
}

module.exports.getCategories = function () {
  // Use Sequelize's findAll method to get all categories
  return Categories.findAll()
    .then((categories) => {
      if (categories.length > 0) {
        return categories;
      } else {
        throw new Error('No results returned');
      }
    });
}


module.exports.addItem = function(itemData){
    return new Promise((resolve,reject)=>{
        // check if published is true or not. 
        itemData.published = itemData.published ? true : false;

        // increase the Id by 1, for our 'index'
        itemData.id = items.length + 1;

        // push the item to the dataStore
        items.push(itemData);

        // resolve the promise
        resolve();
    });
}

module.exports.getItemsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        let filteredItems = items.filter(item=>item.category == category);

        if(filteredItems.length == 0){
            reject("no results returned")
        }else{
            resolve(filteredItems);
        }
    });
}

module.exports.getItemsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(item => (new Date(item.postDate)) >= (new Date(minDateStr)))

        if (filteredItems.length == 0) {
            reject("no results returned")
        } else {
            resolve(filteredItems);
        }
    });
}

module.exports.getPublishedItemsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        let filteredItems = items.filter(item => item.published && item.category == category);
        (filteredItems.length > 0) ? resolve(filteredItems) : reject("no results returned");
    });
}


