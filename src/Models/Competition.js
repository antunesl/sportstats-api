'use strict';
const settings = require('../settings');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var upsertMany = require('@meanie/mongoose-upsert-many');
var autoIncrement = require('mongoose-auto-increment');
var modelName = 'Competitions';

autoIncrement.initialize(mongoose.connection);


var Competition = new Schema({

    id: {
        type: Number,
        unique: true,
        index: true
    },

    name: String,

    code: {
        type: String
    },

    countryId: {
        type: Number
    },

    teams: [{
        id: Number,
        name: String,
        link: String
    }],

    standings: [{
        teamId: Number,
        teamName: String,
        teamLink: String,

        defeateds: Number,
        draws: Number,
        gamesPlayed: Number,
        goalConceded: Number,
        goalScored: Number,
        lastResults: [],
        points: Number,
        position: Number,
        wins: Number
    }],

    titleHolder: String,

    mostTitles: [{
        name: String,
        titles: Number
    }],

    topScorers: [{
        goals: Number,
        matches: Number,
        name: String,
        position: Number,
        rating: Number,
        team: String
    }],

    lastUpdatedAt: {
        type: Date
    }


    // // This is only needed for historic data!
    // seasons: [{
    //     year: Number,       // 2017
    //     name: String,       // Season 2017/2018
    //     startDate: Date,    // 23/07/2017
    //     endDate: Date       // 05/05/2018
    // }]
}, {
        collection: modelName
    });


Competition.plugin(upsertMany);
Competition.plugin(mongoosePaginate);
Competition.plugin(autoIncrement.plugin, { model: modelName, field: 'id' });

Competition.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj._id;
    delete obj.__v;

    obj.link = `http://${settings.api.hostUrl}/${settings.api.apiBasePath}/${settings.api.routes.competitions.routePrefix}/${obj.id}`;

    return obj;
}

module.exports = mongoose.model(modelName, Competition, modelName);