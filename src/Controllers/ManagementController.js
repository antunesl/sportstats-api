'use strict';
const BaseController = require('../Controllers/baseController');
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    request = require("request");


class ManagementController extends BaseController {

    constructor() {
        super();
    }

    home(req, res) {
        res.render("index", {
            title: "Sportstats",
            countries: ['FIFA', 'UEFA', 'Portugal', 'England'],
            sports: ['football']
        });
    }

    competitions(req, res) {

        request
            .get('http://208.110.70.2:3010/api/leagues/scrap', {}, function (error, response, body) {
                
                var jsonObject = JSON.parse(body);

                res.render("competitions", {
                    leagues: jsonObject.result.docs
                });
            });

    }

    create_competition_get(req, res) {
        res.render("createCompetition", {
            title: "Sportstats",
            countries: ['FIFA', 'UEFA', 'Portugal', 'England'],
            sports: ['football']
        });
    }

    create_competition_post(req, res) {


    }

}

module.exports = ManagementController
