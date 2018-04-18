'use strict';
const BaseController = require('../Controllers/baseController');
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    request = require("request");

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

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
            .get('http://208.110.70.2:3010/api/leagues/info/list', {}, function (error, response, body) {

                var jsonObject = JSON.parse(body);

                res.render("competitions", {
                    leagues: jsonObject.result
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

        var args = req.body;

        console.log(args)

        var permalink = args.country.replaceAll(' ', '') + '_' + args.name.replaceAll(' ', '');
        console.log(permalink)
        var options = {
            uri: 'http://208.110.70.2:3010/api/leagues/scrap/pending',
            method: 'POST',
            json: {
                sport: args.sport,
                gameTime: args.gameTime,
                name: args.name,
                country: args.country,
                permalink: permalink,
                type: args.type,
                providers: [
                    {
                        name: "SofaScore",
                        link: args.sofaScoreProvider
                    },
                    {
                        name: "WhoScored",
                        link: args.whoScoredProvider
                    }
                ]
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(response) // Print the shortened url.
                window.location.href = '/management/competitions';
            }
        });
    }

}

module.exports = ManagementController
