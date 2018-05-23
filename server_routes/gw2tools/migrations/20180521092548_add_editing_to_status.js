
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_records
      MODIFY status ENUM('running', 'stopped', 'editing', 'saved', 'cancelled') NOT NULL
    `)
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_records
      MODIFY status ENUM('running', 'stopped', 'saved', 'cancelled') NOT NULL
    `)
};
