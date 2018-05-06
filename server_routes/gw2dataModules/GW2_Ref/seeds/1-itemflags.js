
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('itemflags').del()
    .then(function () {
      // Inserts seed entries
      return knex('itemflags').insert([
        {value: 'AccountBindOnUse'},
        {value: 'AccountBound'},
        {value: 'Attuned'},
        {value: 'BulkConsume'},
        {value: 'DeleteWarning'},
        {value: 'HideSuffix'},
        {value: 'Infused'},
        {value: 'MonsterOnly'},
        {value: 'NoMysticForge'},
        {value: 'NoSalvage'},
        {value: 'NoSell'},
        {value: 'NotUpgradeable'},
        {value: 'NoUnderwater'},
        {value: 'SoulbindOnAcquire'},
        {value: 'SoulBindOnUse'},
        {value: 'Tonic'},
        {value: 'Unique'}
      ]);
    });
};
