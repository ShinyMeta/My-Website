
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE ref_itemflags (
      itemflag_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      value VARCHAR(45) NOT NULL,
      PRIMARY KEY (itemflag_id),
      UNIQUE INDEX itemflag_id_UNIQUE (itemflag_id ASC));
    `)
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('ref_itemflags')
};
