const debug = require('debug')('Sportstats.API')
const name = 'API Server'
const version = '0.0.1';

var logger = require('./Logger.js'),
    settings = require('./settings'),
    morgan = require('morgan'),
    express = require('express'),
    app = express(),
    cors = require('cors'),
    port = process.env.PORT || 3010,
    metricsPort = process.env.PORT || 3011,
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    expressMetrics = require('express-metrics'),
    swaggerUi = require('swagger-ui-express'),
    swaggerJSDoc = require('swagger-jsdoc'),
    upsertMany = require('@meanie/mongoose-upsert-many'),
    request = require('request'),

    // Models
    TeamToScrap = require('./Models/TeamToScrap'),
    TeamInfo = require('./Models/TeamInfo'),
    LeagueToScrap = require('./Models/LeagueToScrap'),
    LeagueInfo = require('./Models/LeagueInfo'),
    Country = require('./Models/Country'),
    
    // CompetitionsScrapInfo = require('./Models/Scraping/CompetitionsScrapInfo'),
    // Competition = require('./Models/Competition'),
    
    TeamScrapInfo = require('./Models/Scraping/TeamsScrapInfo');
var autoIncrement = require('mongoose-auto-increment');


// Mongoose Configuration
var mongoConnString = `${settings.mongo.connString}`;
if(settings.mongo.authEnabled)
{
    // console.log(JSON.stringify(process.env));
    console.log(process.env.MONGO_USER);
    console.log(process.env.MONGO_PWD);
    mongoConnString = mongoConnString.replace(settings.mongo.connStringUserTag, process.env.MONGO_USER);
    mongoConnString = mongoConnString.replace(settings.mongo.connStringPasswordTag, process.env.MONGO_PWD);
}

mongoose.Promise = global.Promise;
mongoose.plugin(upsertMany);


logger.info("Checking MongoDb connection...");
mongoose.connect(mongoConnString, function (err) {
    if (err) {
        console.error(err);
        console.error('Error connecting to MongoDB: ' + mongoConnString);
        console.log("The aplication is terminating...");
        process.exit();
    }

    autoIncrement.initialize(mongoose.connection);

    // Swagger
    // Swagger definition
    // You can set every attribute except paths and swagger
    // https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md
    var swaggerDefinition = {
        info: { // API informations (required)
            title: 'Sportstats', // Title (required)
            version: version, // Version (required)
            description: 'Sportstats API', // Description (optional)
        },
        host: `${settings.api.hostUrl}`, // Host (optional)
        basePath: `/${settings.api.apiBasePath}`, // Base path (optional)
    };

    // Options for the swagger docs
    var options = {
        // Import swaggerDefinitions
        swaggerDefinition: swaggerDefinition,
        // Path to the API docs
        apis: [
            './docs/swagger/tags.yaml',
            './docs/swagger/definitions.yaml',
            './docs/swagger/security.yaml',
            './Routes/*.js']
    };

    // Initialize swagger-jsdoc -> returns validated swagger spec in json format
    var swaggerSpec = swaggerJSDoc(options);

    //swaggerSpec.definitions.in_login = require("./docs/swagger/tags.yaml");

    app.use('/public', express.static(__dirname + '/public'));
    app.set('view engine', 'pug');

    // Serve swagger docs the way you like (Recommendation: swagger-tools)
    app.get('/api-docs.json', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    // Swagger UI
    var swaggerUIOptions = {
        explorer: true
    };
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUIOptions));


    // Metrics Configuration
    app.use(expressMetrics({
        port: metricsPort
    }));

    app.use(morgan('dev'));

    app.use(cors());

    app.use(bodyParser.json({
        limit: '50mb'
    }));
    app.use(bodyParser.urlencoded({
        limit: '50mb',
        extended: true
    }));


    app.get('/metrics', function (req, res) {
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
            stats.forEach(stat => {
                if (stat.key.indexOf('/') == 0 && stat.key != '/metrics' && stat.key != '/') {

                    if (stat.stats.get) {
                        content += '<h3>[GET] ' + stat.key + '</h3>';
                        content += '<ul>';
                        content += '<li>count: ' + stat.stats.get.duration.count + '</li>';
                        content += '<li>min: ' + stat.stats.get.duration.min + '</li>';
                        content += '<li>max: ' + stat.stats.get.duration.max + '</li>';
                        content += '<li>avg: ' + stat.stats.get.duration.mean + '</li>';
                        content += '</ul>';
                    }

                    if (stat.stats.post) {
                        content += '<h3>[POST] ' + stat.key + '</h3>';
                        content += '<ul>';
                        content += '<li>count: ' + stat.stats.post.duration.count + '</li>';
                        content += '<li>min: ' + stat.stats.post.duration.min + '</li>';
                        content += '<li>max: ' + stat.stats.post.duration.max + '</li>';
                        content += '<li>avg: ' + stat.stats.post.duration.mean + '</li>';
                        content += '</ul>';
                    }

                    content += '<hr/>';
                }
            });
            res.send(content);
        });
    });


    app.get('/', function (req, res) {
        res.redirect('/management');
    });

    // Routes
    var scrapRoutes = require('./Routes/ScrapRoutes');
    scrapRoutes(app);
    // var infoRoutes = require('./Routes/InfoRoutes');
    // infoRoutes(app);
    var authRoutes = require('./Routes/AuthRoutes');
    authRoutes(app);
    var leagueRoutes = require('./Routes/LeaguesRoutes');
    leagueRoutes(app);
    var teamRoutes = require('./Routes/TeamsRoutes');
    teamRoutes(app);
    var countriesRoutes = require('./Routes/CountriesRoutes');
    countriesRoutes(app);
    // var competitionRoutes = require('./Routes/CompetitionRoutes');
    // competitionRoutes(app);
    var managementRoutes = require('./Routes/ManagementRoutes');
    managementRoutes(app);

    app.listen(port);
    logger.info('Sportstats API server started on: ' + port);
});