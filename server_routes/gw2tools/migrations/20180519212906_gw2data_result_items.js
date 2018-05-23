
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE gw2data_result_items (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      record_id INT UNSIGNED NOT NULL,
      item_id INT UNSIGNED NOT NULL,
      quantity INT NOT NULL,
      PRIMARY KEY (id),
      UNIQUE INDEX id_UNIQUE (id ASC),
      CONSTRAINT result_items_record_id
        FOREIGN KEY (record_id)
        REFERENCES gw2data_records (record_id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION);
  `)
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('gw2data_result_items')
};
