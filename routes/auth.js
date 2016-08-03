var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var passport = require('passport')
var userState = require('../models/userstate')
var FbInfo = require('../models/fbInfo')

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }),function(req, res, next){
  res.redirect('/auth/login')
});

router.get('/auth/logout', function(req, res, next){
  req.session.destroy(function(err){
      res.redirect('/')
    })
});

router.get('/auth/login', function(req, res, next){
  console.log(FbInfo.facebook_id);
  if (userState.status == 'not_found'){
    res.redirect('/users/new')
  }
  console.log(userState.status);
})
module.exports = router;
