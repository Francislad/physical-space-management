'use strict';

const DbService = require('moleculer-db');
const SqlAdapter = require('moleculer-db-adapter-sequelize');
const Sequelize = require('sequelize');
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerClientError } = require("moleculer").Errors;

module.exports = {
    name: "rooms",

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
        name: 'rooms',
        define: {
            name: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            capacity: Sequelize.INTEGER,
        },
        options: {
            underscored: false,
            noSync: true,
            freezeTableName: true
        }
    },

    actions: {
        get: false, // Disable default "get" action
        create: false,
        update: false,
        remove: false,
        /**
         * Get room details - requires authentication
         */
        getRoom: {
            rest: {
                method: "GET",
                path: "/:name",
            },
            auth: true,
            params: {
                name: 'string',
            },
            async handler(ctx) {
                const { name } = ctx.params;
                const room = await this.adapter.findOne({ where: { name } });
                const checkins = await ctx.call("checkins.listAllCheckinsByRoom", { room: name });

                return {
                    ...room.dataValues,
                    currentOccupancy: room.capacity - checkins.length
                };
            }
        },
        /**
         * List all rooms - requires authentication
         */
        list: {
            rest: {
                method: "GET",
                path: "/",
            },
            auth: true,
            async handler(ctx) {
                const rooms = await this.adapter.find();
                const roomsWithOccupancy = await Promise.all(rooms.map(async (room) => {
                    const checkins = await ctx.call("checkins.listAllCheckinsByRoom", { room: room.name });

                    return {
                        ...room.dataValues,
                        currentOccupancy: room.capacity - checkins.length
                    };
                }));
                return roomsWithOccupancy;
            }
        },
    }
};