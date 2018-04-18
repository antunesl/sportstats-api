'use strict';
const settings = require('../settings');
const ManagementController = require('../Controllers/ManagementController')

module.exports = function (app) {
    let managementCtrl = new ManagementController();


    app.route(`/management`)
        .get(managementCtrl.home);

    app.route(`/management/api/docs`)
        .get(managementCtrl.api_docs);

    app.route(`/management/api/metrics`)
        .get(managementCtrl.api_metrics);

    app.route(`/management/competitions`)
        .get(managementCtrl.competitions);

    app.route(`/management/competitions/create`)
        .get(managementCtrl.create_competition_get)
        .post(managementCtrl.create_competition_post);
};