'use strict';
module.exports = function (app) {

    // League Info
    var leagueInfoController = require('../Controllers/LeagueInfoController');

     
    app.route('/info/leagues/')
        .get(leagueInfoController.get_leagues);

    
    app.route('/info/leagues/:league')
        .get(leagueInfoController.get_league_info);
    
   
    app.route('/info/countries')
        .get(leagueInfoController.get_countries);

     
    app.route('/info/countries/:country')
        .get(leagueInfoController.get_leagues_from_country);
   
        
};