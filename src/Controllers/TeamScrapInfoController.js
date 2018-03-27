'use strict';
const BaseController = require('../Controllers/baseController');
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    TeamScrapInfo = mongoose.model('TeamScrapInfo'),
    async = require('async'),
    response = require('./Response.js');


class TeamsScrapInfoController extends BaseController {

    constructor() {
        super();
    }


    create(data, callback) {
        var scrapInfo = new TeamScrapInfo(data);
        scrapInfo.save(callback);
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    get_teams_scrap_info(req, res) {

        var filter = {

        };

        var options = {
            page: 1,
            limit: 100,
            sort: {
                createdAt: -1
            }
        };

        TeamScrapInfo.paginate(
            filter,
            options,
            function (err, data) {
                if (err) {
                    logger.error(err);
                    return res.status(500).json(response.errorResponse(err));
                }
                return res.json(response.successResponse(data));
            });
    }



    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    save_team_scrap_info(req, res) {
        var teamsData = req.body;

        var ids = [];
        logger.info('Saving ' + teamsData.length + ' teams:');
        teamsData.forEach(team => {
            if (!team.name || !team.country) {
                logger.info(' » A team has no required data! (skip item)');
            } else {
                ids.push(team.permalink);
                logger.info(' » (' + team.country + ') ' + team.name + ' » ' + team.permalink);
            }
        });

        TeamScrapInfo.find({
            permalink: {
                $in: ids
            }
        }, function (err, dbTeamScrapInfo) {
            if (err) {
                logger.error(err);
                return res.status(500).json(response.errorResponse(err));
            }
            logger.info('Got ' + dbTeamScrapInfo.length + ' TeamScrapInfo from db');
            if (dbTeamScrapInfo.length == 0) {
                logger.info('Nothing to do...returning "204 No Content".');
                return res.status(204).json(response.errorResponse('Found no teams to update.'));
            }

            // UPDATE Next Scrap Date
            dbTeamScrapInfo.forEach(teamInfo => {
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
            });

            const matchFields = ['permalink'];

            var result2 = Teams.upsertMany(teamsData, matchFields);
            logger.info('Team info data succesfully saved for ' + teamsData.length + ' teams.');


            var result3 = TeamScrapInfo.upsertMany(dbTeamScrapInfo, matchFields);
            logger.info('Updated TeamScrapInfo info with nextScrapAt.');

            return res.json(response.successResponse());
        });
    }
}

module.exports = TeamsScrapInfoController