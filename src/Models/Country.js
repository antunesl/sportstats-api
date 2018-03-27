'use strict';

const settings = require('../settings');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var upsertMany = require('@meanie/mongoose-upsert-many');
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

var CountrySchema = mongoose.Schema({
    id: { type: String },
    name: { type: String }
});

CountrySchema.plugin(upsertMany);
CountrySchema.plugin(mongoosePaginate);
CountrySchema.plugin(autoIncrement.plugin, { model: 'Countries', field: 'id' });

CountrySchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj._id;
    delete obj.__v;

    obj.link = `http://${settings.api.hostUrl}/${settings.api.apiBasePath}/${settings.api.routes.countries.routePrefix}/${obj.id}`;

    return obj;
}


module.exports = mongoose.model('Countries', CountrySchema, 'Countries');