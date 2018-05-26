
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_records
      DROP COLUMN duration
    `)
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_records
      ADD COLUMN duration INT AFTER end_time
    `)
};
