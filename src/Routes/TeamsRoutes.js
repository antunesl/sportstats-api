'use strict';
const settings = require('../settings');
const TeamsController = require('../Controllers/teamsController')

module.exports = function (app) {
    var teamsRoutePrefix = 'teams';
    let teamsCtrl = new TeamsController();


    /**
     * @swagger
     * /teams:
     *   get:
     *     tags:
     *       - "Teams"
     *     description: Returns a list of teams.
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
     *         description: List of teams.
     * 
     */
    app.route(`/${settings.api.apiBasePath}/${teamsRoutePrefix}`)
        .get(teamsCtrl.get_teams);


    /**
     * @swagger
     * /teams/{permalink}:
     *   get:
     *     tags:
     *       - "Teams"
     *     description: Returns team information.
     *     parameters:
     *       - name: permalink
     *         type: string
     *         in: path
     *         required: true
     *         description: Team permalink.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: Team Information
     * 
     */
    app.route(`/${settings.api.apiBasePath}/${teamsRoutePrefix}/:permalink`)
        .get(teamsCtrl.get_team);

    /**
     * @swagger
     * /teams/scrap:
     *   post:
     *     tags:
     *       - "Teams"
     *     description: Saves Team scraped information for a list of teams.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: result
     *         schema:
     *           type: object
     */
    app.route(`/${settings.api.apiBasePath}/${teamsRoutePrefix}/scrap`)
        .post(teamsCtrl.save_team_scrap_info);

    /**
      * @swagger
      * /teams/scrap/pending:
      *   get:
      *     tags:
      *       - "Teams"
      *     description: Returns a list of teams that are pending to be scraped.
      *     produces:
      *      - application/json
      *     responses:
      *       200:
      *         description: teams
      *         schema:
      *           type: array
      */
    app.route(`/${settings.api.apiBasePath}/${teamsRoutePrefix}/scrap/pending`)
        .get(teamsCtrl.get_pending_teams_to_scrap);
     
    app.route(`/${settings.api.apiBasePath}/${teamsRoutePrefix}/games/scrap/pending`)
        .get(teamsCtrl.get_pending_team_games_to_scrap);


    /**
     * @swagger
     * /teams/scrap/reset:
     *   post:
     *     tags:
     *       - "Teams"
     *     description: Resets all teams, puting them all pending to be scraped.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: result
     *         schema:
     *           type: object
     */
    app.route(`/${settings.api.apiBasePath}/${teamsRoutePrefix}/scrap/reset`)
        .post(teamsCtrl.reset_teams_to_scrap);



    /**
     * @swagger
     * /teams/games/scrap/pending:
     *   get:
     *     tags:
     *       - "Teams"
     *     description: Returns a list of games that are pending to be scraped.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: games
     *         schema:
     *           type: array
     */
    app.route(`/${settings.api.apiBasePath}/${teamsRoutePrefix}/games/scrap/pending`)
        .get(teamsCtrl.get_pending_team_games_to_scrap);

    /**
     * @swagger
     * /teams/games/scrap:
     *   post:
     *     tags:
     *       - "Teams"
     *     description: Saves Team game scraped information for a list of teams.
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: result
     *         schema:
     *           type: object
     */
    app.route(`/${settings.api.apiBasePath}/${teamsRoutePrefix}/games/scrap`)
        .post(teamsCtrl.save_team_game_scrap_info);
};