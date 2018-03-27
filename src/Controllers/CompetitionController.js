'use strict';
const BaseController = require('../Controllers/baseController');
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    Competition = mongoose.model('Competitions'),
    CompetitionScrapInfo = mongoose.model('CompetitionScrapInfo'),
    async = require('async'),
    response = require('./Response.js'),
    CompetitionsScrapInfoController = require('../Controllers/CompetitionScrapInfoController');


class CompetitionController extends BaseController {

    constructor() {
        super();
    }


    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    create_competition(req, res) {
        var providerInfo = req.body.providerInfo;
        if (!providerInfo) {
            logger.error(err);
            return res.status(400).json(response.errorResponse('ProviderInfo is required.'));
        }

        var scrapInfoCtrl = new CompetitionsScrapInfoController();
        var newCompetition = new Competition(req.body);
        newCompetition.lastUpdatedAt = new Date();
        newCompetition.save(function (err, data) {
            if (err) {
                logger.error(err);
                return res.json(response.errorResponse(err));
            }

            // Create the scrap Info
            var providersInfo = [];
            providersInfo.push(providerInfo);
            var newCompetitionScrapInfo = new CompetitionScrapInfo({
                competitionId: data.id,
                countryId: data.countryId,
                providers: providersInfo,
                
                createdAt: new Date(),
                nextScrapAt: new Date(),
            });
            scrapInfoCtrl.create(newCompetitionScrapInfo, function (err, data) {
                if (err) {
                    logger.error(err);
                    return res.json(response.errorResponse(err));
                }
                return res.json(response.successResponse({}));
            });
        });
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    get_competition(req, res) {

        var competitionId = req.params.id;

        Competition.findOne({ id: competitionId }, function (err, data) {
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
    get_competitions(req, res) {

        var filter = {

        };

        var options = {
            page: 1,
            limit: 100,
            sort: {
                createdAt: -1
            }
        };

        Competition.paginate(
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

}

module.exports = CompetitionController