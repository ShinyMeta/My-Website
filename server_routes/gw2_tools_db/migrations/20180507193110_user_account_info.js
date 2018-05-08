
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE user_account_info (
      user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      username VARCHAR(45) NOT NULL,
      password VARCHAR(45) NOT NULL,
      email VARCHAR(100) NOT NULL,
      apikey VARCHAR(100) NOT NULL,
      PRIMARY KEY (user_id),
      UNIQUE INDEX user_id_UNIQUE (user_id ASC),
      UNIQUE INDEX username_UNIQUE (username ASC),
      UNIQUE INDEX email_UNIQUE (email ASC));
    `)
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user_account_info')
};
