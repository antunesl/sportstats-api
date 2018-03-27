'use strict';

var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    Leagues = mongoose.model('Leagues'),
    LeaguesToScrap = mongoose.model('LeaguesToScrap'),
    TeamsToScrap = mongoose.model('TeamsToScrap'),
    async = require('async'),
    response = require('./Response.js');



exports.get_pending_leagues_to_scrap = function (req, res) {

    var now = new Date();
    var filter = {
        nextScrapAt: { "$lte": now }
    };

    var options = {
        page: 1,
        limit: 10,
        sort: {
            createdAt: -1
        }
    };

    LeaguesToScrap.paginate(
        filter,
        options,
        function (err, data) {
            if (err) {
                logger.error(err);
                return res.json(response.errorResponse(err));
            }
            return res.json(response.successResponse(data));
        });
};


exports.reset_leagues_to_scrap = function (req, res) {

    var now = new Date();
    LeaguesToScrap.update({ sport: 'football' }, { nextScrapAt: now }, { multi: true },
        function (err, num) {
            if (err) {
                logger.error(err);
                return res.json(response.errorResponse(err));
            }
            logger.info('Reset Next Scrap Date for ' + num + ' football leagues.');
            return res.json(response.successResponse());
        });
};


exports.create_league_to_scrap = function (req, res) {
    var leagueInfo = req.body;

    var query = {
        'permalink': leagueInfo.permalink
    };

    if (!leagueInfo.nextScrapAt)
        leagueInfo.nextScrapAt = new Date();

    if (!leagueInfo.createdAt)
        leagueInfo.createdAt = new Date();

    LeaguesToScrap.findOneAndUpdate(query, leagueInfo, {
        upsert: true
    }, function (err, doc) {
        if (err) {
            logger.error(err);
            return res.json(response.errorResponse(err));
        }
        logger.info('League to scrap succesfully saved: ' + leagueInfo.name);
        return res.json(response.successResponse(doc));
    });
};



exports.save_league_scrap_info = function (req, res) {
    var leaguesData = req.body;

    var ids = [];
    logger.info('Saving ' + leaguesData.length + ' leagues:');
    leaguesData.forEach(league => {
        ids.push(league.permalink);
        logger.info(' » (' + league.country + ') ' + league.name);
    });

    LeaguesToScrap.find({
        permalink: {
            $in: ids
        }
    }, function (err, dbLeaguesToScrap) {
        if (err) {
            logger.error(err);
            return res.json(response.errorResponse(err));
        }
        logger.info('Got ' + dbLeaguesToScrap.length + ' LeaguesToScrap from db');


        // UPDATE Next Scrap Date
        dbLeaguesToScrap.forEach(leagueInfo => {
            var newArray = leaguesData.filter(function (el) {
                return el.permalink == leagueInfo.permalink;
            });

            if (newArray.length > 0) {
                leagueInfo.nextScrapAt = newArray[0].nextScrapAt;
                logger.info('New scrap date: ' + leagueInfo.nextScrapAt);
            }
        });

        // Gather teams to scrap (in all the leagues)
        var teamsToScrap = [];
        leaguesData.forEach(leagueInfo => {
            if (leagueInfo.standings)
                leagueInfo.standings.forEach(standing => {
                    var newTeamToScrap = new TeamsToScrap();
                    newTeamToScrap.country = leagueInfo.country;
                    newTeamToScrap.league = leagueInfo.name;
                    newTeamToScrap.permalink = leagueInfo.permalink + '_' + standing.teamName.replace(/\s+/g, '');
                    newTeamToScrap.name = standing.teamName;
                    newTeamToScrap.providers = [];

                    if (standing.providerInfo)
                        newTeamToScrap.providers.push({
                            name: standing.providerInfo.name,
                            link: standing.providerInfo.link,
                        });

                    teamsToScrap.push(newTeamToScrap);
                    logger.info(' » Set team ' + newTeamToScrap.name + ' (' + newTeamToScrap.league + ' - ' + newTeamToScrap.country + ') to be scraped.');
                });
        });

        //Fields to match on for leagues upsert condition
        const matchFields = ['permalink'];


        //Perform bulk operation
        var result1 = TeamsToScrap.upsertMany(teamsToScrap, matchFields);
        logger.info('Updated ' + teamsToScrap.length + ' teams to be scraped.');

        // Updating League Info Data
        var result2 = Leagues.upsertMany(leaguesData, matchFields);
        logger.info('League info data succesfully saved for ' + leaguesData.length + ' teams.');


        var result3 = LeaguesToScrap.upsertMany(dbLeaguesToScrap, matchFields);
        logger.info('Updated LeaguesToScrap info with nextScrapAt.');

        return res.json(response.successResponse());
    });
};