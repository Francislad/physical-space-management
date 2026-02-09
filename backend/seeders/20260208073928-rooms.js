'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('rooms', [
      {
        name: 'CLA001',
        capacity: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'CLA002',
        capacity: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'LAB001',
        capacity: 75,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'LAB002',
        capacity: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'STU001',
        capacity: 33,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'STU002',
        capacity: 66,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('rooms', null, {});
  }
};
