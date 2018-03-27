const BaseController = require('../Controllers/baseController')
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    Country = mongoose.model('Countries'),
    async = require('async'),
    LeagueInfo = mongoose.model('Leagues'),
    responseModel = require('./Response.js');

class CountriesController extends BaseController {

    constructor() {
        super();
    }


    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    create_country(req, res) {
        var pt = new Country(req.body);

        pt.save(function (err, results) {
            if(err)
                res.status(500).json(err);
            res.json(results);
        });
    }



    get_country2(req, res){
        var countryId = req.params.id;

        Country.findOne({ id: countryId }, function (err, data) {
            if (err) {
                logger.error(err);
                return res.status(500).json(responseModel.errorResponse(err));
            }
            return res.json(responseModel.successResponse(data));
        });
    }

    get_country(req, res){
        var filter = {

        };

        var options = {
            page: 1,
            limit: 100,
            sort: {
                createdAt: -1
            }
        };

        Country.paginate(
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
    get_countries(req, res) {

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
            limit: 100,
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
                    return res.status(500).json(responseModel.errorResponse(err));
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

                return res.json(responseModel.successResponse(countries));
            });
    }



    get_country_competitions(req, res) {

        logger.info('Called get_country_competitions: ' + req.params.country);

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
                    return res.status(500).json(responseModel.errorResponse(err));
                }
                return res.json(responseModel.successResponse(data));
            });
    }
}

module.exports = CountriesController