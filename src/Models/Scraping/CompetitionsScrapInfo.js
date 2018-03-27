'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var upsertMany = require('@meanie/mongoose-upsert-many');

var CompetitionScrapInfo = new Schema({
    
    competitionId: Number,
    countryId: Number,

    providers: [
        {
            name: String,
            link: String
        }
    ],

    
    nextScrapAt: {
        type: Date
    },
    createdAt: {
        type: Date
    },
    lastScrapedAt: {
        type: Date
    },
    lastUpdatedAt: {
        type: Date
    }
}, { collection: 'CompetitionScrapInfo' });

CompetitionScrapInfo.plugin(mongoosePaginate);
CompetitionScrapInfo.plugin(upsertMany);

module.exports = mongoose.model('CompetitionScrapInfo', CompetitionScrapInfo, 'CompetitionScrapInfo');