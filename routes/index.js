var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var Tenders = require('../models/tenders');

function Users (){
  return knex('users');
}

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Trade It' });
});

router.post('/', function(req, res, next){
  Users().where({facebook_username:req.body.username})
  .then(function(user){
    if(user.length > 0){
      res.cookie('username', req.body.username);
      res.redirect('/dashboard');
    } else {
      res.redirect('/');
    }
  })
})

router.get('/dashboard', function(req, res, next){
  if(req.cookies.username){
    Tenders.all().then(function(tenders){
      res.render('dashboard', {tenders:tenders.rows});
    });
  } else {
    res.redirect('/')
  }
})

module.exports = router;
