
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE ref_itemgametypes (
      itemgametype_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      value VARCHAR(45) NULL,
      PRIMARY KEY (itemgametype_id),
      UNIQUE INDEX itemgametype_id_UNIQUE (itemgametype_id ASC));
    `)
};

exports.down = function(knex, Promise) {
  return knex.schema.droptable('ref_itemgametypes')
};
