'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
const upsertMany = require('@meanie/mongoose-upsert-many');

var TeamToScrapSchema = new Schema({

    country: String,

    league: String,

    permalink: String,

    name: String,

    providers: [
        {
            name: String,
            link: String
        }
    ],

    scrapedAt: {
        type: Date
    },

    nextScrapAt: {
        type: Date,
        default: Date.now
    },

    nextGameScrapAt: Date,

    nextGame: {
        date: Date,
        provider: String,
        homeTeamName: String,
        homeTeamLink: String,
        awayTeamName: String,
        awayTeamLink: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
}, { collection: 'TeamsToScrap' });

TeamToScrapSchema.plugin(mongoosePaginate);
TeamToScrapSchema.plugin(upsertMany);

module.exports = mongoose.model('TeamsToScrap', TeamToScrapSchema, 'TeamsToScrap');