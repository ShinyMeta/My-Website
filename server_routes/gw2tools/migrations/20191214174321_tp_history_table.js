exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE tp_history (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      item_id int(11) NOT NULL,
      sell_price int(11) DEFAULT NULL,
      sell_qty int(11) DEFAULT NULL,
      buy_qty int(11) DEFAULT NULL,
      buy_price int(11) DEFAULT NULL,
      timestamp timestamp NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY id_UNIQUE (id)
    );
    `)
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tp_history')
};