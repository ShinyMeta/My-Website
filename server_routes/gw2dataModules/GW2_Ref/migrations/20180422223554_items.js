
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE items (
      item_id INT UNSIGNED NOT NULL,
      chat_link VARCHAR(45) NOT NULL,
      name VARCHAR(200) NULL,
      icon VARCHAR(200) NULL,
      description VARCHAR(500) NULL,
      type ENUM('Armor', 'Back', 'Bag', 'Consumable', 'Container', 'CraftingMaterial', 'Gathering', 'Gizmo', 'MiniPet', 'Tool', 'Trait', 'Trinket', 'Trophy', 'UpgradeComponent', 'Weapon') NULL,
      rarity ENUM('Junk', 'Basic', 'Fine', 'Masterwork', 'Rare', 'Exotic', 'Ascended', 'Legendary') NULL,
      level INT NULL,
      vendor_value INT NULL,
      default_skin VARCHAR(100) NULL,
      details JSON NULL,
      PRIMARY KEY (item_id),
      UNIQUE INDEX item_id_UNIQUE (item_id ASC));
    `)
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("items")
};
