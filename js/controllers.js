angular.module('xpnkApp.controllers', [])

/*
*
* Functions for newcomers
*
*/
.controller('Public', function Public($scope, $compile, $window, $location, $http, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, slackGroupTokenService, newGroupFromSlackService){
	var slack_url = 'https://slack.com/oauth/authorize?scope=incoming-webhook,commands,bot,im:read,users:read,chat:write:user&client_id='+SLACK_CLIENT_ID+'&state=xpnk_add_to_slack'+'&redirect_uri=https://xapnik.com/added_to_Slack';
	$scope.add_to_slack = function() {
		$window.open(slack_url, '_self');
	}

	var request_params = $location.search();
	var slack_team_code = request_params.slack_code;
	var slack_token_url = 'https://slack.com/api/oauth.access?client_id='+SLACK_CLIENT_ID+'&client_secret='+SLACK_CLIENT_SECRET+'&code='+slack_team_code+"&redirect_uri=https://xapnik.com/added_to_Slack";

	var get_slack_team = function() {

		$http({method: 'GET', 
			   url: slack_token_url})
		.success(function(data){
			if(data.access_token) {console.log('THERE IS A SLACK TOKEN.');}
			var slack_access_token = data.access_token;
			var slack_team_name = data.team_name;
			var slack_team_id = data.team_id;
			var slack_webhook_object = {};
			slack_webhook_object = data.incoming_webhook;
			var slack_webhook = slack_webhook_object.url;
			var slack_webhook_channel = slack_webhook_object.channel;
			var slack_webhook_config = slack_webhook_object.configuration_url;
			var slack_bot_object = {};
			slack_bot_object = data.bot;
			var slack_bot_id = slack_bot_object.bot_user_id;
			var slack_bot_token = slack_bot_object.bot_access_token;
			var test_mode = "true";

			console.log("SLACK_ACCESS_TOKEN:  "+slack_access_token);
			console.log("SLACK_TEAM_NAME:  "+slack_team_name);
			console.log("SLACK_TEAM_ID:  "+slack_team_id);
			console.log("SLACK_BOT_ID:  "+slack_bot_id);
			console.log("SLACK_BOT_TOKEN:  "+slack_bot_token);

			$http({method: 'POST', url: xpnk_api+'slack_new_group?team_token='+slack_access_token+'&bot_token='+slack_bot_token+'&testMode='+test_mode+'&webhook='+slack_webhook})
			.success(function(response) {
				var new_group_response = {};
				new_group_response = response;
				console.log("NEW_GROUP_RESPONSE:  "+JSON.stringify(new_group_response));
			}) 
		})
	}

	if (slack_team_code) {
		get_slack_team();
	}	else {
		console.log("NO SLACK TEAM CODE.");
	}

/*
	$scope.create_new_slack_group = function() {
		var request_params = $location.search();
		var slack_team_token = request_params.token;
		console.log("SLACK TEAM TOKEN:  "+slack_team_token);
		var data = {
			team_token: slack_team_token
	    }

		newGroupFromSlackService.save({}, data);
	}
*/
})

.controller('Invite', function Invite($scope, $location, $localStorage, $routeParams, $state, $http, xpnk_api, GroupObj){
	var request_params 					= $location.search();
	console.log( "Invite request params:  ", request_params );
	var xpnk_token						= request_params.xpnk_tkn;
	var xpnk_group_name					= $routeParams.groupName;
	var check_invite_url				= xpnk_api+"check_user_invite?xpnk_token="+xpnk_token+"&xpnk_group_name="+xpnk_group_name;
	$scope.check_invite_data 			= "";
	console.log("request params: ", request_params);
	console.log("xpnk_token: " + xpnk_token);
	$http({method: 'GET', url: check_invite_url})
		.success(function(data){		
			$scope.check_invite_data 	= data;
			GroupObj.setObj($scope.check_invite_data, "slack");
			group_id = GroupObj.data.group_id;
			console.log("GroupObj.group_id:  " + group_id);
			console.log('CHECK_INVITE_DATA:  '+ JSON.stringify($scope.check_invite_data));
    		console.log('UR IN LIKE FLYNN');
    		$localStorage.xpnkInv		= 1;
    		gotologin();
    	})
    	.error(function(data){
    		console.log( "line 92" );
	    	$state.go('one-moment');
	    	console.log('Sorry. Your token is not a match for this group.');
    	})

    function gotologin (source) {
		var locredir = 'group/'+xpnk_group_name+'/reg-login';
		console.log( "Relocating you to: " + locredir );
		$location.url(locredir);
	}		
})

.controller('NewMember', function NewMember($scope, $location, $localStorage, $state, $http, xpnk_api, OAUTHIO_KEY, GroupObj, MemberObj, UpdateUser, InsertNewUser, AddMemberToGroup, xpnkAuth){

	function new_member ( auth_obj, auth_source ) {
		console.log( "new_member args:" + JSON.stringify( auth_obj ) );
		MemberObj.createObj();
		console.log( "MemberObj created:  " + JSON.stringify( MemberObj ) );

		if ( auth_source == "twitter" ){

			user_id 								= auth_obj.Twitter_ID;

			$http( {method: 'GET', url: xpnk_api + 'users/twitter?id=' + user_id} )
            .success(function( data ){ 
            	console.log( "new_member.data:  " + JSON.stringify( data ) );
	          	db_user_object 						= data;
	          	console.log( "db_user_object:  " + JSON.stringify( db_user_object ) );
	          	if ( db_user_object.user_ID == 0 ) {
	          		MemberObj.updateObj( auth_obj );
	          	} else if ( db_user_object.user_ID != 0) {
	          		MemberObj.updateObj( db_user_object );
	          	}
	          	console.log( "MemberObj after new_member:  " + JSON.stringify( MemberObj ) );
	          	klingonOrGalliano ( MemberObj );
          	})
		} else if ( auth_source == "ig" ){

			user_id 								= auth_obj.Insta_userid;

			$http( {method: 'GET', url: xpnk_api + 'users/ig?id=' + user_id} )
            .success( function( data ){ 
            	db_user_object						= data;
            	console.log( "db_user_object:  " + JSON.stringify( db_user_object ) );
	          	if ( db_user_object.User_ID == 0 ) {
	          		MemberObj.updateObj( auth_obj );
	          	} else if ( db_user_object.User_ID != 0) {
	          		MemberObj.updateObj( db_user_object );
	          	}
	          	console.log( "MemberObj after new_member:  " + JSON.stringify( MemberObj ) );

	          	klingonOrGalliano ( MemberObj );
          	})
			console.log( "It's an Instagram ID." );
		}
	}
	
	$scope.new_auth_twitter 			= function () {
    	init_oauthio();

       	OAuth.popup('twitter').done(function(result) {

        	var usertwttrtoken 			= result.oauth_token;
			var usertwttrsecret 		= result.oauth_token_secret;
			var provider 				= result.provider;

        	result.me().done(function(data){

				var usertwttrname 		= data.alias;
				var usertwttrid 		= data.raw.id_str;
				var usertwttravatar		= data.raw.profile_image_url;

			    var auth_obj 			= {
			    	Twitter_ID 		: usertwttrid,
			    	Twitter_user 	: usertwttrname,
				    Twitter_token 	: usertwttrtoken,
				    Twitter_secret 	: usertwttrsecret,	    
				    Profile_image 	: usertwttravatar
			    }
			console.log( "new_auth_twitter mydata: " + JSON.stringify( auth_obj ) ); 
			new_member( auth_obj, "twitter" );	    
			});
		})
    }	

    $scope.new_auth_ig				= function () {
    	init_oauthio();

    	OAuth.popup('instagram').done(function(result) {
    		var userig_token			= result.access_token;
    		var userig_username			= result.user.username;
    		var userig_id				= result.user.id;
    		var userig_avatar			= result.user.profile_picture;

    		var auth_obj = {
		  			Insta_user  	:  userig_username,
		  			Insta_userid 	:  userig_id,
		  			Insta_token 	:  userig_token,
		  			Profile_image	:  userig_avatar
	  			}
	  		new_member(auth_obj, "ig")	
    	});
    }

    $scope.build_member_twitter			= function () {
    	init_oauthio();

    	OAuth.popup('twitter').done(function(result) {

        	var usertwttrtoken 			= result.oauth_token;
			var usertwttrsecret 		= result.oauth_token_secret;
			var provider 				= result.provider;

        	result.me().done(function(data){

				var usertwttrname 		= data.alias;
				var usertwttrid 		= data.id;
	
			    var updateUser = {
		  			Twitter_user  	:  usertwttrname,
		  			Twitter_ID 	 	:  usertwttrid,
		  			Twitter_token 	:  usertwttrtoken,
		  			Twitter_secret  :  usertwttrsecret
	  			}
	  		MemberObj.updateObj( updateUser );
	  		console.log( "build_member_twitter MemberObj: " + JSON.stringify( MemberObj ) );
			klingonOrGalliano( MemberObj );    
			});
		})
    }

    $scope.build_member_ig			= function () {
    	init_oauthio();

    	OAuth.popup('instagram').done(function(result) {
    		var userig_token			= result.access_token;
    		var userig_username			= result.user.username;
    		var userig_id				= result.user.id;

    		var updateUser = {
    				Insta_token 	:  userig_token,
		  			Insta_user  	:  userig_username,
		  			Insta_userid 	:  userig_id
	  			}
	  		console.log("MemberObj before build_member_ig update: " + JSON.stringify(MemberObj));	
	  		MemberObj.updateObj(updateUser);
	  		console.log("build_member_ig MemberObj: " + JSON.stringify(MemberObj));	
	  		klingonOrGalliano( MemberObj );
    	});
    }

    $scope.build_member_disqus			= function () {
    	init_oauthio();

    	var userdisqustoken;
		var provider;
		var userdisqusid;
		var userdisqususername;
		var userdisqusrefresh_token;

		OAuth.popup('disqus').done(function(result) {
			userdisqustoken = result.access_token;
			provider = result.provider;
			var userdisqusid;
			var userdisqususername;

			$scope.disqus_me = {};
			result.me().done(function(data) {
				$scope.disqus_me = data;
				userdisqusid = $scope.disqus_me.raw.response.id;
				userdisqususername = $scope.disqus_me.raw.response.username;

				var updateUser = {
					Disqus_username : userdisqususername,
      				Disqus_userid   : userdisqusid,
      				Disqus_token    : userdisqustoken
				}
			console.log("MemberObj before build_member_disqus update: " + JSON.stringify(MemberObj));		
			MemberObj.updateObj(updateUser);
			console.log("MemberObj after build_member_disqus update: " + JSON.stringify(MemberObj));
			klingonOrGalliano( MemberObj );	
			})
			.fail(function (err) {
				console.log("Result.me() failed:  " + err);
			})
			
		})
		
    }

    $scope.build_member_skip			= function ( network ) {
		switch ( network ) {
			case 'tw':
				var updateUser = {
					Twitter_user  	:  "skippedName",
		  			Twitter_ID 	 	:  "skippedID",
		  			Twitter_token 	:  "skippedToken",
		  			Twitter_secret  :  "skippedSecret"
				}
				MemberObj.updateObj( updateUser );
				console.log( "build_member_skip_tw MemberObj: " + JSON.stringify( MemberObj ) );
				klingonOrGalliano( MemberObj );
				break;
			case 'ig':
				var updateUser = {
					Insta_token 	:  "skippedToken",
		  			Insta_user  	:  "skippedName",
		  			Insta_userid 	:  "skippedID"
				}	
				MemberObj.updateObj( updateUser );
				console.log( "build_member_skip_ig MemberObj: " + JSON.stringify( MemberObj ) );
				klingonOrGalliano( MemberObj );
				break;
			case 'dsq':
				var updateUser = {
					Disqus_username : "skippedName",
	  				Disqus_userid   : "skippedID",
	  				Disqus_token    : "skippedToken"
				}	
				MemberObj.updateObj( updateUser );
				console.log( "build_member_skip_dsq MemberObj: " + JSON.stringify( MemberObj ) );
				klingonOrGalliano( MemberObj );
				break;	
	    }
    }

    function klingonOrGalliano( MemberObj ) {
    	console.log( "KlingonOrGalliano has received:  ");
    	console.log( "Twitter_ID:  " + MemberObj.data.Twitter_ID);
    	console.log( "Insta_userid:  " + MemberObj.data.Insta_userid);
    	console.log( "Disqus_token:  " + MemberObj.data.Disqus_token);
    	if (
    		MemberObj.data.Twitter_ID != ''
    		&& MemberObj.data.Insta_userid != ''
    		&& MemberObj.data.Disqus_token != ''
    		) 
    	{
    		console.log( "Galliano!:  " + JSON.stringify( MemberObj ) );
    		GallianoProcess( MemberObj );
    		//empty the dbuserObj
    		//empty the MemberObj
    		//empty the GroupObj
    	}   
    		else if (
    		MemberObj.data.Twitter_ID != ''
    		&& MemberObj.data.Insta_userid != ''
    		) 
    	{
    		console.log("Vulcan!");
    		VulcanProcess( MemberObj );

    	}	else if (
    		( MemberObj.data.Twitter_ID != '' || MemberObj.data.Insta_userid != '') 
    		&& MemberObj.data.Disqus_token != '' )
    	{
    		console.log("Earthling!  " + JSON.stringify( MemberObj ));
    		EarthlingProcess( MemberObj );

    	}
    		else 
    	{
    		console.log ("Klingon!");
    		
    		KlingonProcess( MemberObj );
    	}		
    }

    function GallianoProcess ( MemberObj ) {
    	console.log( "Galliano sees User_ID:  " + MemberObj.data.User_ID);
    	var group_id = $localStorage.xpnkGroup;
    	if ( MemberObj.data.User_ID != '' ) {
    		var group = {};
    		$localStorage.xpnkID = MemberObj.data.User_ID;
    		//first update the user's db record
    		console.log("Sending this to user_update:  " + JSON.stringify(MemberObj));
    		UserUpdate					= update_user( MemberObj );
    		if (UserUpdate == 1) {
    			console.log( "UserUpdate == 1" );
    		} else {
    			console.log( "UserUpdate != 1" );
    		}
    		//if not in group already then add_group_member
			xpnkAuth.GetGroup( group_id ).then( function( response ){
                group             = response;
                if ( ( $localStorage.xpnkInv ) && ( xpnkAuth.InGroup( group ) == 3 ) ) {
                	add_group_member( MemberObj.data.User_ID );
                } else {
                	$scope.login(GroupObj.data.group_source);
                }
        	});
	    	
	  	}	
	  	else if ( MemberObj.data.User_ID == '' ) {
	  		NewUserObj 					= create_new_user ( MemberObj );
	  		if ( NewUserObj == 1 ) {
	  			console.log( "NewUserObj == 1");
	  			if ( MemberObj.data.Twitter_ID != '' ) {
	  				console.log( "Going to fetch twitter_id: " + MemberObj.data.Twitter_ID);
	  				user_id 			= MemberObj.data.Twitter_ID;
	  				console.log( "going to fetch user_id: " + user_id);
	  				var geturl 			= xpnk_api + 'users/twitter?id=' + user_id;
	  				console.log ( "geturl for getting xpnk_id is:  " + geturl );
	  				$http( {method: 'GET', url: geturl} )
            		.success(function(data){ 
            			console.log( " users/twitter returned: " + JSON.stringify( data ));
	  					Xpnk_ID 		= data.User_ID;
	  					console.log( " GallianoProcess thinks it's adding this user to the group:  " + Xpnk_ID);
	  					add_group_member( Xpnk_ID );
	  				})
	  				.error( function( data ){
	  					console.log( "Something went wrong with getting the xpnk id: " + data );
	  				})	
	  			} 
	  			else if ( MemberObj.data.Insta_userid != '' ) {
	  				user_id 			= MemberObj.data.Insta_userid;
	  				$http({method: 'GET', url: xpnk_api + 'users/ig?id=' + user_id})
            		.success(function(data){ 
	  					Xpnk_ID 		= data.User_ID;
	  					console.log( " GallianoProcess is going to add this user to the group:  " + Xpnk_ID);	
	  					add_group_member( Xpnk_ID );
	  				})
	  				.error( function( data ){
	  					console.log( "Something went wrong with getting the xpnk id: " + data);
	  				})
	  			}	
	  		}
	  		
	  	} 
    	else {
	  		console.log ("Is the User_ID missing from MemberObj? I need that to add the new member.")
		}
	}	

    function VulcanProcess ( MemberObj ){
    	//update MemberObj with Tw and IG creds
    	var updateUser = {
	  			Twitter_user 	:  MemberObj.Twitter_user,
	  			Twitter_ID 		:  MemberObj.Twitter_ID,
	  			Twitter_token	:  MemberObj.Twitter_token,
	  			Twitter_secret  :  MemberObj.Twitter_secret,
	  			Insta_user  	:  MemberObj.Insta_user,
	  			Insta_userid 	:  MemberObj.Insta_userid,
	  			Insta_token 	:  MemberObj.Insta_token
  			}
  		MemberObj.updateObj(updateUser);	
  		console.log( "line 425" );
    	$state.go('disqus-user-auth-build');
    }

    function EarthlingProcess ( MemberObj ) {
    	//update MemberObj with TW or IG creds
		//update MemberObj with the Disqus creds
		var updateUser = {
			Disqus_username : MemberObj.Disqus_username,
			Disqus_userid   : MemberObj.Disqus_userid,
			Disqus_token    : MemberObj.Disqus_token
		}	
		MemberObj.updateObj(updateUser);	

    	if (MemberObj.Twitter_token == "") {
  			console.log ( "Earthling process new MemberObj: " + JSON.stringify( MemberObj ) );
  			$state.go('twit-user-auth-build');

		} else if ( MemberObj.Insta_token == "") {
  			console.log ( "Earthling process new MemberObj: " + JSON.stringify( MemberObj ) );
  			$state.go('insta-user-auth-build');
  		}	
    }

    function KlingonProcess ( MemberObj ){
    	//get missing TW/IG auth or skip
    	if ( MemberObj.data.Twitter_ID != '') {
  			$state.go('insta-user-auth-build');
		} else if ( MemberObj.data.Insta_userid != '' ) {
  			$state.go('twit-user-auth-build');
		}
    }

    function create_new_user ( MemberObj ) {
    	var data = {
			TwitterUser			:  MemberObj.data.Twitter_user,		
			InstaUser			:  MemberObj.data.Insta_user,
			TwitterID			:  MemberObj.data.Twitter_ID,
			TwitterToken   		:  MemberObj.data.Twitter_token,
			InstaUserID			:  MemberObj.data.Insta_userid,
			InstaAccessToken	:  MemberObj.data.Insta_token,
			DisqusUserName		:  MemberObj.data.Disqus_username,
			DisqusUserID		:  MemberObj.data.Disqus_userid,
			DisqusAccessToken	:  MemberObj.data.Disqus_token,
			ProfileImage		:  MemberObj.data.Profile_image
    	}
    	//send MemberObj to users/new endpoint
    	InsertNewUser.insert( data );
    	return 1;
    }

    function update_user ( MemberObj ){
    	var data = {
	    	user_ID 			:  MemberObj.data.User_ID,
			slack_userid 		:  MemberObj.data.Slack_ID,
			slack_name 			:  MemberObj.data.Slack_name,
			twitter_user 		:  MemberObj.data.Twitter_user,
			twitter_ID 			:  MemberObj.data.Twitter_ID,
			twitter_token 		:  MemberObj.data.Twitter_token,
			twitter_secret 		:  MemberObj.data.Twitter_secret,
			insta_user 			:  MemberObj.data.Insta_user,
			insta_userid 		:  MemberObj.data.Insta_userid,
			insta_token 		:  MemberObj.data.Insta_token,
			disqus_username 	:  MemberObj.data.Disqus_username,
			disqus_userid 		:  MemberObj.data.Disqus_userid,
			disqus_token 		:  MemberObj.data.Disqus_token,
			profile_image 		:  MemberObj.data.Profile_image
		}
		console.log( "update_user data:  " + JSON.stringify( data ));
		//send data to users/update endpoint
		UpdateUser.update( data );	
    }

    function add_group_member (Xpnk_ID) {
    	var this_group					= $localStorage.xpnkGroup;
    	AddMemberToGroup.addMember(this_group, Xpnk_ID)
  		.then( function() {
  			console.log("add_group_member is calling $scope.login..."),
  			$scope.login(GroupObj.data.group_source),
  			function( errorMessage ) {
  			console.warn( errorMessage );
  		}
  			
  		});
    }

    function init_oauthio() {
		OAuth.initialize($scope.oauthio_key);
	}
})

/*
*
* Everything we need to set up a group before we can retrieve its content
*
*/

.controller('Users', function Users( $http, $resource, $scope, $rootScope, $routeParams, $state, $localStorage, $location, $cacheFactory, $timeout, $window, $interval, xpnk_api, OAUTHIO_KEY, xpnkAuth, GroupObj, MemberObj, getTweetsJSON, memberTweetsFilter, $attrs, igTokenService, disqusTokenService, getInstagramsJSON, getDisqusJSON, slackSvc, slackTokenService, ModalService) {
	
	var location 						= $location.absUrl();
	$scope.group_name 					= $routeParams.groupName;
	group_id 							= xpnkAuth.GetGroupid();
	$localStorage.xpnk_group_name    	= group_id;
	var user_int 						= $localStorage.xpnkID;
	console.log( "user_int:  " + user_int );

	$http({method: 'GET', url: './data/'+$scope.group_name+'_users.json'}).success(function(data){		
		$scope.users = data;
		console.log( "$scope.users:  " , $scope.users );
		newMemberAlert();
    });    

	function isInPath ( pathVar ) {
		return location.match( pathVar );
	}

	function userInData () { 
		console.log( "userInData was called." );
		var return_val						= 0;
		var users 							= $scope.users;
		console.log( "$scope.users:  " , $scope.users );
		console.log( "users:  " , users );
		angular.forEach( users, function ( value, key ) {
			console.log( "angular.forEach was called!" );
			console.log( "XpnkID: " + value.XpnkID + " | Key: " + key );
			if ( value.XpnkID == user_int ) {
				return_val = 1;
				console.log( "return_val is true" ); 
			} //else {
				//return_val = 0;
				//console.log( "return_val is false" );
			//}
	  	} ) 
	  	return return_val;	
	};

	function newMemberAlert	() {
		var not_group_view							= isInPath( 'reg-login' );
		var users 									= $scope.users;
		console.log( "not_group_view: " + not_group_view );	
		if ( not_group_view == false ) {
			var user_in_data						= userInData();									        
			if ( ( $localStorage.xpnkLogin ) && ( ( user_in_data == 0 ) || ( users == '') ) ) {
				newMemberModal();
				$timeout( function() { $window.location.reload(); }, 60000, false );	
			}
		};	
	};

	function newMemberModal () {
		ModalService.showModal ({
			title: "We're fetching your posts right now.",
			text: "It'll take us about 60 seconds to fetch your posts. The page will automatically reload.",
			positive: "OK",
			basic: true, 
		});
	};
    
    var group_object = ['XpnkID', '-XpnkID', 'TweeterID', '-TweeterID']
    $scope.randomUser = group_object[Math.floor(Math.random() * group_object.length)];

    load_tweets();  
    load_instagrams();
    load_disqus();

    function load_tweets () {
		// $scope.tweetStatus.switch = "off"; //so our New posts button does not display
		getTweetsJSON.getJSON().then(function(tweetsJSONObj){
			$scope.thisData = tweetsJSONObj.data;
			$scope.thisTweets = _.groupBy($scope.thisData, "XpnkID");
			$scope.tweeterscount = $scope.thisData.length;
		});
	};	//end load_tweets()

	//process that checks for new tweets every 60 seconds
	$interval(function(){
		if ($rootScope.checkdata){$scope.olddata = $rootScope.checkdata};
		getTweetsJSON.getJSON().then(function(tweetsJSONObj){
			$scope.newCheck = angular.equals($scope.olddata, $rootScope.checkdata);
			if ($scope.newCheck === true){
			//if largest tweet_ID in checkdata is bigger than largest tweet_ID in olddata, take all tweets with tweet_ID bigger than biggest tweet_ID in olddata and append to view div, then run twitterwidgets on them (or vice versa) -- except this doesn't drop expired tweets
				$scope.tweetStatus.switch = "on"; //show the New Tweets button
			};
		});//.then
	;}, 60000);//end interval

	$scope.tweetStatus = {};

	$scope.refreshTweets = function () {
		load_tweets();
		load_instagrams();
	};	//refreshTweets used by the New Tweets button in the template

	function load_instagrams () {
		//$scope.instagramStatus.switch = "off"; //so our New posts button does not display
		getInstagramsJSON.getJSON().then(function(instagramsJSONObj){

			$scope.igData = instagramsJSONObj.data;

			$scope.instagrams = _.groupBy($scope.igData, "XpnkID");

			$scope.instagramscount = _.size($scope.instagrams);

			$scope.instagrammers = _.keys($scope.instagrams);

			$scope.instagram_count = $scope.igData.length;

			$rootScope.oldInstagrams = $scope.igData;
			
		}); // end gettheinstagrams();
	};	//end load_instagrams()

	//process that checks for new instagrams every 10 minutes
	$interval(function(){
		if ($rootScope.checkIGdata){$scope.oldIGdata = $rootScope.checkIGdata};

		getInstagramsJSON.getJSON().then(function(instagramsJSONObj){
			$scope.newIGCheck = angular.equals($scope.oldIGdata, $rootScope.checkIGdata);
			if ($scope.newIGCheck === true){
			}else{
			//if largest tweet_ID in checkdata is bigger than largest tweet_ID in olddata, take all tweets with tweet_ID bigger than biggest tweet_ID in olddata and append to view div, then run twitterwidgets on them (or vice versa) -- except this doesn't drop expired tweets
			$scope.tweetStatus.switch = "on"; //show the New Posts button
			};
		});//.then
	;}, 100000);//end interval

	$scope.tweetStatus = {};

	$scope.refreshInstagrams = function () {
		load_instagrams();
	};	

	function load_disqus () {
		// $scope.tweetStatus.switch = "off"; //so our New posts button does not display
		getDisqusJSON.getJSON().then(function(disqusJSONObj){
			$scope.disqusData = disqusJSONObj.data;
			$scope.thisDisqus = _.groupBy($scope.disqusData, "XpnkID");
			$scope.disquserscount = $scope.disqusData.length;
		});
	};

	$scope.login = function(source) {
		var source = source;
		console.log( "$scope.login sees source as  " + source );
		xpnkAuth.Login().then(function() {
			console.log( "$scope.login is calling $scope.gotogroup..." );
			$localStorage.xpnkLogin 				= 1;
			$scope.gotogroup(source);
		});
	}

	$scope.logout = function(){
		xpnkAuth.Logout();

	}

	$scope.gotogroup = function (source) {
		var location = $location.absUrl();
		console.log( "gotogroup location: " + location );
		var locsplit = location.split('/#');
		console.log( "gotogroup locsplit: " + locsplit );
		if( source == "slack" ) {
			console.log( "Source == slack." );
			var locrel = locsplit[1].split('/reg-login');
			console.log( "gotogroup locrel = " + locrel );
		} else {
		var locrel = locsplit[1].split('/reg-login');
		}
		var locredir = locrel[0];
		console.log( "gotogroup locredir:  " + locredir );
		MemberObj.emptyObj();
		for (var key in db_user_object) delete db_user_object[key];
		$location.url(locredir);
	}

    /*
	*
	* XPNK user oauth functions
	*
	*/
	function xpnk_auth ( next_function ) {
		console.log( "xpnk_auth was called..." );

		var check_token = {
	      method: 'POST',
	      url: xpnk_api + 'xpnk_auth_check',
	      headers: {
	        'token' : $localStorage.xpnkToken,
	    	}
	    }	

	    $http(check_token).success(function(data, status, headers){
	      console.log("Authentication successful: " + status);
	      success_status      = status;
	      if ( success_status == 200 ) {
	        console.log( " Status:  " + success_status );
	        return;
	      } else if ( success_status == 422 ) {
	        console.log( " Status:  " + success_status );
	        return next_function;
	      }
	    });
	}	

	/*
	*
	* Slack user oauth functions used by invite/onboard process
	*
	*/	
	$scope.slack_auth = function() {
		
		init_oauthio();
		
		var locredir = $state.go('twit-user-auth');
  
		OAuth.popup('slack').done(function(result) {
			var userslacktoken = result.access_token;
			var provider = result.provider;
			var locredir = $state.go('twit-user-auth');
            $http({method: 'GET', url: 'https://slack.com/api/users.identity?token='+userslacktoken}).success(function(data){		
		        var slackuser = data;
		        var slackusertoken = userslacktoken;
			    var slackuserid = slackuser.user.id;
			    var slackusername = slackuser.user.name;
			    var slackavatar = slackuser.user.image_72;
			    console.log ("SLACK AVATAR: " + slackavatar);
			    var data = {
					access_token: slackusertoken,
					slack_userid: slackuserid,
					slack_name: slackusername,
					slack_avatar: slackavatar
			    }

			    slackTokenService.save({}, data);

			    xpnkAuth.Login();

			    slackerid = data.slack_userid;
			    xpnkAuth.Get_xpnkid(slackerid);
			    
		    });    
		})	            
	}	

	/*
	*
	* Twitter user oauth functions used by invite/onboard process
	*
	*/
	/*
	$scope.twitter_auth = function() {

		init_oauthio();

		var locredir = $state.go('insta-user-auth');

       	OAuth.popup('twitter').done(function(result) {

        	var usertwttrtoken = result.oauth_token;
			var usertwttrsecret = result.oauth_token_secret;
			var provider = result.provider;

        	result.me().done(function(data){

				var usertwttrname = data.alias;
				var usertwttrid = data.id;

			    var mydata = {
				    access_token: usertwttrtoken,
				    user_secret: usertwttrsecret,
				    twitter_userid: usertwttrid,
				    twitter_username: usertwttrname,
			    }

			    //check for existence of twitter_userid already in db	
			    twitterTokenService.save({}, mydata);

			});
		})
	}	
	*/

	/*
	*
	* Instagram user oauth functions used by invite/onboard process
	*
	*/
	$scope.ig_auth = function() {

		init_oauthio();
		
		var locredir = $state.go('disqus-user-auth');

		OAuth.popup('instagram').done(function(result) {
			var userigtoken = result.access_token;
			var userigid = result.user.id;
			var userigusername = result.user.username;
			var userigfullname = result.user.full_name;
			var userigavatar = result.user.profile_picture;
			var provider = result.provider;
			var data = {
				access_token: userigtoken,
				insta_userid: userigid,
				insta_username: userigusername
			}

			igTokenService.save({}, data);
		})
	}	

    /*
	*
	* Disqus user oauth functions used by invite/onboard process
	*
    */
	$scope.disqus_auth = function() {
		console.log("DISQUS_AUTH ENGAGED");
		init_oauthio();
		
		var locredir = $state.go('invite-great-job');

		var userdisqustoken;
		var provider;
		var userdisqusid;
		var userdisqususername;
		var userdisqusrefresh_token;

		OAuth.popup('disqus').done(function(result) {
			userdisqustoken = result.access_token;
			provider = result.provider;
			var userdisqusid;
			var userdisqususername;

			$scope.disqus_me = {};
			result.me().done(function(data) {
				$scope.disqus_me = data;
				userdisqusid = $scope.disqus_me.raw.response.id;
				userdisqususername = $scope.disqus_me.raw.response.username;

				var data = {
					access_token: userdisqustoken,
					disqus_userid: userdisqusid,
					disqus_username: userdisqususername,
				}
				disqusTokenService.save({}, data)
			})
			.fail(function (err) {
				console.log("Result.me() failed:  " + err);
			})
		})
	}	

	$scope.oauthio_key = OAUTHIO_KEY;

	function init_oauthio() {
		OAuth.initialize($scope.oauthio_key);
	}

	$scope.check_users = function() {
		$http({method: 'GET', url: './data/'+$scope.group_name+'_users.json'}).
			success(function(status){	
				console.log( "$scope.check_users success fired" );	
				var redirect = "group/" + $scope.group_name;
				$location.url(redirect);
    		}).
    		error(function (status) {
    			var group_name = $scope.group_name;
    			console.log( "line 863" );
    			$state.go('one-moment');
    			//$location.url(redirect);
    			$timeout(function() {
	                $scope.check_users();
	            }, 60000)

		});		    
	}	
}) //end Users controller



/*
*
* Tweets controller has evolved to control all the content (Instagram, etc.)
* name will be changed during a subsequent refactoring
*
*/

.controller('Tweets', function Tweets($http, $scope, $attrs, $routeParams, $attrs, $filter, $interval, $timeout, $compile, $interpolate, $parse, $rootScope, $cacheFactory, newTweetsService, tweetsCompare, isolateNewTweets, addNewTweetsService, getTweetsJSON, newInstagramsService, instagramsCompare, isolateNewInstagrams, addNewInstagramsService) {

	/*
	*
	* Twitter content functions
	*
	*/

	function getthetweets () {

		var tweeterscount = $scope.tweeterscount;
		for (var i = 0; i < (tweeterscount); i++) {
			//get each twitteruser name and store in this_tweeter
			if ( $scope.thisData[i].TwitterPosts.length != 0 ) {
				var tweeter = $scope.thisData[i].XpnkID;
				$scope.this_tweeter = tweeter;
				//store the tweets in their own obj for parsing
				$scope.tweetertweets = $scope.thisData[i].TwitterPosts;
				$scope.tweetertweetscount = $scope.tweetertweets.length;
			}
			console.log("THIS TWEETER:");
			console.log($scope.this_tweeter);
			console.log("THIS TWEETER TWEET COUNT:");
			console.log($scope.tweetertweetscount);
			console.log("THIS TWEETER'S TWEETS:");
			console.log($scope.tweetertweets);
			
			//gettweetertweets(tweeter);
		}//end for loop
	};	//end getthetweets()	
						
	$scope.gettweetertweets = function (tweeter) {	
		console.log('I AM GETTWEETERTWEETS');
				
		var scopedata = $scope.thisData;
		var scopedatalength = scopedata.length;
		var tweetertweets = [];
		for (var i = 0; i < scopedatalength; i++) {
			var thisMember = scopedata[i];
			var twitteruser = thisMember["XpnkID"];
			if (twitteruser === tweeter) {
				var post_tweet = thisMember["TwitterPosts"];
				tweetertweets.push(post_tweet);
			}
		}
		$scope.tweeter_tweets = tweetertweets[0];
		console.log('TWEETER TWEETS:')
		console.log($scope.tweeter_tweets);
		
		
		var tweetertweetscount = $scope.tweeter_tweets.length;
		console.log('TWEETER TWEETS COUNT:');
		console.log(tweetertweetscount);
		for (var i = 0; i < tweetertweetscount; i++) {
			var thisTweet = $scope.tweeter_tweets[i];
			console.log("THIS TWEET:");
			console.log(thisTweet);
			var thisTweetID = thisTweet["TweetID"];
			$scope.theTweetID = thisTweetID;
			console.log("THIS TWEET ID");
			console.log($scope.theTweetID);
		}

		return $scope.tweeter_tweets;
		//embedtweetertweets(tweetertweets);
	};//end gettweetertweets()		
			
	//can probably delete this function eventually
	function checkNewTweets(){
		newTweetsService.fetchNewTweets().then(function(newTweetsObj) {
			$scope.tweetsUpdate = newTweetsObj;
			console.log("I AM tweetsUpdate");
			console.log($scope.tweetsUpdate);
		});
	};	
	
	function newTweetsOrNot() {
		tweetsCompare.compareTweets().then(function(compareObj) {
			$scope.newTweetsStatus = compareObj;
			console.log("I AM newTweetsOrNot");
			console.log($scope.newTweetsStatus);
			if (compareObj === true) {
				return				
			};//end if compareObj
			
			isolateNewTweets.iterateTweets().then(function(tweetsToAddObj){
			
				$scope.whatsNewObj = tweetsToAddObj.newTweetsLength;
				console.log("I AM whatsNewObj:");
				console.log($scope.whatsNewObj);
				$scope.newCount = $scope.whatsNewObj.length;
				console.log("I AM newCount:");
				console.log($scope.newCount);
				
			});//end isolateNewTweets.iterateTweets().then
			
		});//end tweetsCompare.compareTweets().then
		
	
	}; //newTweetsOrNot
	
	//this isn't going to do anything until get_tweets_json is the repeated function
	//$scope.$watchCollection('data', function(newVal, oldVal) {
	
		//console.log("TWEETS CHANGED");
	
	//});

	/*
	*
	* Instagram content functions
	*
	*/

	function getuserinstagrams(instagrammer) {
		console.log('I AM GETUSERINSTAGRAMS');

		var scopedata = $scope.igData;
		var scopedatalength = scopedata.length;
		var userinstagrams = [];
		for (var i = 0; i < scopedatalength; i++) {
			var thisinstagram = scopedata[i];
			var instagramuser = thisinstagram["InstagramUser"];
			if (instagramuser === instagrammer) {
				var post_instagram = thisinstagram["InstagramDate"];
				userinstagrams.push(post_instagram);
			}

		}
		$scope.user_instagrams = userinstagrams;

	};//end getuserinstagrams()

	//can probably delete this function eventually
	function checkNewInstagrams(){
		newInstagramsService.fetchNewInstagrams().then(function(newInstagramsObj) {
			$scope.instagramsUpdate = newInstagramsObj;
		});
	};

	function newInstagramsOrNot() {
		instagramsCompare.compareInstagrams().then(function(compareObj) {
			$scope.newInstagramsStatus = compareObj;
			if (compareObj === true) {
				return
			};//end if compareObj

			isolateNewInstagrams.iterateInstagrams().then(function(instagramsToAddObj){

				$scope.whatsNewObj = instagramsToAddObj.newInstagramsLength;
				$scope.newCount = $scope.whatsNewObj.length;
			});//end isolateNewInstagrams.iterateInstagrams().then

		});//end instagramsCompare.compareTweets().then


	}; //newInstagramsOrNot


	/*
	*
	* Disqus content functions
	*
	*/

	function getuserdisqus(disquser) {
		console.log('I AM GETUSERDISQUS');

		var scopedata = $scope.disqusData;
		var scopedatalength = scopedata.length;
		var userdisqusions = [];
		for (var i = 0; i < scopedatalength; i++) {
			var thisdisqus = scopedata[i];
			var disqususer = thisdisqus["DisqusUser"];
			if (disqususer === disquser) {
				var post_disqus = thisdisqus["DisqusDate"];
				userdisqusions.push(post_disqus);
			}

		}
		$scope.user_disqusions = userdisqusions;

	};//end getuserinstagrams()

	//can probably delete this function eventually
	function checkNewDisqus(){
		newDisqusionsService.fetchNewDisqusions().then(function(newDisqusionsObj) {
			$scope.disqusionsUpdate = newDisqusionsObj;
		});
	};

	function newDisqusOrNot() {
		disqusionsCompare.compareDisqusions().then(function(compareObj) {
			$scope.newDisqusionsStatus = compareObj;
			if (compareObj === true) {
				return
			};//end if compareObj

			isolateNewDisqusions.iterateDisqusions().then(function(disqusionsToAddObj){

				$scope.whatsNewObj = disqusionsToAddObj.newDisqusionsLength;
				$scope.newCount = $scope.whatsNewObj.length;
			});//end isolateNewInstagrams.iterateInstagrams().then

		});//end instagramsCompare.compareTweets().then


	}; //newInstagramsOrNot
				
})//end Instagrams controller

//uses nested controllers in the html to display tweets per user