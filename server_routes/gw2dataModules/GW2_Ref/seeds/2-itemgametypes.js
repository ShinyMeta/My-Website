
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('ref_itemgametypes').del()
    .then(function () {
      // Inserts seed entries
      return knex('ref_itemgametypes').insert([
        {value: 'Activity'},
        {value: 'Dungeon'},
        {value: 'Pve'},
        {value: 'Pvp'},
        {value: 'PvpLobby'},
        {value: 'Wvw'}
      ]);
    });
};
