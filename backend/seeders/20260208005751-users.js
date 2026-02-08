'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [
      {
        registerNumber: 0,
        name: 'admin',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        registerNumber: 1,
        name: 'student1',
        password: 'student123',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        registerNumber: 2,
        name: 'student2',
        password: 'student123',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        registerNumber: 3,
        name: 'student3',
        password: 'student123',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        registerNumber: 4,
        name: 'student4',
        password: 'student123',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  },
};
