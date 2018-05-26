
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_records
      MODIFY duration INT NULL
    `)
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_records
      MODIFY duration TIME(0) NULL
    `)
};
