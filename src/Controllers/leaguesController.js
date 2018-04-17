const BaseController = require('../Controllers/baseController')
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    LeagueInfo = mongoose.model('Leagues'),
    TeamInfo = mongoose.model('Teams'),
    LeaguesToScrap = mongoose.model('LeaguesToScrap'),
    TeamsToScrap = mongoose.model('TeamsToScrap'),
    async = require('async'),
    responseModel = require('./Response.js'),
    scrapDictionary = require('../scrapDictionary');

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
    get_pending_league_games_to_scrap(req, res) {

        var now = new Date();
        var filter = {
            nextPreviewScrapAt: { "$lte": now }
        };

        LeaguesToScrap.paginate(filter, { limit: 1 })
            .then(function (dbLeagues) {

                var leagues = [];
                var leagueNames = [];

                dbLeagues.docs.forEach(league => {
                    if (!leagueNames.includes(league.name)) {

                        var whoScoredProvider = league.providers.filter(function (el) {
                            return el.name == "WhoScored";
                        });

                        if (whoScoredProvider.length == 0) {
                            logger.info("WhoScored provider info not found in LeagueToScrap !!");
                        }
                        else {
                            leagueNames.push(league.name);
                            leagues.push({ name: league.name, link: whoScoredProvider[0].link });
                        }
                    }
                });


                TeamsToScrap.find({
                    league: { $in: leagueNames }
                })
                    .then(function (dbTeams) {

                        logger.info('Got ' + dbTeams.length + ' teams!');
                        var results = [];


                        leagues.forEach(league => {


                            var teamsToResults = [];
                            var leagueTeams = dbTeams.filter(function (el) {
                                return el.league == league.name;
                            });

                            leagueTeams.forEach(leagueTeam => {

                                var newArray = scrapDictionary.filter(function (el) {
                                    if (leagueTeam.providers.length == 0)
                                        return false;

                                    return el.sofaTeamLink == leagueTeam.providers[0].link;
                                });
                                if (newArray.length > 0) {
                                    teamsToResults.push({
                                        permalink: leagueTeam.permalink,
                                        name: newArray[0].whoTeamName,
                                        link: newArray[0].whoTeamLink,
                                    });

                                }

                            });

                            results.push({
                                league: league.link,
                                teams: teamsToResults
                            });
                        });

                        // Só enviar uma liga!
                        if (results.length > 0)
                            return res.json(responseModel.successResponse(results[0]));
                        else
                            return res.json(responseModel.successResponse(results));
                    })
                    .catch(function (err) {
                        logger.error(err);
                        return res.json(responseModel.errorResponse(err));
                    });



            })
            .catch(function (err) {
                logger.error(err);
                return res.json(responseModel.errorResponse(err));
            });
    }



    save_league_games_to_scrap(req, res) {
        var previews = req.body.docs;

        const matchFields = ['permalink'];
        logger.info(JSON.stringify(previews));

        var ids = [];
        previews.forEach(preview => {
            ids.push(preview.permalink);
        });

        TeamInfo.find({
            permalink: {
                $in: ids
            }
        }, function (err, dbTeams) {
            if (err) {
                logger.error(err);
                return res.status(500).json(responseModel.errorResponse(err));
            }

            logger.info('Found ' + dbTeams.length + ' teams.');

            var updateRows = [];
            dbTeams.forEach(team => {

                if (team.nextGame) {
                    var newArray = previews.filter(function (el) {
                        return el.home == team.permalink;
                    });

                    if (newArray.length > 0) {
                        team.previewLink = newArray[0].link;
                        team.hasPreview = true;

                        team.nextGame.previewLink = newArray[0].link;
                        logger.info(' » Preview link for "' + team.name + '": ' + team.nextGame.previewLink);
                        updateRows.push(team);
                    }
                }
            });

            if (updateRows.length > 0) {
                var result2 = TeamInfo.upsertMany(updateRows, matchFields);
                logger.info('Team info data succesfully saved for ' + updateRows.length + ' teams.');
            }


            logger.info('Going to search TeamsToScrap: ' + JSON.stringify(ids));

            TeamsToScrap.find({ permalink: { $in: ids } })
                .then(function (dbTeams) {

                    var league = '';
                    dbTeams.forEach(element => {
                        league = element.league;
                        element.hasPreview = true;
                        logger.info('Updating "hasPreview » true" for ' + element.name);
                    });

                    var result3 = TeamsToScrap.upsertMany(dbTeams, matchFields);
                    logger.info('Update result: ' + JSON.stringify(result3));


                    if (league) {
                        LeaguesToScrap.find({ permalink: league })
                            .then(function (dbLeagues) {

                                if (dbLeagues.length > 0) {
                                    // Add 1 hour
                                    var nextPreviewDate = new Date();
                                    nextPreviewDate += (1 * 60 * 60 * 1000);
                                    dbLeagues[0].nextPreviewScrapAt = nextPreviewDate;

                                    var upsertQuery = { permalink: league };
                                    LeaguesToScrap.findOneAndUpdate(upsertQuery, dbLeagues[0], { upsert: true }, function (err, doc) {
                                        if (err)
                                            return res.status(500).json(responseModel.errorResponse(err));

                                        logger.info("»» Set the LeagueToScrap '" + league + "' NextPreviewScrapAt to " + nextPreviewDate);

                                        return res.json(responseModel.successResponse());
                                    });
                                }

                                return res.json(responseModel.successResponse());
                            })
                            .catch(function (err) {
                                logger.error(err);
                                return res.status(500).json(responseModel.errorResponse(err));
                            });
                    }
                    else
                        return res.json(responseModel.successResponse());
                })
                .catch(function (err) {
                    logger.error(err);
                    return res.status(500).json(responseModel.errorResponse(err));
                });

            // TeamsToScrap.find({
            //     permalink: {
            //         $in: ids
            //     }
            // }, function (err, dbTeams) {
            //     if (err) {
            //         logger.error(err);
            //         return res.status(500).json(responseModel.errorResponse(err));
            //     }
            //     
            // });
        });
    }




    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    save_league_scrap_info(req, res) {
        var leaguesData = req.body;


        var footballDataDictionary = [{
            permalink: 'England_PremierLeague',
            id: 445,
            link: 'http://api.football-data.org/v1/competitions/445'
        }];

        var ids = [];
        logger.info('(new) Saving ' + leaguesData.length + ' leagues:');
        leaguesData.forEach(league => {
            // var newArray = footballDataDictionary.filter(function (el) {
            //     return el.permalink == league.permalink;
            // });
            // if (newArray.length > 0) {
            //     console.log('Going to call football-data: ' + newArray[0].link);
            //     request
            //         .get(newArray[0].link)
            //         .on('response', function (response) {
            //             console.log(response)
            //         })
            //         .on('error', function (err) {
            //             console.log(err)
            //         });
            // }

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

                            newTeamToScrap.hasPreview = false;
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