
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE items
      MODIFY type ENUM('Armor', 'Back', 'Bag', 'Consumable', 'Container', 'CraftingMaterial', 'Gathering', 'Gizmo', 'Key', 'MiniPet', 'Tool', 'Trait', 'Trinket', 'Trophy', 'UpgradeComponent', 'Weapon') NULL
    `)
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE items
      MODIFY type ENUM('Armor', 'Back', 'Bag', 'Consumable', 'Container', 'CraftingMaterial', 'Gathering', 'Gizmo', 'MiniPet', 'Tool', 'Trait', 'Trinket', 'Trophy', 'UpgradeComponent', 'Weapon') NULL
    `)
};
