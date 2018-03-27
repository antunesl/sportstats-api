'use strict';
const settings = require('../settings');
const CompetitionController = require('../Controllers/CompetitionController')

module.exports = function (app) {
    var competitionsRoutePrefix = 'competitions';
    let competitionsCtrl = new CompetitionController();


    /**
     * swagger
     * /competitions:
     *   get:
     *     tags:
     *       - "Competitions"
     *     description: Returns a list of competitions.
     *
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: List of competitions.
     * 
     */
    app.route(`/${settings.api.apiBasePath}/${competitionsRoutePrefix}`)
        .get(competitionsCtrl.get_competitions);


    /**
     * swagger
     * /competitions/{id}:
     *   get:
     *     tags:
     *       - "Competitions"
     *     description: Returns a competition information.
     *     parameters:
     *       - name: id
     *         type: string
     *         in: path
     *         required: true
     *         description: Competition id.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: Competition Information
     * 
     */
    app.route(`/${settings.api.apiBasePath}/${competitionsRoutePrefix}/:id`)
        .get(competitionsCtrl.get_competition);



    /**
     * swagger
     * /competitions:
     *   post:
     *     tags:
     *       - "Competitions"
     *     description: Creates a competition.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: result
     *         schema:
     *           type: object
     */
    app.route(`/${settings.api.apiBasePath}/${competitionsRoutePrefix}`)
        .post(competitionsCtrl.create_competition);


   


};