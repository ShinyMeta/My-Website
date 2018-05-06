
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('itemrestrictions').del()
    .then(function () {
      // Inserts seed entries
      return knex('itemrestrictions').insert([
        {value: 'Asura'},
        {value: 'Charr'},
        {value: 'Human'},
        {value: 'Norn'},
        {value: 'Sylvari'},
        {value: 'Elementalist'},
        {value: 'Engineer'},
        {value: 'Guardian'},
        {value: 'Mesmer'},
        {value: 'Necromancer'},
        {value: 'Ranger'},
        {value: 'Thief'},
        {value: 'Warrior'},
        {value: 'Female'}
      ]);
    });
};
