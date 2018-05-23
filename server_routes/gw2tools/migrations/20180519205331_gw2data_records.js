
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE gw2data_records (
    record_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    status ENUM('running', 'stopped', 'saved', 'cancelled') NOT NULL,
    start_time TIMESTAMP(0) NULL,
    end_time TIMESTAMP(0) NULL,
    duration TIME(0) NULL,
    method_type VARCHAR(45) NULL,
    key_element VARCHAR(100) NULL,
    map VARCHAR(45) NULL,
    strategy_nickname VARCHAR(45) NULL,
    character_name VARCHAR(45) NOT NULL,
    character_class VARCHAR(45) NOT NULL,
    character_level INT NOT NULL,
    green_salvage VARCHAR(45) NULL,
    yellow_salvage VARCHAR(45) NULL,
    magic_find VARCHAR(45) NULL,
    PRIMARY KEY (record_id),
    UNIQUE INDEX record_id_UNIQUE (record_id ASC),
    INDEX user_id_idx (user_id ASC),
    CONSTRAINT user_id
      FOREIGN KEY (user_id)
      REFERENCES user_account_info (user_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION);

  `)
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('gw2data_records')
};
