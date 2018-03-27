'use strict';

var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    LeagueInfo = mongoose.model('Leagues'),
    async = require('async'),
    response = require('./Response.js');



exports.get_league_info = function (req, res) {
    
    logger.info('Called get_league_info: ' + req.params.league);
    var filter = {
        permalink: req.params.league
    };

    var options = {
        page: 1,
        limit: 100,
        sort: {
            createdAt: -1
        }
    };

    LeagueInfo.paginate(
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