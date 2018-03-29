'use strict';
const BaseController = require('../Controllers/baseController');
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    Competition = mongoose.model('Competitions'),
    CompetitionScrapInfo = mongoose.model('CompetitionScrapInfo'),
    async = require('async'),
    response = require('./Response.js'),
    CompetitionsScrapInfoController = require('../Controllers/CompetitionScrapInfoController'),
    LeaguesToScrap = mongoose.model('LeaguesToScrap'),
    request = require('request');


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


        // LeaguesToScrap.findOne({ permalink: competitionId })
        //     .then(function (data) {

        //         request.get('http://api.football-data.org/v1/competitions/445')
        //             .on('response', function (response) {
        //                 console.log(response);
        //                 console.log(response.statusCode) // 200
        //                 console.log(response.headers['content-type']) // 'image/png'
        //             });


        //         return res.json(response.successResponse(data));
        //     })
        //     .catch(function (err) {
        //         logger.error(err);
        //         return res.status(500).json(response.errorResponse(err));
        //     });

        Competition.findOne({ id: competitionId }, function (err, data) {
            if (err) {
                logger.error(err);
                return res.status(500).json(response.errorResponse(err));
            }

            console.log(data);


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