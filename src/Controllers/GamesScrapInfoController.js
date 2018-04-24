'use strict';
const BaseController = require('../Controllers/baseController');
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    // CompetitionScrapInfo = mongoose.model('CompetitionScrapInfo'),
    TeamScrapInfo = mongoose.model('TeamScrapInfo'),
    // Competition = mongoose.model('Competitions'),
    async = require('async'),
    response = require('./Response.js');


class GameScrapInfoController extends BaseController {

    constructor() {
        super();
    }


    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    get_games_scrap_info(req, res) {
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



        TeamScrapInfo.paginate(
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
    save_game_scrap_info(req, res){
       
    }

}

module.exports = GameScrapInfoController