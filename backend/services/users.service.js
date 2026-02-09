'use strict';

const DbService = require('moleculer-db');
const SqlAdapter = require('moleculer-db-adapter-sequelize');
const Sequelize = require('sequelize');
const bcrypt = require("bcryptjs");
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerClientError } = require("moleculer").Errors;

module.exports = {
  name: 'users',
  mixins: [DbService, AuthMixin],
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
    get: false, // Disable default "get" action
    remove: false,
    update: false,

    getByRegisterNumber: {
      rest: {
        method: "GET",
        path: "/:registerNumber",
      },
      params: {
        registerNumber: 'string',
      },
      async handler(ctx) {
        const { registerNumber } = ctx.params;
        const user = await this.adapter.findOne({ where: { registerNumber } });

        if (!user) {
          throw new MoleculerClientError("User not found", 404, "USER_NOT_FOUND");
        }

        return user;
      }
    },
    /**
     * Create new user
     */
    create: {
      rest: {
        method: "POST",
        path: "/",
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
    /**
     * List all users
     */
    list: {
      rest: {
        method: "GET",
        path: "/",
      },
      auth: true,
      roles: ["admin"],
      async handler(ctx) {
        const users = await this.adapter.find();
        return users.map(user => {
          const { password: _, ...userWithoutPassword } = user.toJSON();
          return userWithoutPassword;
        });
      }
    },

    /**
     * Update user
     */
    updateUser: {
      rest: {
        method: "PUT",
        path: "/",
      },
      auth: true,
      roles: ["admin"],
      params: {
        registerNumber: "number",
        password: { type: "string", optional: true },
        name: { type: "string", optional: true }
      },
      async handler(ctx) {
        const { registerNumber, ...updateData } = ctx.params;

        const user = await this.adapter.findOne({ where: { registerNumber } });

        if (!user) {
          throw new MoleculerClientError("User not found", 404, "USER_NOT_FOUND");
        }

        await user.update({registerNumber, ...updateData});

        const { password: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
      }
    },
    /**
     * Delete user
     */
    delete: {
      rest: {
        method: "DELETE",
        path: "/",
      },
      auth: true,
      roles: ["admin"],
      params: {
        registerNumber: "number"
      },
      async handler(ctx) {
        const user = await this.adapter.findOne({ where: { registerNumber: ctx.params.registerNumber } });

        if (!user) {
          throw new MoleculerClientError("User not found", 404, "USER_NOT_FOUND");
        }

        // Prevent deleting admin users
        if (user.role === "admin") {
          throw new MoleculerClientError(
            "Cannot delete admin users",
            403,
            "CANNOT_DELETE_ADMIN"
          );
        }

        await user.destroy();
        return { success: true };
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
