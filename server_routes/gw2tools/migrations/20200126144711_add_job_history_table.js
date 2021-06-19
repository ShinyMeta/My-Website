
exports.up = function(knex, Promise) {
  return knex.raw(`
    CREATE TABLE job_history (
      id INT NOT NULL,
      job_name VARCHAR(45) NULL,
      timestamp TIMESTAMP NULL,
    PRIMARY KEY (id));
    `)
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('job_history')
};

/*
CREATE TABLE `gw2_tools_dev`.`job_history` (
  `id` INT NOT NULL,
  `job_name` VARCHAR(45) NULL,
  `timestamp` TIMESTAMP NULL,
  PRIMARY KEY (`id`));
*/