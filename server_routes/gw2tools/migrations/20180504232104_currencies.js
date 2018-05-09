
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE ref_currencies (
      currency_id INT UNSIGNED NOT NULL,
      name VARCHAR(100) NOT NULL,
      description VARCHAR(500) NULL,
      currency_order INT NOT NULL,
      icon VARCHAR(200) NOT NULL,
      PRIMARY KEY (currency_id),
      UNIQUE INDEX currency_id_UNIQUE (currency_id ASC));
    `)
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('ref_currencies')
};
