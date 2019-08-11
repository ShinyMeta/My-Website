
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_records
      ADD COLUMN upgrade1_rarity VARCHAR(45) NULL DEFAULT NULL AFTER strategy_nickname,
      ADD COLUMN upgrade1_element VARCHAR(45) NULL DEFAULT NULL AFTER upgrade1_rarity,
      ADD COLUMN upgrade2_rarity VARCHAR(45) NULL DEFAULT NULL AFTER upgrade1_element,
      ADD COLUMN upgrade2_element VARCHAR(45) NULL DEFAULT NULL AFTER upgrade2_rarity;
    `)
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE gw2data_records
      DROP COLUMN upgrade1_rarity,
      DROP COLUMN upgrade1_element,
      DROP COLUMN upgrade2_rarity,
      DROP COLUMN upgrade2_element;
    `)
};
