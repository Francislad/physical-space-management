'use strict';

const DbService = require('moleculer-db');
const SqlAdapter = require('moleculer-db-adapter-sequelize');
const Sequelize = require('sequelize');
const AuthMixin = require("../mixins/auth.mixin");
const { MoleculerClientError } = require("moleculer").Errors;

module.exports = {
    name: "checkins",

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
        name: 'checkins',
        define: {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user: Sequelize.INTEGER,
            room: Sequelize.STRING,
            checkedInAt: Sequelize.DATE,
            checkedOutAt: Sequelize.DATE,
        },
        options: {
            underscored: false,
            noSync: true,
            freezeTableName: true
        }
    },

    actions: {
        list: false, // Disable default list action
        create: false,
        update: false,
        remove: false,
        get: false,
        /**
         * Check in to a room - any authenticated user
         */
        checkIn: {
            rest: {
                method: "POST",
                path: "/checkin",
            },
            auth: true,
            roles: ['user'],
            params: {
                room: "string"
            },
            async handler(ctx) {
                const { room } = ctx.params;
                const user = ctx.meta.user;

                const hasCheckedIn = await this.adapter.findOne({
                    where: {
                        user: user.registerNumber,
                        checkedOutAt: null
                    }
                });

                if (!!hasCheckedIn) {
                    throw new MoleculerClientError("User already checked in to a room", 400, "ALREADY_CHECKED_IN");
                }

                const checkedIn = await this.adapter.model.create({
                    user: user.registerNumber,
                    room,
                    checkedInAt: new Date(),
                    checkedOutAt: null
                });
                return checkedIn;
            }
        },
        /**
         * Check out of a room - any authenticated user
         */
        checkOut: {
            rest: {
                method: "POST",
                path: "/checkout",
            },
            auth: true,
            roles: ['user'],
            params: {
                room: "string"
            },
            async handler(ctx) {
                const { room } = ctx.params;
                const user = ctx.meta.user;

                const hasCheckedIn = await this.adapter.findOne({
                    where: {
                        user: user.registerNumber,
                        room,
                        checkedOutAt: null
                    }
                });

                if (!hasCheckedIn) {
                    throw new MoleculerClientError("User not checked in to the room", 400, "NOT_CHECKED_IN");
                }

                const checkedOut = await hasCheckedIn.update({
                    checkedOutAt: new Date()
                });

                return checkedOut;
            }
        },

        /**
         * View all check-ins - admin and managers
         */
        listAll: {
            rest: {
                method: "GET",
                path: "/",
            },
            auth: true,
            roles: ["admin", "user"], // Multiple roles allowed
            async handler(ctx) {
                return await this.adapter.find({
                    include: ["user", "room"]
                });
            }
        },
        listAllCheckinsByRoom: {
            auth: true,
            roles: ["admin", "user"], // Multiple roles allowed
            params: {
                room: "string"
            },
            async handler(ctx) {
                const { room } = ctx.params;
                return await this.adapter.find({query: {
                        room,
                        checkedOutAt: null
                    }});
            }
        },
        getCurrentCheckinByUser: {
            rest: {
                method: "GET",
                path: "/current",
            },
            auth: true,
            roles: ["user"],
            async handler(ctx) {
                const { room } = ctx.params;
                const user = ctx.meta.user;
                return await this.adapter.find({query: {
                        user: user.registerNumber,
                        checkedOutAt: null
                    }});
            }
        }
    }
};