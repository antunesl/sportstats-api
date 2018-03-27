const BaseController = require('../Controllers/baseController')
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var logger = require('../Logger.js'),
    mongoose = require('mongoose'),
    LeagueInfo = mongoose.model('Leagues'),
    LeaguesToScrap = mongoose.model('LeaguesToScrap'),
    async = require('async'),
    responseModel = require('./Response.js');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../Models/User');
/**
* Configure JWT
*/
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../authConfig'); // get config file

class AuthController extends BaseController {

    constructor() {
        super();
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    login(req, res) {

        User.findOne({ email: req.body.email }, function (err, user) {
            if (err) return res.status(500).send('Error on the server.');
            if (!user) return res.status(404).send('No user found.');

            // check if the password is valid
            var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

            // if user is found and password is valid
            // create a token
            var token = jwt.sign({ id: user._id }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });

            // return the information including token as JSON
            res.status(200).send({ auth: true, token: token });
        });

    }

    register(req, res) {

        var hashedPassword = bcrypt.hashSync(req.body.password, 8);

        User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        },
            function (err, user) {
                if (err) return res.status(500).send("There was a problem registering the user`.");

                // if user is registered without errors
                // create a token
                var token = jwt.sign({ id: user._id }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });

                res.status(200).send({ auth: true, token: token });
            });

    }


    me(req, res) {

        User.findById(req.userId, { password: 0 }, function (err, user) {
            if (err) return res.status(500).send("There was a problem finding the user.");
            if (!user) return res.status(404).send("No user found.");
            res.status(200).send(user);
        });

    }

}

module.exports = AuthController