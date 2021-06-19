
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE tp_history 
      ADD COLUMN new_sell_listings INT NULL AFTER timestamp,
      ADD COLUMN sell_listings_pulled INT NULL AFTER new_sell_listings,
      ADD COLUMN sell_listings_sold INT NULL AFTER sell_listings_pulled,
      ADD COLUMN new_buy_orders INT NULL AFTER sell_listings_sold,
      ADD COLUMN buy_orders_pulled INT NULL AFTER new_buy_orders,
      ADD COLUMN buy_orders_filled INT NULL AFTER buy_orders_pulled;
    `)
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE tp_history 
      DROP COLUMN new_sell_listings,
      DROP COLUMN sell_listings_pulled,
      DROP COLUMN sell_listings_sold,
      DROP COLUMN new_buy_orders,
      DROP COLUMN buy_orders_pulled,
      DROP COLUMN buy_orders_filled;
  `)
};




/*

ALTER TABLE `gw2_tools_dev`.`tp_history` 
ADD COLUMN `new_sell_listings` INT NULL AFTER `timestamp`,
ADD COLUMN `sell_listings_pulled` INT NULL AFTER `new_sell_listings`,
ADD COLUMN `sell_listtings_sold` INT NULL AFTER `sell_listings_pulled`,
ADD COLUMN `new_buy_orders` INT NULL AFTER `sell_listtings_sold`,
ADD COLUMN `buy_orders_pulled` INT NULL AFTER `new_buy_orders`,
ADD COLUMN `buy_orders_filled` INT NULL AFTER `buy_orders_pulled`;


*/