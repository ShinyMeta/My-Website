
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('itemgametypes').del()
    .then(function () {
      // Inserts seed entries
      return knex('itemgametypes').insert([
        {value: 'Activity'},
        {value: 'Dungeon'},
        {value: 'Pve'},
        {value: 'Pvp'},
        {value: 'PvpLobby'},
        {value: 'Wvw'}
      ]);
    });
};
