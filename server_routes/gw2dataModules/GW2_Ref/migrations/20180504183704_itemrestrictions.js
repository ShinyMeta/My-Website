
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE ref_itemrestrictions (
      itemrestriction_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      value VARCHAR(45) NULL,
      PRIMARY KEY (itemrestriction_id),
      UNIQUE INDEX iditemrestrictions_UNIQUE (itemrestriction_id ASC));
    `)
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('ref_itemrestrictions')
};
