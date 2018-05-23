//knex file for the item and currency lookup tables database

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: 'mywebserver',
      database: 'gw2_tools_dev'
    },
    // debug: true
  },

  production: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      password: 'mywebserver',
      database: 'gw2_tools_prod'
    }
  }
}
