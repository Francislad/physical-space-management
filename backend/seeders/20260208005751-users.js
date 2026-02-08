'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [
      {
        registerNumber: 0,
        name: 'admin',
        password: '$2a$10$Uo8sV.Nwed.GvcC7n6fWie2g9Fpi0rkEFVyLZGA76VbEBNdSVYs9C',//admin123
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        registerNumber: 1,
        name: 'student1',
        password: '$2a$10$pCQcfG9m2bz.p/.j2e6zgO8F/i9YcP2UKWMuCxQ/7B90JvcbkJPMO',//student123
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        registerNumber: 2,
        name: 'student2',
        password: '$2a$10$pCQcfG9m2bz.p/.j2e6zgO8F/i9YcP2UKWMuCxQ/7B90JvcbkJPMO',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        registerNumber: 3,
        name: 'student3',
        password: '$2a$10$pCQcfG9m2bz.p/.j2e6zgO8F/i9YcP2UKWMuCxQ/7B90JvcbkJPMO',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        registerNumber: 4,
        name: 'student4',
        password: '$2a$10$pCQcfG9m2bz.p/.j2e6zgO8F/i9YcP2UKWMuCxQ/7B90JvcbkJPMO',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  },
};
