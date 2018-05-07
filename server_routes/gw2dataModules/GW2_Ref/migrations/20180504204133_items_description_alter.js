
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE ref_items
      MODIFY description VARCHAR(1000) NULL
    `)
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE ref_items
      MODIFY description VARCHAR(500) NULL
    `)
};
