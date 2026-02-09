const AuthMixin = require("../mixins/auth.mixin");
const bcrypt = require("bcryptjs");
const { methods } = require("./users.service");
const { MoleculerClientError } = require("moleculer").Errors;

module.exports = {
    name: "auth",

    mixins: [AuthMixin],

    actions: {
        /**
         * Login - no auth required
         */
        login: {
            rest: {
                method: "POST",
                path: "/login"
            },
            params: {
                registerNumber: "number",
                password: "string"
            },
            async handler(ctx) {
                const { registerNumber, password } = ctx.params;

                // Find user
                const user = await ctx.call("users.getByRegisterNumber", { registerNumber: `${registerNumber}` });

                if (!user) {
                    throw new MoleculerClientError(
                        "Invalid credentials",
                        401,
                        "INVALID_CREDENTIALS"
                    );
                }

                // Verify password
                const isValid = await bcrypt.compare(password, user.password);

                if (!isValid) {
                    throw new MoleculerClientError(
                        "Invalid credentials",
                        401,
                        "INVALID_CREDENTIALS"
                    );
                }

                // Generate token
                const token = this.generateToken({
                    registerNumber: user.registerNumber,
                    role: user.role
                });

                return {
                    token,
                    user: {
                        registerNumber: user.registerNumber,
                        name: user.name,
                        role: user.role
                    }
                };
            }
        }
    }
};