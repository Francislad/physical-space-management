"use strict";

const jwt = require("jsonwebtoken");
const { MoleculerClientError } = require("moleculer").Errors;

/**
 * Authentication & Authorization mixin
 * 
 * This mixin:
 * - Validates JWT tokens
 * - Extracts user information from tokens
 * - Provides role-based authorization
 * - Protects service actions
 * 
 * Usage:
 * Add it to api.service.js
 * mixins: [AuthMixin],
 * 
 * Then, in your service actions, you can specify required roles and config rest:
 * actions: {
 *   myAction: {
        method: "POST",
        path: "/",
        authenticate: true
            },
 *     roles: ["admin"],  // Optional: Requires specific role(s)
 *     handler(ctx) { ... }
 *   }
 * }
 * 
 * Access authenticated user via: ctx.meta.user
 */

module.exports = {
    name: "auth.mixin",

    /**
     * Service metadata
     */
    metadata: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
    },

    /**
     * Methods available to services
     */
    methods: {
        /**
         * Generate JWT token
         * @param {Object} payload - User data to encode
         * @param {String} expiresIn - Token expiration
         * @returns {String} JWT token
         */
        generateToken(payload, expiresIn = null) {
            return jwt.sign(
                payload,
                this.metadata.jwtSecret,
                {
                    expiresIn: expiresIn || this.metadata.jwtExpiresIn,
                }
            );
        },

        /**
         * Verify and decode JWT token
         * @param {String} token - JWT token
         * @returns {Object} Decoded token payload
         */
        verifyToken(token) {
            try {
                return jwt.verify(token, this.metadata.jwtSecret);
            } catch (error) {
                if (error.name === "TokenExpiredError") {
                    throw new MoleculerClientError(
                        "Token has expired",
                        401,
                        "TOKEN_EXPIRED"
                    );
                } else if (error.name === "JsonWebTokenError") {
                    throw new MoleculerClientError(
                        "Invalid token",
                        401,
                        "INVALID_TOKEN"
                    );
                }
                throw new MoleculerClientError(
                    "Authentication failed",
                    401,
                    "AUTH_FAILED"
                );
            }
        },

        /**
         * Extract token from Authorization header
         * @param {String} authHeader - Authorization header value
         * @returns {String|null} Token or null
         */
        extractToken(authHeader) {
            if (!authHeader) {
                return null;
            }

            // Support both "Bearer <token>" and just "<token>"
            if (authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }

            return authHeader;
        },

        /**
         * Check if user has required role(s)
         * @param {Object} user - User object
         * @param {String|Array} requiredRoles - Required role(s)
         * @returns {Boolean}
         */
        hasRole(user, requiredRoles) {
            if (!user || !user.role) {
                return false;
            }

            // Convert to array if single role provided
            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

            return roles.includes(user.role);
        },

        /**
         * Authorize user based on roles
         * @param {Context} ctx - Moleculer context
         * @param {String|Array} requiredRoles - Required role(s)
         */
        authorize(ctx, requiredRoles) {
            if (!ctx.meta.user) {
                throw new MoleculerClientError(
                    "User not authenticated",
                    401,
                    "NOT_AUTHENTICATED"
                );
            }

            if (!this.hasRole(ctx.meta.user, requiredRoles)) {
                throw new MoleculerClientError(
                    "Insufficient permissions",
                    403,
                    "FORBIDDEN",
                    {
                        required: requiredRoles,
                        current: ctx.meta.user.role
                    }
                );
            }
        },
    },


    /**
 * Service hooks
 */
    hooks: {
        before: {
            /**
             * Global before hook to check authentication
             * Runs before every action in services using this mixin
             */
            "*": async function authenticate(ctx) {
                //console.log('GLOBAL AUTH HOOK');
                const action = ctx.action;
                // Skip authentication if action doesn't require it
                if (!action.auth) {
                    return;
                }

                if (!!ctx.meta.user) {
                    // User already authenticated by a previous hook or action
                    return;
                }

                // Read the token from header
                const authHeader = ctx.meta.authHeader;
                
                if (!authHeader) {
                    throw new MoleculerClientError(
                        "No authorization token provided",
                        401,
                        "NO_TOKEN"
                    );
                }

                const token = this.extractToken(authHeader);

                if (!token) {
                    throw new MoleculerClientError(
                        "Invalid authorization header format",
                        401,
                        "INVALID_HEADER"
                    );
                }

                // Verify and decode token
                // And then store user in context metadata for access in actions
                ctx.meta.user = this.verifyToken(token);

                // Optionally: Verify user still exists in database
                // This is useful if you want to invalidate tokens when user is deleted
                if (ctx.meta.user.id) {
                    const user = await ctx.call("users.get", { id: ctx.meta.user.id });

                    if (!user) {
                        throw new MoleculerClientError(
                            "User not found",
                            401,
                            "USER_NOT_FOUND"
                        );
                    }

                    ctx.meta.user = user;
                }


                // Check role-based authorization if specified
                if (action.roles && action.roles.length > 0) {
                    this.authorize(ctx, action.roles);
                }

                this.logger.debug(`User authenticated: ${ctx.meta.user.id} (${ctx.meta.user.role})`);
            }
        }
    }
};