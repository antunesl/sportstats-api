'use strict';
const settings = require('../settings');
const AuthController = require('../Controllers/AuthController');
var VerifyToken = require('./VerifyToken');


module.exports = function (app) {
    var authRoutePrefix = 'auth';
    let authCtrl = new AuthController();



    app.route(`/${settings.api.apiBasePath}/${authRoutePrefix}/login`)
        .post(authCtrl.login);

    app.route(`/${settings.api.apiBasePath}/${authRoutePrefix}/register`)
        .post(authCtrl.register);


    /**
     * @swagger
     * /auth/me:
     *   get:
     *     tags:
     *       - "Auth"
     *     description: Returns information about an Api User.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: Api User information.
     *     security:
     *       - api_key: []
     * 
     */
    app.route(`/${settings.api.apiBasePath}/${authRoutePrefix}/me`)
        .get(VerifyToken, authCtrl.me);

};