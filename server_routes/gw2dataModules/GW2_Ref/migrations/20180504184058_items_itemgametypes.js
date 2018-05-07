
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE ref_items_itemgametypes (
      pair_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      item_id INT UNSIGNED NOT NULL,
      Itemgametype_id INT UNSIGNED NOT NULL,
      PRIMARY KEY (pair_id),
      UNIQUE INDEX pair_id_UNIQUE (pair_id ASC));
    `)
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('ref_items_itemgametypes')
};
