'use strict';
const settings = require('../settings');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var upsertMany = require('@meanie/mongoose-upsert-many');
var autoIncrement = require('mongoose-auto-increment');
var modelName = 'Teams';

autoIncrement.initialize(mongoose.connection);


var Team = new Schema({

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

    teamInfo: {
        capacity: String,
        city: String,
        manager: String,
        stadium: String
    },


    providerInfo: {
        name: String,
        link: String
    },

    permalink: String,

    squad: [{
        name: String,
        nationality: String,
        number: Number,
        position: String
    }],

    topScores: [{
        goals: Number,
        matches: Number,
        name: String,
        position: Number,
        ratings: Number
    }],

    nextGame: {
        homeTeam: String,
        awayTeam: String,
        homeLineup: Array,
        awayLineup: Array,
        homeNews: Array,
        awayNews: Array,
        missingHomePlayers: Array,
        missingAwayPlayers: Array
    }

}, {
        collection: modelName
    });


    Team.plugin(upsertMany);
    Team.plugin(mongoosePaginate);
    Team.plugin(autoIncrement.plugin, { model: modelName, field: 'id' });

    Team.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj._id;
    delete obj.__v;

    obj.link = `http://${settings.api.hostUrl}/${settings.api.apiBasePath}/${settings.api.routes.teams.routePrefix}/${obj.id}`;

    return obj;
}

module.exports = mongoose.model(modelName, Competition, modelName);