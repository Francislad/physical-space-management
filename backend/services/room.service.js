const AuthMixin = require("../mixins/auth.mixin");

module.exports = {
    name: "rooms",
    
    mixins: [AuthMixin],

    actions: {
        /**
         * List all rooms - requires authentication
         */
        list: {
            auth: true, // Requires valid JWT token
            async handler(ctx) {
                // ctx.meta.user is automatically populated
                this.logger.info(`User ${ctx.meta.user.id} listing rooms`);
                
                return await this.models.Room.findAll();
            }
        },

        /**
         * Get room details - requires authentication
         */
        get: {
            auth: true,
            params: {
                id: "number"
            },
            async handler(ctx) {
                return await this.models.Room.findByPk(ctx.params.id);
            }
        }
    }
};