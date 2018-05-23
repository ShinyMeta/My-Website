
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_end_items
      ADD COLUMN binding VARCHAR(20) AFTER quantity
    `)
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_end_items
      DROP COLUMN binding
    `)
};
