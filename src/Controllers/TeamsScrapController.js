'use strict';

var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    Teams = mongoose.model('Teams'),
    TeamsToScrap = mongoose.model('TeamsToScrap'),
    async = require('async'),
    response = require('./Response.js');



exports.get_pending_teams_to_scrap = function (req, res) {

    var requestBody = req.body;

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

    if(requestBody)
    {
        logger.debug('Aplying custom parameters');
        //
        // page:
        // pageSize:
        // 
        //
        if(requestBody.page){
            options.page = requestBody.page;
            logger.debug('Aplying custom page: ' + requestBody.page);
        }
        if(requestBody.pageSize){
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
                return res.status(500).json(response.errorResponse(err));
            }
            return res.json(response.successResponse(data));
        });
};

exports.save_team_scrap_info = function (req, res) {

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

    TeamsToScrap.find({
        permalink: {
            $in: ids
        }
    }, function (err, dbTeamsToScrap) {
        if (err) {
            logger.error(err);
            return res.status(500).json(response.errorResponse(err));
        }
        logger.info('Got ' + dbTeamsToScrap.length + ' TeamsToScrap from db');
        if (dbTeamsToScrap.length == 0) {
            logger.info('Nothing to do...returning "204 No Content".');
            return res.status(204).json(response.errorResponse('Found no teams to update.'));
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
                else{
                    var nextScrapDateDefault = new Date();
                    teamInfo.nextScrapAt = nextScrapDateDefault;
                    logger.console.warn('The scrap date received is null, going to set next scrap date to: ' + nextScrapDateDefault);
                }
            }
        });

        const matchFields = ['permalink'];

        var result2 = Teams.upsertMany(teamsData, matchFields);
        logger.info('Team info data succesfully saved for ' + teamsData.length + ' teams.');


        var result3 = TeamsToScrap.upsertMany(dbTeamsToScrap, matchFields);
        logger.info('Updated TeamsToScrap info with nextScrapAt.');

        return res.json(response.successResponse());
    });
};

exports.create_team_to_scrap = function (req, res) {
    var newTeamToScrap = new TeamsToScrap(req.body);
    newTeamToScrap.save(function (err, data) {
        if (err) {
            logger.error(err);
            res.send(err);
        }
        res.json(response.successResponse(data));
    });
};