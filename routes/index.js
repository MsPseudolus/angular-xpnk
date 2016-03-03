var router = exp.Router;

exports.index = function(req, res){
	res.render('default', {
		title: 'Home',
		classname: 'home',
		users: ['MsPseudolus','Anne Libby', 'Ana Milocevic', 'Dr. Joyce']
	});
}

exports.about = function(req, res) {
	res.render('default', {
		title: 'About Us',
		classname: 'about'
	});	
}

exports.group = function(req, res) {
	var group_name = req.params.groupName;
	res.render('default', {
		title: 'Group',
		group: group_name,
		classname: 'group'
	});	
}