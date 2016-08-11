angular.module('xpnkApp.controllers', [])

/*
*
* Everything we need to set up a group before we can retrieve its content
*
*/

.controller('Users', function Users($http, $scope, $rootScope, $routeParams, $location, $cacheFactory, $timeout, $window, getTweetsJSON, memberTweetsFilter, $attrs, igTokenService, getInstagramsJSON) {
	$scope.group_name = $routeParams.groupName;
	$http({method: 'GET', url: './data/'+$scope.group_name+'_users.json'}).success(function(data){		
		$scope.users = data;
    });
    
    load_tweets();  
    load_instagrams();

    function load_tweets () {
		// $scope.tweetStatus.switch = "off"; //so our New posts button does not display
		getTweetsJSON.getJSON().then(function(tweetsJSONObj){
			$scope.thisData = tweetsJSONObj.data;
			console.log("I AM thisData:");
			console.log($scope.thisData);
			$scope.thisTweets = _.groupBy($scope.thisData, "XpnkID");
			console.log("I AM thisTweets:");
			console.log($scope.thisTweets);
			$scope.tweeterscount = $scope.thisData.length;
			console.log("TWEETERS COUNT:");
			console.log($scope.tweeterscount);
		});
	};	//end load_tweets()
	
	function load_instagrams () {
		//$scope.instagramStatus.switch = "off"; //so our New posts button does not display
		console.log("I AM LOAD_INSTAGRAMS");

		getInstagramsJSON.getJSON().then(function(instagramsJSONObj){

			$scope.igData = instagramsJSONObj.data;
			console.log("I AM igData:");
			console.log($scope.igData);

			$scope.instagrams = _.groupBy($scope.igData, "XpnkID");
			console.log("I AM $SCOPE.INSTAGRAMS:");
			console.log($scope.instagrams);

			$scope.instagramscount = _.size($scope.instagrams);

			$scope.instagrammers = _.keys($scope.instagrams);
			console.log("I AM INSTAGRAMMERS:");
			console.log($scope.instagrammers);

			$scope.instagram_count = $scope.igData.length;

			$rootScope.oldInstagrams = $scope.igData;
			
		}); // end gettheinstagrams();
	};	//end load_instagrams()

	$scope.gotogroup = function () {
		var location = $location.absUrl();
		var locsplit = location.split('/#');
		var locrel = locsplit[1].split('/invite');
		var locredir = locrel[0];
		$location.url(locredir);
	}

	/*
	*
	* Instagram user oauth functions used by invite process
	*
	*/

	$scope.ig_auth = function() {
		console.log("IG_AUTH ENGAGED");
		init_oauthio();
		var location = $location.absUrl();
		var locsplit = location.split('/#');
		var locrel = locsplit[1].split('/invite');
		var locredir = locrel[0];

		OAuth.popup('instagram').done(function(result) {
			$location.url(locredir);
			console.log( result );
			var userigtoken = result.access_token;
			var userigid = result.user.id;
			var userigusername = result.user.username;
			var userigfullname = result.user.full_name;
			var userigavatar = result.user.profile_picture;
			var provider = result.provider;
			console.log(userigusername + " has granted Xapnik access!" + provider + " is the provider.");
			console.log(location + " is our location.");

			var data = {
				access_token: userigtoken,
				insta_userid: userigid,
				insta_username: userigusername
			}
			igTokenService.save({}, data)
		})
/*
TODO - add back in our own state param for additional security

		retrieve_token(function( err, token ){
			authenticate( token, function( err ){
				if(!err) {
					console.log("WE HAVE AUTH!");
				} else {
					console.log("PROBLEMZ: " + err);
				}
			})
		})
*/		
	}

	$scope.oauthio_key = '';

	function init_oauthio() {
		OAuth.initialize($scope.oauthio_key);
	}
/*
	function retrieve_token( callback ){
		$http({method: 'GET', url: 'http://localhost:2665/oauth/token'}).success(function( data, status ){		
			callback(null, data.token);
    	});
	}	
*/	

/*
	function authenticate( token, callback ) {
		OAuth.popup('instagram', {
			state: token
		})
		.done(function( r ) {
			$http({ method: 'POST', url: 'http://localhost:2665/oauth/signin', data: { code: r.code } }).success(function( data, status ){		
				var userigtoken = data.access_token;
				var userigid = data.user.id;
				var userigusername = data.user.username;
				var userigfullname = data.user.full_name;
				var userigavatar = data.user.profile_picture;
				console.log(userigusername + "has been authenticated and access token received!");
    		});
		})
		.fail(function( e ) {
			console.log( e );
		});
	}
*/	

/*TODO -- see if we can cache all these social media network scripts
	function load_scripts () {
		console.log("I AM LOAD SCRIPTS");

		var scriptCache = $cacheFactory.get('scriptCache');
		$http.get('https://platform.instagram.com/en_US/embeds.js', {
			cache: scriptCache
		});

		$scope.instagramjs = "HELLO!";//scriptCache.get('//platform.instagram.com/en_US/embeds.js');
	};
*/	

}) //end Users controller

/*
*
* Tweets controller has evolved to control all the content (Instagram, etc.)
* name will be changed during a subsequent refactoring
*
*/

.controller('Tweets', function Tweets($http, $scope, $attrs, $routeParams, $attrs, $filter, $interval, $timeout, $compile, $interpolate, $parse, $rootScope, $cacheFactory, newTweetsService, tweetsCompare, isolateNewTweets, addNewTweetsService, getTweetsJSON, newInstagramsService, instagramsCompare, isolateNewInstagrams, addNewInstagramsService) {

	//create the page
	$scope.tweetStatus = {};
//process that checks for new tweets every 60 seconds
	$interval(function(){
		if ($rootScope.checkdata){$scope.olddata = $rootScope.checkdata};
		console.log("I AM OLDDATA:");
		console.log($scope.olddata);
		getTweetsJSON.getJSON().then(function(tweetsJSONObj){
			console.log("I AM INTERVAL CHECKDATA:");
			console.log($rootScope.checkdata);
			$scope.newCheck = angular.equals($scope.olddata, $rootScope.checkdata);
			if ($scope.newCheck === true){
			console.log("NO NEW TWEETS")}else{
			console.log("NEW TWEETS! NEW TWEETS!");
			//if largest tweet_ID in checkdata is bigger than largest tweet_ID in olddata, take all tweets with tweet_ID bigger than biggest tweet_ID in olddata and append to view div, then run twitterwidgets on them (or vice versa) -- except this doesn't drop expired tweets
			$scope.tweetStatus.switch = "on"; //show the New Tweets button
			};
		});//.then
	;}, 60000);//end interval


	$scope.refreshTweets = function () {
		load_tweets();
	};	//refreshTweets used by the New Tweets button in the template

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
		return $scope.tweeter_tweets;
		
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
		console.log($scope.user_instagrams);

	};//end getuserinstagrams()

	//can probably delete this function eventually
	function checkNewInstagrams(){
		newInstagramsService.fetchNewInstagrams().then(function(newInstagramsObj) {
			$scope.instagramsUpdate = newInstagramsObj;
			console.log("I AM instagramsUpdate");
			console.log($scope.instagramsUpdate);
		});
	};

	function newInstagramsOrNot() {
		instagramsCompare.compareInstagrams().then(function(compareObj) {
			$scope.newInstagramsStatus = compareObj;
			console.log("I AM newInstagramsOrNot");
			console.log($scope.newInstagramssStatus);
			if (compareObj === true) {
				return
			};//end if compareObj

			isolateNewInstagrams.iterateInstagrams().then(function(instagramsToAddObj){

				$scope.whatsNewObj = instagramsToAddObj.newInstagramssLength;
				console.log("I AM whatsNewObj:");
				console.log($scope.whatsNewObj);
				$scope.newCount = $scope.whatsNewObj.length;
				console.log("I AM newCount:");
				console.log($scope.newCount);

			});//end isolateNewInstagrams.iterateInstagrams().then

		});//end instagramsCompare.compareTweets().then


	}; //newInstagramsOrNot
				
})//end Instagrams controller

//uses nested controllers in the html to display tweets per user