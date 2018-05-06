
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE items_itemrestrictions (
      pair_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      item_id INT NOT NULL,
      itemrestriction_id INT NOT NULL,
      PRIMARY KEY (pair_id),
      UNIQUE INDEX pair_id_UNIQUE (pair_id ASC));
    `)
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('items_itemrestrictions')
};
