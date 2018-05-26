
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_records
      MODIFY key_element INT NULL
    `)
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_records
      MODIFY key_element VARCHAR(45) NULL
    `)
};
