'use strict';
const settings = require('../settings');
const TeamScrapInfoController = require('../Controllers/TeamScrapInfoController')
const CompetitionScrapInfoController = require('../Controllers/CompetitionScrapInfoController')
const GameScrapInfoController = require('../Controllers/GamesScrapInfoController')

module.exports = function (app) {

    let teamScrapInfoCtrl = new TeamScrapInfoController();
    let competitionScrapInfoCtrl = new CompetitionScrapInfoController();
    let gameScrapInfoCtrl = new GameScrapInfoController();


    /**
     * Competitions
     */
    app.route(`/${settings.api.apiBasePath}/${settings.api.routes.competitionsScrapInfo.routePrefix}`)
        .get(competitionScrapInfoCtrl.get_competitions_scrap_info)
        .post(competitionScrapInfoCtrl.save_competition_scrap_info);

  
    /**
     * Teams
     */
    app.route(`/${settings.api.apiBasePath}/${settings.api.routes.teamsScrapInfo.routePrefix}`)
        .get(teamScrapInfoCtrl.get_teams_scrap_info)
        .post(teamScrapInfoCtrl.save_team_scrap_info);

    /**
     * Games
     */
    app.route(`/${settings.api.apiBasePath}/${settings.api.routes.gamesScrapInfo.routePrefix}`)
        .get(gameScrapInfoCtrl.get_games_scrap_info)
};