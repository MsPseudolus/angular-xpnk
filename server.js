var express = require('express');
var app = express();
var http = require ('http');
//var routes = require('./routes');

app.set('view engine', 'ejs');

app.locals.pagetitle = "Xapnik!";

app.get('/', function(req, res) {
	res.render('default', {
		title: 'Home',
		classname: 'home',
		users: ['MsPseudolus','Anne Libby', 'Ana Milocevic', 'Dr. Joyce']
	});
});

app.get('/about', function(req, res) {
	res.render('default', {
		title: 'About Us',
		classname: 'about'
	});	
});

app.get('/group/:groupName', function(req, res) {
	var group_name = req.params.groupName;
	var gredirect = 'http://localhost:8000/XAPNIK/#/group/'+group_name;	
	res.redirect(gredirect);
});	

app.get('*', function(req, res) {
	res.send('Bad Route');
});	

var server = app.listen(2665, function() {
	console.log('Listening on port 2665');
});	