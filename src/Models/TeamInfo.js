'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var upsertMany = require('@meanie/mongoose-upsert-many');

var TeamInfo = new Schema({

    teamInfo: {
        capacity: String,
        city: String,
        manager: String,
        stadium: String
    },

    country: String,

    name: String,

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
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
}, {
        collection: 'Teams'
    });
TeamInfo.plugin(mongoosePaginate);
TeamInfo.plugin(upsertMany);
module.exports = mongoose.model('Teams', TeamInfo, 'Teams');