
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('ref_itemrestrictions').del()
    .then(function () {
      // Inserts seed entries
      return knex('ref_itemrestrictions').insert([
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
