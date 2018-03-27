const BaseController = require('../Controllers/baseController')
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    LeagueInfo = mongoose.model('Leagues'),
    LeaguesToScrap = mongoose.model('LeaguesToScrap'),
    TeamsToScrap = mongoose.model('TeamsToScrap'),
    async = require('async'),
    responseModel = require('./Response.js');

class LeaguesController extends BaseController {

    constructor() {
        super();
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    get_leagues(req, res) {

        var filter = {

        };

        var options = {
            page: 1,
            limit: 100,
            sort: {
                createdAt: -1
            }
        };

        LeagueInfo
            .paginate(filter, options)
            .then(result => {
                return res.json(responseModel.successResponse(result));
            })
            .catch(error => {
                logger.error(error);
                return res.json(responseModel.errorResponse(error));
            });
    }


    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    get_league(req, res) {

        var filter = {
            permalink: req.params.permalink
        };

        var options = {
            page: 1,
            limit: 100,
            sort: {
                createdAt: -1
            }
        };

        LeagueInfo
            .paginate(filter, options)
            .then(result => {
                if (result.total == 0)
                    return res.json(responseModel.successResponse(null));
                else
                    return res.json(responseModel.successResponse(result.docs[0]));
            })
            .catch(error => {
                logger.error(error);
                return res.json(responseModel.errorResponse(error));
            });
    }


    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    get_pending_leagues_to_scrap(req, res) {

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
                    return res.json(responseModel.errorResponse(err));
                }
                return res.json(responseModel.successResponse(data));
            });
    };



    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    reset_leagues_to_scrap(req, res) {

        var now = new Date();
        LeaguesToScrap.update({ sport: 'football' }, { nextScrapAt: now }, { multi: true },
            function (err, num) {
                if (err) {
                    logger.error(err);
                    return res.json(responseModel.errorResponse(err));
                }
                logger.info('Reset Next Scrap Date for ' + num + ' football leagues.');
                return res.json(responseModel.successResponse());
            });
    }


    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    create_league_to_scrap(req, res) {
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
                return res.json(responseModel.errorResponse(err));
            }
            logger.info('League to scrap succesfully saved: ' + leagueInfo.name);
            return res.json(responseModel.successResponse(doc));
        });
    }


    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    save_league_scrap_info(req, res) {
        var leaguesData = req.body;

        var ids = [];
        logger.info('(new) Saving ' + leaguesData.length + ' leagues:');
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
                return res.json(responseModel.errorResponse(err));
            }
            logger.info('Got ' + dbLeaguesToScrap.length + ' LeaguesToScrap from db');


            // UPDATE Next Scrap Date
            dbLeaguesToScrap.forEach(leagueInfo => {
                var newArray = leaguesData.filter(function (el) {
                    return el.permalink == leagueInfo.permalink;
                });

                if (newArray.length > 0) {
                    leagueInfo.nextScrapAt = newArray[0].nextScrapAt;
                    leagueInfo.nextPreviewScrapAt = newArray[0].nextPreviewScrapAt;
                    logger.info('New scrap date: ' + leagueInfo.nextScrapAt);
                }
            });

            logger.debug('Before update info in leagues to scrap.');

            // Gather teams to scrap (in all the leagues)
            try {

                var teamsToScrap = [];
                leaguesData.forEach(leagueInfo => {
                    var leagueTeams = [];

                    if (leagueInfo.standings) {
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

                            leagueTeams.push({
                                name: newTeamToScrap.name,
                                permalink: newTeamToScrap.permalink
                            });

                            teamsToScrap.push(newTeamToScrap);
                            logger.info(' » Set team ' + newTeamToScrap.name + ' (' + newTeamToScrap.league + ' - ' + newTeamToScrap.country + ') to be scraped.');
                        });

                        leagueInfo.teams = leagueTeams;
                    }
                });
                leaguesData.forEach(leagueInfo => {

                    if (leagueInfo.teams && leagueInfo.teams.length > 0)
                        logger.debug('[# Teams] ' + leagueInfo.teams.length);
                    else
                        logger.debug('[# Teams] ' + 0);
                });


                //Fields to match on for leagues upsert condition
                const matchFields = ['permalink'];

                logger.debug('Before update teams to scrap.');

                //Perform bulk operation
                var result1 = TeamsToScrap.upsertMany(teamsToScrap, matchFields);
                logger.info('Updated ' + teamsToScrap.length + ' teams to be scraped.');

                // Updating League Info Data
                var result2 = LeagueInfo.upsertMany(leaguesData, matchFields);
                logger.info('League info data succesfully saved for ' + leaguesData.length + ' teams.');


                var result3 = LeaguesToScrap.upsertMany(dbLeaguesToScrap, matchFields);
                logger.info('Updated LeaguesToScrap info with nextScrapAt.');

                return res.json(responseModel.successResponse());
            } catch (err) { logger.error(err); return res.json(responseModel.errorResponse(err)); }
        });
    }

}

module.exports = LeaguesController