'use strict';
const settings = require('../settings');
const LeaguesController = require('../Controllers/leaguesController')

module.exports = function (app) {
    var leaguesRoutePrefix = 'leagues';
    let leaguesCtrl = new LeaguesController();


    /**
     * @swagger
     * /leagues:
     *   get:
     *     tags:
     *       - "Leagues"
     *     description: Returns a list of leagues.
     *     parameters:
     *       - name: 
     *         type: object
     *         in: body
     *         required: false
     *         description: Request object.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: List of leagues.
     * 
     */
    app.route(`/${settings.api.apiBasePath}/${leaguesRoutePrefix}`)
        .get(leaguesCtrl.get_leagues);


    /**
     * @swagger
     * /leagues/{permalink}:
     *   get:
     *     tags:
     *       - "Leagues"
     *     description: Returns league information.
     *     parameters:
     *       - name: permalink
     *         type: string
     *         in: path
     *         required: true
     *         description: League permalink.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: League Information
     * 
     */
    app.route(`/${settings.api.apiBasePath}/${leaguesRoutePrefix}/:permalink`)
        .get(leaguesCtrl.get_league);



    /**
     * @swagger
     * /leagues/scrap:
     *   post:
     *     tags:
     *       - "Leagues"
     *     description: Saves League scraped information for a list of leagues.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: result
     *         schema:
     *           type: object
     */
    app.route(`/${settings.api.apiBasePath}/${leaguesRoutePrefix}/scrap`)
    .post(leaguesCtrl.save_league_scrap_info);


    /**
     * @swagger
     * /leagues/scrap/pending:
     *   get:
     *     tags:
     *       - "Leagues"
     *     description: Returns a list of leagues that are pending to be scraped.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: leagues
     *         schema:
     *           type: array
     *   post:
     *     tags:
     *       - "Leagues"
     *     description: Create or update a pending league to be scraped.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: result
     *         schema:
     *           type: object
     */
    app.route(`/${settings.api.apiBasePath}/${leaguesRoutePrefix}/scrap/pending`)
        .get(leaguesCtrl.get_pending_leagues_to_scrap)
        .post(leaguesCtrl.create_league_to_scrap);


    


    /**
     * @swagger
     * /leagues/scrap/reset:
     *   post:
     *     tags:
     *       - "Leagues"
     *     description: Resets all leagues, puting them all pending to be scraped.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: result
     *         schema:
     *           type: object
     */
    app.route(`/${settings.api.apiBasePath}/${leaguesRoutePrefix}/scrap/reset`)
        .post(leaguesCtrl.reset_leagues_to_scrap);


};