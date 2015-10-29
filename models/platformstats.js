/*
 * The platform_stats object provides tracking of various platforms against
 * each URL. This makes it possible to report things such as number of iPhone
 * users, number of Windows users, etc.
 */

module.exports = function(sequelize, DataTypes) {

  var PlatformStats = sequelize.define('PlatformStats', {
    platform: {
      type: DataTypes.STRING
    },
    count_clicks: {
      type: DataTypes.INTEGER,
    }
  },{
    freezeTableName: true,   // Don't change table names
    paranoid: true,          // Deletes are hidden rather than permanent
    classMethods: {
      associate: function(models) {
        PlatformStats.belongsTo(models.Url, {
          onDelete: 'CASCADE',
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });

  return PlatformStats;

};

// vi:smartindent:tabstop=2:shiftwidth=2:expandtab:
