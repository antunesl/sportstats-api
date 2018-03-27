'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
const upsertMany = require('@meanie/mongoose-upsert-many');

var PreviewToScrapSchema = new Schema({

    country: String,

    league: String,

    permalink: String,

    scraped: Boolean,

    scrapedAt: {
        type: Date
    },

    nextScrapAt: {
        type: Date,
        default: Date.now
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date
    }
}, { collection: 'PreviewsToScrap' });

TeamToScrapSchema.plugin(mongoosePaginate);
TeamToScrapSchema.plugin(upsertMany);

module.exports = mongoose.model('PreviewsToScrap', PreviewToScrapSchema, 'PreviewsToScrap');