'use strict';
const BaseController = require('../Controllers/baseController');
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    CompetitionScrapInfo = mongoose.model('CompetitionScrapInfo'),
    TeamScrapInfo = mongoose.model('TeamScrapInfo'),
    Competition = mongoose.model('Competitions'),
    async = require('async'),
    response = require('./Response.js');


class CompetitionScrapInfoController extends BaseController {

    constructor() {
        super();
    }


    create(data, callback){
        var scrapInfo = new CompetitionScrapInfo(data);
        scrapInfo.save(callback);
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    get_competitions_scrap_info(req, res) {

        var filter = {

        };

        var options = {
            page: 1,
            limit: 100,
            sort: {
                createdAt: -1
            }
        };

        CompetitionScrapInfo.paginate(
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
    save_competition_scrap_info(req, res){
        var competitionsData = req.body;

        var ids = [];
        logger.info('Saving ' + competitionsData.length + ' competition:');
        competitionsData.forEach(competition => {
            ids.push(competition.permalink);
            logger.info(' » (' + competition.country + ') ' + competition.name);
        });
    
        CompetitionScrapInfo.find({
            permalink: {
                $in: ids
            }
        }, function (err, dbCompetitionsToScrap) {
            if (err) {
                logger.error(err);
                return res.json(response.errorResponse(err));
            }
            logger.info('Got ' + dbCompetitionsToScrap.length + ' CompetitionScrapInfo from db');
    
    
            // UPDATE Next Scrap Date
            dbCompetitionsToScrap.forEach(competitionsInfo => {
                var newArray = competitionsData.filter(function (el) {
                    return el.permalink == competitionsInfo.permalink;
                });
    
                if (newArray.length > 0) {
                    competitionsInfo.nextScrapAt = newArray[0].nextScrapAt;
                    logger.info('New scrap date: ' + competitionsInfo.nextScrapAt);
                }
            });
    
            // Gather teams to scrap (in all the leagues)
            var teamsToScrap = [];
            competitionsData.forEach(competitionInfo => {
                if (competitionInfo.standings)
                    competitionInfo.standings.forEach(standing => {
                        var newTeamToScrap = new TeamScrapInfo();
                        newTeamToScrap.countryId = competitionInfo.countryId;
                        // newTeamToScrap.league = competitionInfo.name;
                        // newTeamToScrap.permalink = competitionInfo.permalink + '_' + standing.teamName.replace(/\s+/g, '');
                        // newTeamToScrap.name = standing.teamName;
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
            var result1 = TeamScrapInfo.upsertMany(teamsToScrap, matchFields);
            logger.info('Updated ' + teamsToScrap.length + ' teams to be scraped.');
    
            // Updating League Info Data
            var result2 = Competition.upsertMany(competitionsData, matchFields);
            logger.info('Competition info data succesfully saved for ' + competitionsData.length + ' teams.');
    
    
            var result3 = CompetitionScrapInfo.upsertMany(dbCompetitionsToScrap, matchFields);
            logger.info('Updated CompetitionScrapInfo info with nextScrapAt.');
    
            return res.json(response.successResponse());
        });
    }

}

module.exports = CompetitionScrapInfoController