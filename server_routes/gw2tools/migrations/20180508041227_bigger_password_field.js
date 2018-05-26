
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE user_account_info
      MODIFY password VARCHAR(100) NULL
    `)
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE user_account_info
      MODIFY password VARCHAR(45) NULL
    `)
};
