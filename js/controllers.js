angular.module('xpnkApp.controllers', [])

/*
*
* Functions for newcomers
*
*/
.controller('Public', function Public($scope, $compile, $window, $location, $http, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, slackGroupTokenService, newGroupFromSlackService){
	var slack_url = 'https://slack.com/oauth/authorize?scope=incoming-webhook,commands,bot,team:read,users:read,chat:write:user&client_id='+SLACK_CLIENT_ID+'&state=xpnk_add_to_slack'+'&redirect_uri=http://localhost:8000/added_to_Slack';
	$scope.add_to_slack = function() {
		$window.open(slack_url, '_self');
	}

	var request_params = $location.search();
	var slack_team_code = request_params.slack_code;
	console.log("SLACK GROUP CODE:  "+slack_team_code);
	var slack_token_url = 'https://slack.com/api/oauth.access?client_id='+SLACK_CLIENT_ID+'&client_secret='+SLACK_CLIENT_SECRET+'&code='+slack_team_code+"&redirect_uri=http://localhost:8000/added_to_Slack";
	//var slack_token_url = "https://slack.com/api/oauth.access?client_id=6146359360.78348665680&client_secret=e9aca6435a4e1fc82655fb181a6ede43&code="+slack_team_code+"&redirect_uri=http://localhost:8000/added_to_Slack";

	console.log("SLACK_TOKEN_URL:  "+slack_token_url);

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

			console.log("SLACK_ACCESS_TOKEN:  "+slack_access_token);
			console.log("SLACK_TEAM_NAME:  "+slack_team_name);
			console.log("SLACK_TEAM_ID:  "+slack_team_id);
			console.log("SLACK_BOT_ID:  "+slack_bot_id);
			console.log("SLACK_BOT_TOKEN:  "+slack_bot_token);

			$http({method: 'POST', url: 'http://localhost:9090/api/v1/slack_new_group?team_token='+slack_access_token+'&bot_token='+slack_bot_token}).success(function(response) {
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

/*
*
* Everything we need to set up a group before we can retrieve its content
*
*/

.controller('Users', function Users($http, $resource, $scope, $rootScope, $routeParams, $state, $localStorage, $location, $cacheFactory, $timeout, $window, $interval, xpnk_api, OAUTHIO_KEY, xpnkAuth, getTweetsJSON, memberTweetsFilter, $attrs, twitterTokenService, igTokenService, disqusTokenService, getInstagramsJSON, getDisqusJSON, slackSvc, slackTokenService) {
	$scope.group_name = $routeParams.groupName;
	$http({method: 'GET', url: './data/'+$scope.group_name+'_users.json'}).success(function(data){		
		$scope.users = data;
    });

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
	};	//refreshTweets used by the New Tweets button in the template

	function load_disqus () {
		// $scope.tweetStatus.switch = "off"; //so our New posts button does not display
		getDisqusJSON.getJSON().then(function(disqusJSONObj){
			$scope.disqusData = disqusJSONObj.data;
			$scope.thisDisqus = _.groupBy($scope.disqusData, "XpnkID");
			$scope.disquserscount = $scope.disqusData.length;
		});
	};	//end load_tweets()

	$scope.gotogroup = function () {
		var location = $location.absUrl();
		var locsplit = location.split('/#');
		var locrel = locsplit[1].split('/invite');
		var locredir = locrel[0];
		$location.url(locredir);
	}

    /*
	*
	* XPNK user oauth functions
	*
	*/
	$scope.xpnk_auth = function(next_function) {
		xpnkAuth.Auth().then(function(response){
			if (response.status == 200) {
				return next_function;
			} else {
				return error;
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
	$scope.twitter_auth = function() {

		init_oauthio();

		var locredir = $state.go('insta-user-auth');

		OAuth.popup('twitter').done(function(result) {
			
			var usertwttrtoken = result.oauth_token;
			var usertwttrsecret = result.oauth_token_secret;
			var pulltwttrid = usertwttrtoken.split("-");
			var usertwttrid = pulltwttrid[0];
			var provider = result.provider;
			var data = {
				access_token: usertwttrtoken,
				user_secret: usertwttrsecret,
				twitter_userid: usertwttrid,
			}

			twitterTokenService.save({}, data);
		})
	}	

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

		var scopedata = $scope.thisData;
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

				$scope.whatsNewObj = instagramsToAddObj.newInstagramssLength;
				$scope.newCount = $scope.whatsNewObj.length;
			});//end isolateNewInstagrams.iterateInstagrams().then

		});//end instagramsCompare.compareTweets().then


	}; //newInstagramsOrNot
				
})//end Instagrams controller

//uses nested controllers in the html to display tweets per user