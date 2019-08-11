
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_start_items
      ADD COLUMN upgrades VARCHAR(45) AFTER binding;
    `)
  .then (() => {
    return knex.raw(`
      ALTER TABLE gw2data_end_items
        ADD COLUMN upgrades VARCHAR(45) AFTER binding;
      `)
  })
  .then (() => {
    return knex.raw(`
      ALTER TABLE gw2data_result_items
        ADD COLUMN upgrades VARCHAR(45) AFTER binding;
      `)
  })
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_start_items
      DROP COLUMN upgrades;
    `)
  .then (() => {
    return knex.raw(`
      ALTER TABLE gw2data_end_items
        DROP COLUMN upgrades;
      `)
  })
  .then (() => {
    return knex.raw(`
      ALTER TABLE gw2data_result_items
        DROP COLUMN upgrades;
      `)
  })
};
