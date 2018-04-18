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

    api_docs(req, res) {
        res.redirect('/docs');
    }


    api_metrics(req, res) {
        var metricsUrl = 'http://localhost:3011/metrics';
        request.get(metricsUrl, (error, response, body) => {
            if (error) {
                return res.send(error);
            }
            let json = JSON.parse(body);
            var stats = [];
            for (var prop in json) {
                if (json.hasOwnProperty(prop)) {
                    stats.push({ key: prop, stats: json[prop] });
                }
            }
            var content = '<h1><a href="/">Sportstats API</a></h1><h2>Metrics</h2>';

            var filteredStats = [];
            stats.forEach(stat => {
                if (stat.key.indexOf('/') == 0 && stat.key != '/metrics' && stat.key != '/') {
                    if (stat.stats.get) {
                        stat.method = 'GET';
                        stat.values = stat.stats.get;
                    }
                    if (stat.stats.post) {
                        stat.method = 'POST';
                        stat.values = stat.stats.post;
                    }

                    if (stat.key.startsWith('/api/'))
                        filteredStats.push(stat);
                }
            });


            res.render('apiMetrics', { apiMetrics: filteredStats });

            // stats.forEach(stat => {
            //     if (stat.key.indexOf('/') == 0 && stat.key != '/metrics' && stat.key != '/') {

            //         if (stat.stats.get) {
            //             content += '<h3>[GET] ' + stat.key + '</h3>';
            //             content += '<ul>';
            //             content += '<li>count: ' + stat.stats.get.duration.count + '</li>';
            //             content += '<li>min: ' + stat.stats.get.duration.min + '</li>';
            //             content += '<li>max: ' + stat.stats.get.duration.max + '</li>';
            //             content += '<li>avg: ' + stat.stats.get.duration.mean + '</li>';
            //             content += '</ul>';
            //         }

            //         if (stat.stats.post) {
            //             content += '<h3>[POST] ' + stat.key + '</h3>';
            //             content += '<ul>';
            //             content += '<li>count: ' + stat.stats.post.duration.count + '</li>';
            //             content += '<li>min: ' + stat.stats.post.duration.min + '</li>';
            //             content += '<li>max: ' + stat.stats.post.duration.max + '</li>';
            //             content += '<li>avg: ' + stat.stats.post.duration.mean + '</li>';
            //             content += '</ul>';
            //         }

            //         content += '<hr/>';
            //     }
            // });
            // res.send(content);
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
                res.redirect('/management/competitions');
            }
        });
    }

}

module.exports = ManagementController
