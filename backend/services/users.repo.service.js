'use strict';

const DbService = require('moleculer-db');
const SqlAdapter = require('moleculer-db-adapter-sequelize');
const Sequelize = require('sequelize');

module.exports = {
  name: 'users-repo',
  mixins: [DbService],
  adapter: new SqlAdapter(
    'dbDatabase',
    'dbUser',
    'dbPassword',
    {
      host: 'localhost',
      dialect: 'postgres',
      port: 5432,
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
      noSync: true
    }
  ),
  model: {
    name: 'users',
    define: {
      registerNumber: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      name: Sequelize.STRING,
      password: Sequelize.STRING,
      role: Sequelize.STRING,
    },
    options: {
      underscored: false,
      noSync: true,
      freezeTableName: true
    }
  },

  hooks: {},

  /**
   * Settings
   */
  settings: {
    logLevel: 'debug'// log level for the actions of this service
  },

  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {

    getByUsername: {
      params: {
        username: 'string',
      },
      async handler (ctx) {
        const { username } = ctx.params;
        return this.adapter.findOne({ where: { username } });
      }
    }
  },

  /**
   * Events
   */
  events: {

  },

  /**
   * Methods
   */
  methods: {

  },

  /**
   * Service created lifecycle event handler
   */
  created () {

  },

  /**
   * Service started lifecycle event handler
   */
  async started () {
    this.adapter.db.authenticate()
      .then(() => {
        return this.adapter.find();
      });
  },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped () {

  }
};
