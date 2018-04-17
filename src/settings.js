var settings = {
    api: {
        hostUrl: 'localhost:3010',
        apiVersion: 'v1',
        apiBasePath: 'api',

        routes: {
            countries: {
                routePrefix: 'country'
            },
            competitions: {
                routePrefix: 'competitions'
            },
            teams: {
                routePrefix: 'teams'
            },
            competitionsScrapInfo: {
                routePrefix: 'competitionsScrapInfo'
            },
            teamsScrapInfo: {
                routePrefix: 'teamsScrapInfo'
            },
            gamesScrapInfo: {
                routePrefix: 'gamesScrapInfo'
            },
        }
    },
    mongo: {
        authEnabled: true,
        connStringUserTag: '{user}',
        connStringPasswordTag: '{password}',
        connString: 'mongodb://{user}:{password}@localhost:27017/admin'
        //connString: 'mongodb://localhost:27017/sportstats'
        // connString: 'mongodb://sportstatsdbAdmin:sportstatsWIG@server/sportstats'
    },
    scraping: {
        providers: [
            {
                name: 'SofaScore',
                baseUrl: 'https://www.sofascore.com/'
            },
            {
                name: 'WhoScored',
                baseUrl: 'https://www.whoscored.com/'
            }
        ]
    }
};

module.exports = settings;