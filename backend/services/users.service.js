'use strict';

const DbService = require('moleculer-db');
const SqlAdapter = require('moleculer-db-adapter-sequelize');
const Sequelize = require('sequelize');
const bcrypt = require("bcryptjs");

module.exports = {
  name: 'users',
  mixins: [DbService],
  adapter: new SqlAdapter(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      port: process.env.DB_PORT,
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
  },

  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    getByRegisterNumber: {
      params: {
        registerNumber: 'number',
      },
      async handler(ctx) {
        const { registerNumber } = ctx.params;
        return this.adapter.findOne({ where: { registerNumber } });
      }
    },
    /**
     * Create new user
     */
    create: {
			rest: {
				method: "POST",
				path: "/",
        authenticate: true
			},
      auth: true,
      roles: ["admin"], // Only admins can create users
      params: {
        registerNumber: "number",
        password: "string",
        name: "string"
      },
      async handler(ctx) {
        const { registerNumber, password, name } = ctx.params;

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        const user = await this.adapter.insert({
          registerNumber,
          password: password_hash,
          name,
          role: "user" // New users are always regular users
        });

        // Don't return password hash
        const { password_hash: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
      }
    },
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
  created() {

  },

  /**
   * Service started lifecycle event handler
   */
  async started() {
    this.adapter.db.authenticate()
      .then(() => {
        return this.adapter.find();
      });
  },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {

  }
};
