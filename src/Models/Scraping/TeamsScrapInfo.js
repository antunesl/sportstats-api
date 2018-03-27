'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var upsertMany = require('@meanie/mongoose-upsert-many');

var TeamScrapInfo = new Schema({
    
    teamId: Number,
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
}, { collection: 'TeamScrapInfo' });

TeamScrapInfo.plugin(mongoosePaginate);
TeamScrapInfo.plugin(upsertMany);

module.exports = mongoose.model('TeamScrapInfo', TeamScrapInfo, 'TeamScrapInfo');