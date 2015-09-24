/*
 * The URL model is pretty lightweight, we don't have any particularly complex
 * data requirements.
 */

module.exports = function(sequelize, DataTypes) {

  var Url = sequelize.define('Url', {
    hash: {
      type: DataTypes.STRING,
      unique: true,
    },
    url: {
      type: DataTypes.STRING
    },
    count_clicks: {
      type: DataTypes.INTEGER,
    }
  },{
    freezeTableName: true
  });

  Url.sync({force: false}).then(function () {
    console.log('New table created for Url model');
  });

  return Url;

};

// vi:smartindent:tabstop=2:shiftwidth=2:expandtab:
