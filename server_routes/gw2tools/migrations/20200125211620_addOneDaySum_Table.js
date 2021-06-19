
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE tp_one_day_moving_summary (
      id int(11) NOT NULL AUTO_INCREMENT,
      item_id int(11) NOT NULL,
      timestamp timestamp NOT NULL,
      sell_mean int(11) DEFAULT NULL,
      sell_median int(11) DEFAULT NULL,
      sell_quartile_1 int(11) DEFAULT NULL,
      sell_quartile_3 int(11) DEFAULT NULL,
      new_sell_listings int(11) DEFAULT NULL,
      sell_listings_pulled int(11) DEFAULT NULL,
      sell_listings_sold int(11) DEFAULT NULL,
      buy_mean int(11) DEFAULT NULL,
      buy_median int(11) DEFAULT NULL,
      buy_quartile_1 int(11) DEFAULT NULL,
      buy_quartile_3 int(11) DEFAULT NULL,
      new_buy_orders int(11) DEFAULT NULL,
      buy_orders_pulled int(11) DEFAULT NULL,
      buy_orders_filled int(11) DEFAULT NULL,
      PRIMARY KEY (id)
    );
    `)
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tp_one_day_moving_summary')
};