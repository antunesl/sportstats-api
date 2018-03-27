const BaseController = require('../Controllers/baseController')
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),

    TeamInfo = mongoose.model('Teams'),
    TeamsToScrap = mongoose.model('TeamsToScrap'),

    async = require('async'),
    responseModel = require('./Response.js');

class TeamsController extends BaseController {

    constructor() {
        super();
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    get_teams(req, res) {

        var filter = {

        };

        var options = {
            page: 1,
            limit: 100,
            sort: {
                createdAt: -1
            }
        };

        TeamInfo
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
     * @param {*} req Request
     * @param {*} res Response
     */
    get_team(req, res) {

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

        TeamInfo
            .paginate(filter, options)
            .then(result => {
                if (result.total == 0)
                    return res.json(responseModel.successResponse(null));
                else {
                    var doc = responseModel.successResponse(result.docs[0]);

                    var name = 'nextGame';
                    doc.result[name] = {"awayLineup":[{"left":"","name":"Scott Wootton","position":"DC","right":"30.3636px","top":"174.5px"},{"left":"","name":"Scott Wootton","position":"DC","right":"91.0909px","top":"241.591px"},{"left":"","name":"Scott Wootton","position":"DC","right":"91.0909px","top":"174.5px"},{"left":"","name":"Scott Wootton","position":"DC","right":"91.0909px","top":"107.409px"},{"left":"","name":"Scott Wootton","position":"DC","right":"182.182px","top":"308.682px"},{"left":"","name":"Scott Wootton","position":"DC","right":"182.182px","top":"241.591px"},{"left":"","name":"Scott Wootton","position":"DC","right":"182.182px","top":"174.5px"},{"left":"","name":"Scott Wootton","position":"DC","right":"182.182px","top":"107.409px"},{"left":"","name":"Scott Wootton","position":"DC","right":"182.182px","top":"40.3182px"},{"left":"","name":"Scott Wootton","position":"DC","right":"273.273px","top":"208.045px"},{"left":"","name":"Scott Wootton","position":"DC","right":"273.273px","top":"140.955px"}],"awayNews":[{"text":"Blackpool defender Kelvin Mellor missed Saturday's 1-1 draw with Southend and remains a doubt here, meaning Curtis Tilt should continue at centre-back for the hosts."},{"text":"Mark Cullen and Jim McAlister will once again miss out for the away side."}],"awayTeam":"Blackpool","homeLineup":[{"left":"30.3636px","name":"Scott Wootton","position":"DC","right":"","top":"174.5px"},{"left":"91.0909px","name":"Scott Wootton","position":"DC","right":"","top":"107.409px"},{"left":"91.0909px","name":"Scott Wootton","position":"DC","right":"","top":"174.5px"},{"left":"91.0909px","name":"Scott Wootton","position":"DC","right":"","top":"241.591px"},{"left":"182.182px","name":"Scott Wootton","position":"DC","right":"","top":"73.8636px"},{"left":"182.182px","name":"Scott Wootton","position":"DC","right":"","top":"140.955px"},{"left":"182.182px","name":"Scott Wootton","position":"DC","right":"","top":"208.045px"},{"left":"182.182px","name":"Scott Wootton","position":"DC","right":"","top":"275.136px"},{"left":"273.273px","name":"Scott Wootton","position":"DC","right":"","top":"107.409px"},{"left":"273.273px","name":"Scott Wootton","position":"DC","right":"","top":"174.5px"},{"left":"273.273px","name":"Scott Wootton","position":"DC","right":"","top":"241.591px"}],"homeNews":[{"text":"On-loan Middlesborough midfielder Marcus Tavernier remains a doubt for the Dons after missing the win over Bury at the weekend."}],"homeTeam":"Milton Keynes Dons","missingAwayPlayers":[{"name":"Kelvin Mellor","reason":"injured doubtful","status":"Doubtful"},{"name":"Mark Cullen","reason":"injured doubtful","status":"Doubtful"},{"name":"Jim McAlister","reason":"injured doubtful","status":"Doubtful"}],"missingHomePlayers":[{"name":"Alex Gilbey","reason":"injured","status":"Out"},{"name":"Joe Walsh","reason":"injured","status":"Out"},{"name":"Marcus Tavernier","reason":"injured doubtful","status":"Doubtful"}]};

                    return res.json(doc);
                }
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
    get_pending_teams_to_scrap(req, res) {

        var requestBody = req.body;

        var now = new Date();
        var filter = {
            nextScrapAt: { "$lte": now }
        };

        var options = {
            page: 1,
            limit: 1,
            sort: {
                createdAt: -1
            }
        };

        if (requestBody) {
            logger.debug('Aplying custom parameters');
            //
            // page:
            // pageSize:
            // 
            //
            if (requestBody.page) {
                options.page = requestBody.page;
                logger.debug('Aplying custom page: ' + requestBody.page);
            }
            if (requestBody.pageSize) {
                options.limit = requestBody.pageSize;
                logger.debug('Aplying custom pageSize: ' + requestBody.pageSize);
            }
        }

        TeamsToScrap.paginate(
            filter,
            options,
            function (err, data) {
                if (err) {
                    logger.error(err);
                    return res.status(500).json(responseModel.errorResponse(err));
                }
                return res.json(responseModel.successResponse(data));
            });
    }


    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    get_pending_team_games_to_scrap(req, res) {
        var requestBody = req.body;

        var now = new Date();
        var filter = {
            nextGameScrapAt: { "$lte": now }
        };

        var options = {
            page: 1,
            limit: 1,
            sort: {
                createdAt: -1
            }
        };



        TeamsToScrap.paginate(
            filter,
            options,
            function (err, data) {
                if (err) {
                    logger.error(err);
                    return res.status(500).json(responseModel.errorResponse(err));
                }

                var resultObj = {
                    docs: []
                };
                data.docs.forEach(doc => {
                    if (doc.nextGame)
                    resultObj.docs.push({ team: doc.permalink, nextGame: doc.nextGame });
                });
                return res.json(responseModel.successResponse(resultObj));
            });
    }




    /**
    * 
    * @param {*} req 
    * @param {*} res 
    */
    reset_teams_to_scrap(req, res) {

        var now = new Date();
        TeamsToScrap.update({}, { nextScrapAt: now }, { multi: true },
            function (err, num) {
                if (err) {
                    logger.error(err);
                    return res.json(responseModel.errorResponse(err));
                }
                logger.info('Reset Next Scrap Date for ' + num + ' teams.');
                return res.json(responseModel.successResponse());
            });
    }



    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    save_team_scrap_info(req, res) {

        var dicionario = [{
            sofaProviderName: 'SofaScore',
            sofaTeamId: '17',
            sofaTeamName: 'Manchester City',
            sofaTeamLink: 'https://www.sofascore.com/team/football/manchester-city/17',

            whoScoredProviderName: 'WhoScored',
            whoTeamId: '167',
            whoTeamName: 'Manchester City',
            whoTeamLink: 'https://www.whoscored.com/Teams/167/Show/England-Manchester-City',
        },
        {
            sofaProviderName: 'SofaScore',
            sofaTeamId: '48',
            sofaTeamName: 'Everton',
            sofaTeamLink: 'https://www.sofascore.com/team/football/everton/48',

            whoScoredProviderName: 'WhoScored',
            whoTeamId: '34',
            whoTeamName: 'Everton',
            whoTeamLink: 'https://www.whoscored.com/Teams/31/Show/England-Everton',
        },
        {
            sofaProviderName: 'SofaScore',
            sofaTeamId: '29',
            sofaTeamName: 'Stoke City',
            sofaTeamLink: 'https://www.sofascore.com/team/football/stoke-city/29',

            whoScoredProviderName: 'WhoScored',
            whoTeamId: '96',
            whoTeamName: 'Stoke',
            whoTeamLink: 'https://www.whoscored.com/Teams/96/Show/England-Stoke',
        },
        {
            sofaProviderName: 'SofaScore',
            sofaTeamId: '84',
            sofaTeamName: 'Doncaster Rovers',
            sofaTeamLink: 'https://www.sofascore.com/team/football/doncaster-rovers/84',

            whoScoredProviderName: 'WhoScored',
            whoTeamId: '910',
            whoTeamName: 'Doncaster',
            whoTeamLink: 'https://www.whoscored.com/Teams/910/Show/England-Doncaster',
        },
        {
            sofaProviderName: 'SofaScore',
            sofaTeamId: '84',
            sofaTeamName: 'Bradford City',
            sofaTeamLink: 'https://www.sofascore.com/team/football/bradford-city/22',

            whoScoredProviderName: 'WhoScored',
            whoTeamId: '22',
            whoTeamName: 'Bradford',
            whoTeamLink: 'https://www.whoscored.com/Teams/22/Show/England-Bradford',
        },
        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '46',

            sofaTeamName: 'Blackburn Rovers',

            sofaTeamLink: 'https://www.sofascore.com/team/football/blackburn-rovers/46',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '158',

            whoTeamName: 'Blackburn',

            whoTeamLink: 'https://www.whoscored.com/Teams/158/Show/England-Blackburn',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '82',

            sofaTeamName: 'Shrewsbury Town',

            sofaTeamLink: 'https://www.sofascore.com/team/football/shrewsbury-town/82',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '207',

            whoTeamName: 'Shrewsbury',

            whoTeamLink: 'https://www.whoscored.com/Teams/207/Show/England-Shrewsbury',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '49',

            sofaTeamName: 'Wigan',

            sofaTeamLink: 'https://www.sofascore.com/team/football/wigan-athletic/49',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '194',

            whoTeamName: 'Wigan',

            whoTeamLink: 'https://www.whoscored.com/Teams/194/Show/England-Wigan',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '49',

            sofaTeamName: 'Wigan Athletic',

            sofaTeamLink: 'https://www.sofascore.com/team/football/wigan-athletic/49',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '194',

            whoTeamName: 'Wigan',

            whoTeamLink: 'https://www.whoscored.com/Teams/194/Show/England-Wigan',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '13',

            sofaTeamName: 'Rotherham United',

            sofaTeamLink: 'https://www.sofascore.com/team/football/rotherham-united/13',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '210',

            whoTeamName: 'Rotherham',

            whoTeamLink: 'https://www.whoscored.com/Teams/210/Show/England-Rotherham',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '85',

            sofaTeamName: 'Scunthorpe United',

            sofaTeamLink: 'https://www.sofascore.com/team/football/scunthorpe-united/85',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '186',

            whoTeamName: 'Scunthorpe',

            whoTeamLink: 'https://www.whoscored.com/Teams/186/Show/England-Scunthorpe',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '71',

            sofaTeamName: 'Plymouth Argyle',

            sofaTeamLink: 'https://www.sofascore.com/team/football/plymouth-argyle/71',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '212',

            whoTeamName: 'Plymouth',

            whoTeamLink: 'https://www.whoscored.com/Teams/212/Show/England-Plymouth',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '54',

            sofaTeamName: 'Peterborough United',

            sofaTeamLink: 'https://www.sofascore.com/team/football/peterborough-united/54',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '215',

            whoTeamName: 'Peterborough',

            whoTeamLink: 'https://www.whoscored.com/Teams/215/Show/England-Peterborough',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '2',

            sofaTeamName: 'Portsmouth',

            sofaTeamLink: 'https://www.sofascore.com/team/football/portsmouth/2',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '169',

            whoTeamName: 'Portsmouth',

            whoTeamLink: 'https://www.whoscored.com/Teams/169/Show/England-Portsmouth',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '47',

            sofaTeamName: 'Charlton Athletic',

            sofaTeamLink: 'https://www.sofascore.com/team/football/charlton-athletic/47',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '160',

            whoTeamName: 'Charlton',

            whoTeamLink: 'https://www.whoscored.com/Teams/160/Show/England-Charlton',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '76',

            sofaTeamName: 'Bristol Rovers',

            sofaTeamLink: 'https://www.sofascore.com/team/football/bristol-rovers/76',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '185',

            whoTeamName: 'Bristol Rovers',

            whoTeamLink: 'https://www.whoscored.com/Teams/185/Show/England-Bristol-Rovers',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '22',

            sofaTeamName: 'Bradford City',

            sofaTeamLink: 'https://www.sofascore.com/team/football/bradford-city/22',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '22',

            whoTeamName: 'Bradford',

            whoTeamLink: 'https://www.whoscored.com/Teams/22/Show/England-Bradford',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '20',

            sofaTeamName: 'Gillingham',

            sofaTeamLink: 'https://www.sofascore.com/team/football/gillingham/20',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '191',

            whoTeamName: 'Gillingham',

            whoTeamLink: 'https://www.whoscored.com/Teams/191/Show/England-Gillingham',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '99',

            sofaTeamName: 'Southend United',

            sofaTeamLink: 'https://www.sofascore.com/team/football/southend-united/99',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '208',

            whoTeamName: 'Southend',

            whoTeamLink: 'https://www.whoscored.com/Teams/208/Show/England-Southend',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '67',

            sofaTeamName: 'Blackpool',

            sofaTeamLink: 'https://www.sofascore.com/team/football/blackpool/67',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '93',

            whoTeamName: 'Blackpool',

            whoTeamLink: 'https://www.whoscored.com/Teams/93/Show/England-Blackpool',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '95',

            sofaTeamName: 'Oxford United',

            sofaTeamLink: 'https://www.sofascore.com/team/football/oxford-united/95',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '197',

            whoTeamName: 'Oxford',

            whoTeamLink: 'https://www.whoscored.com/Teams/197/Show/England-Oxford',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '26',

            sofaTeamName: 'Walsall',

            sofaTeamLink: 'https://www.sofascore.com/team/football/walsall/26',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '173',

            whoTeamName: 'Walsall',

            whoTeamLink: 'https://www.whoscored.com/Teams/173/Show/England-Walsall',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '84',

            sofaTeamName: 'Doncaster Rovers',

            sofaTeamLink: 'https://www.sofascore.com/team/football/doncaster-rovers/84',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '910',

            whoTeamName: 'Doncaster',

            whoTeamLink: 'https://www.whoscored.com/Teams/910/Show/England-Doncaster',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '23957',

            sofaTeamName: 'AFC Wimbledon',

            sofaTeamLink: 'https://www.sofascore.com/team/football/afc-wimbledon/23957',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '5955',

            whoTeamName: 'AFC Wimbledon',

            whoTeamLink: 'https://www.whoscored.com/Teams/5955/Show/England-AFC-Wimbledon',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '65',

            sofaTeamName: 'Oldham Athletic',

            sofaTeamLink: 'https://www.sofascore.com/team/football/oldham-athletic/65',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '190',

            whoTeamName: 'Oldham',

            whoTeamLink: 'https://www.whoscored.com/Teams/190/Show/England-Oldham',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '23959',

            sofaTeamName: 'Fleetwood Town',

            sofaTeamLink: 'https://www.sofascore.com/team/football/fleetwood-town/23959',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '3936',

            whoTeamName: 'Fleetwood',

            whoTeamLink: 'https://www.whoscored.com/Teams/3936/Show/England-Fleetwood',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '57',

            sofaTeamName: 'Northampton Town',

            sofaTeamLink: 'https://www.sofascore.com/team/football/northampton-town/57',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '316',

            whoTeamName: 'Northampton',

            whoTeamLink: 'https://www.whoscored.com/Teams/316/Show/England-Northampton',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '4',

            sofaTeamName: 'Milton Keynes Dons',

            sofaTeamLink: 'https://www.sofascore.com/team/football/milton-keynes-dons/4',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '28',

            whoTeamName: 'Milton Keynes Dons',

            whoTeamLink: 'https://www.whoscored.com/Teams/28/Show/England-Milton-Keynes-Dons',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '103',

            sofaTeamName: 'Rochdale AFC',

            sofaTeamLink: 'https://www.sofascore.com/team/football/rochdale-afc/103',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '202',

            whoTeamName: 'Rochdale',

            whoTeamLink: 'https://www.whoscored.com/Teams/202/Show/England-Rochdale',

        },

        {

            sofaProviderName: 'SofaScore',

            sofaTeamId: '52',

            sofaTeamName: 'Bury',

            sofaTeamLink: 'https://www.sofascore.com/team/football/bury/52',

            whoScoredProviderName: 'WhoScored',

            whoTeamId: '187',

            whoTeamName: 'Bury',

            whoTeamLink: 'https://www.whoscored.com/Teams/187/Show/England-Bury',

        }
        ];

        var teamsData = req.body;

        var ids = [];
        logger.info('Saving ' + teamsData.length + ' teams:');
        var nextGames = [];
        teamsData.forEach(team => {
            if (!team.name || !team.country) {
                logger.info(' » A team has no required data! (skip item)');
            } else {
                ids.push(team.permalink);
                logger.info(' » (' + team.country + ') ' + team.name + ' » ' + team.permalink);
            }


            // SETTING GAMES TO BE SCRAPED
            if (team.nextGame) {
                // if (!team.nextGame.date || !team.nextGame.homeTeam || !team.nextGame.awayTeam) {
                //     logger.debug(`» ${team.name}: There is no next game required information (date/home/away).`);
                // } else {
                var nextGameDate = new Date(team.nextGame.date);

                var homeTeamArray = dicionario.filter(function (el) {
                    return el.sofaTeamName == team.nextGame.homeTeam;
                });
                var awayTeamArray = dicionario.filter(function (el) {
                    return el.sofaTeamName == team.nextGame.awayTeam;
                });

                logger.debug('Home Maped Team: ' + JSON.stringify(homeTeamArray));
                logger.debug('Away Maped Team: ' + JSON.stringify(awayTeamArray));

                if (homeTeamArray.length > 0 && awayTeamArray.length > 0) {

                    nextGames.push({
                        date: team.nextGame.date,

                        permalink: team.permalink,

                        provider: 'WhoScored',
                        homeTeamLink: homeTeamArray[0].whoTeamLink,
                        homeTeamName: homeTeamArray[0].whoTeamName,

                        awayTeamLink: awayTeamArray[0].whoTeamLink,
                        awayTeamName: awayTeamArray[0].whoTeamName
                    });
                }
                else {
                    logger.debug('Teams no found in dictionary!');
                }
                // }
                // else {

                // }
            }
            else {
                logger.debug(`» ${team.name}: There is no next game defined.`);
            }
        });

        TeamsToScrap.find({
            permalink: {
                $in: ids
            }
        }, function (err, dbTeamsToScrap) {
            if (err) {
                logger.error(err);
                return res.status(500).json(responseModel.errorResponse(err));
            }
            logger.info('Got ' + dbTeamsToScrap.length + ' TeamsToScrap from db');
            if (dbTeamsToScrap.length == 0) {
                logger.info('Nothing to do...returning "204 No Content".');
                return res.status(204).json(responseModel.errorResponse('Found no teams to update.'));
            }

            // UPDATE Next Scrap Date
            dbTeamsToScrap.forEach(teamInfo => {
                var newArray = teamsData.filter(function (el) {
                    return el.permalink == teamInfo.permalink;
                });

                if (newArray.length > 0) {
                    teamInfo.nextScrapAt = newArray[0].nextScrapAt;
                    if (teamInfo.nextScrapAt)
                        logger.info('New scrap date: ' + teamInfo.nextScrapAt);
                    else {
                        var nextScrapDateDefault = new Date();
                        teamInfo.nextScrapAt = nextScrapDateDefault;
                        logger.console.warn('The scrap date received is null, going to set next scrap date to: ' + nextScrapDateDefault);
                    }
                }


                var nextGameArray = nextGames.filter(function (el) {
                    return el.permalink == teamInfo.permalink;
                });

                if (nextGameArray.length > 0) {
                    console.log('1 - NextGameScrapDate for ' + teamInfo.name);
                    var name = 'nextGameScrapAt';
                    teamInfo[name] = new Date();
                    teamInfo.nextGame = {
                        date: nextGameArray[0].date,
                        provider: nextGameArray[0].provider,
                        homeTeamName: nextGameArray[0].homeTeamName,
                        homeTeamLink: nextGameArray[0].homeTeamLink,
                        awayTeamName: nextGameArray[0].awayTeamName,
                        awayTeamLink: nextGameArray[0].awayTeamLink
                    };
                    console.log('2 - NextGameScrapDate for ' + teamInfo.name + ': ' + teamInfo.nextGameScrapAt);
                }
            });

            const matchFields = ['permalink'];


            var result2 = TeamInfo.upsertMany(teamsData, matchFields);
            logger.info('Team info data succesfully saved for ' + teamsData.length + ' teams.');


            var result3 = TeamsToScrap.upsertMany(dbTeamsToScrap, matchFields);
            logger.info('Updated TeamsToScrap info with nextScrapAt.');









            return res.json(responseModel.successResponse());
        });
    }


    save_team_game_scrap_info(req, res) {

    }
}

module.exports = TeamsController