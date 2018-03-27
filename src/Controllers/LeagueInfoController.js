'use strict';

var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    LeagueInfo = mongoose.model('Leagues'),
    async = require('async'),
    response = require('./Response.js');


exports.create_league_info = function (req, res) {
    var newLeagueInfo = new LeagueInfo(req.body);
    newLeagueInfo.save(function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(response.errorResponse(err));
        }
        return res.json(response.successResponse(data));
    });
};

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
                return res.status(500).json(response.errorResponse(err));
            }
            return res.json(response.successResponse(data));
        });
};


exports.get_leagues = function (req, res) {

    logger.info('Called get_leagues (max page size: 100)');

    logger.info(response);

    var filter = {
        
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
                return res.status(500).json(response.errorResponse(err));
            }
            return res.json(response.successResponse(data));
        });
};

exports.get_leagues_from_country = function (req, res) {

    logger.info('Called get_leagues_from_country: ' + req.params.country);

    var filter = {
        country: req.params.country
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
                return res.status(500).json(response.errorResponse(err));
            }
            return res.json(response.successResponse(data));
        });
};


exports.get_countries = function (req, res) {

    logger.info('Called get_countries');

    var countries = [
        // { name: 'England', link: '/countries/England' },
        // { name: 'Portugal', link: '/countries/Portugal' },
        // { name: 'Italy', link: '/countries/Italy' },
        // { name: 'France', link: '/countries/France' },
        // { name: 'China', link: '/countries/China' },
        // { name: 'EUA', link: '/countries/EUA' }   
    ];


    var options = {
        page: 1,
        limit: 1000,
        sort: {
            createdAt: -1
        }
    };

    LeagueInfo.paginate(
        {},
        options,
        function (err, leagues) {
            if (err) {
                logger.error(err);
                return res.status(500).json(response.errorResponse(err));
            }

            if (leagues.docs) {
                leagues.docs.forEach(leagueInfo => {
                    var exists = false;
                    for (var i = 0; i < countries.length; i++) {
                        if (countries[i].name === leagueInfo.country) {
                            exists = true;
                            break;
                        }
                    }

                    if (!exists) {
                        countries.push({
                            name: leagueInfo.country,
                            link: '/countries/' + leagueInfo.country
                        });
                    }
                });
            }

            return res.json(response.successResponse(countries));
        });
};
