'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var upsertMany = require('@meanie/mongoose-upsert-many');

var LeagueToScrap = new Schema({
    

    sport: String,

    gameTime: Number,

    permalink: String,

    name: String,

    country: String,

    providers: [
        {
            name: String,
            link: String
        }
    ],

    scrapedAt:{
        type: Date
    },

    nextScrapAt: {
        type: Date,
        default: Date.now
    },

    nextPreviewScrapAt: Date,

    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date
    }
}, { collection: 'LeaguesToScrap' });
LeagueToScrap.plugin(mongoosePaginate);
LeagueToScrap.plugin(upsertMany);
module.exports = mongoose.model('LeaguesToScrap', LeagueToScrap, 'LeaguesToScrap');