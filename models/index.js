/*
 * Establish all the models stored in the DB using Sequelize
 *
 * References:
 * http://sequelize.readthedocs.org/en/1.7.0/articles/express/
 * http://stackoverflow.com/questions/13151693/passing-arguments-to-require-when-loading-module
 */

module.exports = function (params) {
  // We get the express app passed through so we can use the settigns from it
  var app = params.app;

  // The DB module is the only one we actually export
  var db        = {};


  // Establish the DB connection
  var Sequelize = require("sequelize");

  var sequelize = new Sequelize(
      app.get('db_database'),
      app.get('db_username'),
      app.get('db_password'),
      {
        host: app.get('db_host'),
        dialect: app.get('db_dialect'),
        pool: {
          max: 5,
          min: 0,
          idle: 300,
        },
        
        // Only used for sqlite
        storage: './data/' + app.get('db_database') + '.sqlite'
      });


  // Find all the models and define them
  var fs        = require("fs");
  var path      = require("path");

  fs
    .readdirSync(__dirname)
      .filter(function(file) {
            return (file.indexOf(".") !== 0) && (file !== "index.js");
              })
  .forEach(function(file) {
        var model = sequelize.import(path.join(__dirname, file));
            db[model.name] = model;
              });

  Object.keys(db).forEach(function(modelName) {
      if ("associate" in db[modelName]) {
        console.log("Associating relationship for model: "+ modelName)
        db[modelName].associate(db);
      }
  });

  sequelize.sync({force: false, logging: console.log}).then(function () {
    console.log('Performing sequelize sync...');
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
};



// vi:smartindent:tabstop=2:shiftwidth=2:expandtab:
