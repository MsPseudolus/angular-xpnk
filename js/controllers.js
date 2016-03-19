var xpnkApp = angular.module('xpnkApp', ['ngSanitize','ngRoute', 'ngAnimate'])

xpnkApp.config(function($routeProvider){

      $routeProvider
          .when('/hello',{
                templateUrl: 'hello.html'
          })
          .when('/group/:groupName',{
                templateUrl: 'group.html'
          });

});

xpnkApp.controller('Tweets', function Tweets($http, $scope, $routeParams, $anchorScroll, $location, $interval, $timeout, $compile, $interpolate, $parse, $rootScope, newTweetsService, tweetsCompare, isolateNewTweets, addNewTweetsService,getTweetsJSON) {

	$scope.group_name = $routeParams.groupName;

	//create the page
	$scope.tweetStatus = {};

	load_tweets();

   	$scope.gotoAnchor = function(twitter_user) {
	  var newHash = "anchor_" + twitter_user;
	  console.log("GOING TO:");
	  console.log(newHash);

	  if ($location.hash() !== newHash) {
		// set the $location.hash to `newHash` and
		// $anchorScroll will automatically scroll to it
		$location.hash("anchor_" + twitter_user);
	  } else {
		// call $anchorScroll() explicitly,
		// since $location.hash hasn't changed
		$anchorScroll();
	  }
	};

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

			};//end newCheck
		});//.then
	;}, 60000);//end interval

	$scope.refreshTweets = function () {
		load_tweets();
	};	//refreshTweets used by the New Tweets button in the template

	function load_tweets () {
		$scope.tweetStatus.switch = "off"; //so our New Tweets button does not display
		$scope.message = "I AM LOAD_TWEETS";

		getTweetsJSON.getJSON().then(function(tweetsJSONObj){
			console.log("I AM LOAD_TWEETS DATA:");
			console.log(tweetsJSONObj.data);

			$scope.thisData = tweetsJSONObj.data;
			console.log("I AM thisData:");
			console.log($scope.thisData);


			$scope.tweets = _.groupBy($scope.thisData, "twitter_user");
			console.log("I AM $SCOPE.TWEETS:");
			console.log($scope.tweets);

			$scope.tweetscount = _.size($scope.tweets);

			$scope.tweeters = _.keys($scope.tweets);
			console.log("I AM TWEETERS:");
			console.log($scope.tweeters);

			$scope.tweet_count = $scope.thisData.length;

			$rootScope.oldTweets = $scope.thisData;

			getthetweets();
		});
	};	//end load_tweets()

	function getthetweets () {
		var tweeters = $scope.tweeters;
		var tweeterscount = tweeters.length;
		for (var i = 0; i < (tweeterscount); i++) {
			var tweeter = tweeters[i];
			$scope.this_tweeter = tweeter;
			gettweetertweets(tweeter);
		}//end for loop
	};	//end getthetweets()

	function gettweetertweets(tweeter) {
		console.log('I AM GETTWEETERTWEETS');

		var scopedata = $scope.thisData;
		var scopedatalength = scopedata.length;
		var tweetertweets = [];
		for (var i = 0; i < scopedatalength; i++) {
			var thistweet = scopedata[i];
			var twitteruser = thistweet["twitter_user"];
			if (twitteruser === tweeter) {
				var post_tweet = thistweet["tweet_ID"];
				tweetertweets.push(post_tweet);
			}
		}//end for loop

		$scope.tweeter_tweets = tweetertweets;
		console.log($scope.tweeter_tweets);

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

})//end Tweets controller

//displays the tweets on the page
xpnkApp.directive('embedTemplate', function($interpolate) {
	return {
		link: function($scope, $element, $attr){
			twttr.widgets.createTweet($attr.id,$element [0],{ align: 'left' });
			}
	}
});

xpnkApp.factory('getTweetsJSON', function ($http, $rootScope, $routeParams) {

	var data = [];

	var tweetsJSONObj = {
		getJSON: function(){

			var group_name = $routeParams.groupName;
			var group_data = './data/'+group_name+'_tweets.json';

			return $http({method: 'GET', url: group_data}).success(function(data){
					data = (data);
					$rootScope.checkdata = data;
					console.log("I AM DATA:");
					console.log(data);
					console.log("I AM CHECKDATA:");
					console.log($rootScope.checkdata);
			});//end GET
		}	// getJSON
	};	//tweetsJSONObj

	return tweetsJSONObj;

}); //getTweetsJSON

xpnkApp.factory('isolateNewTweets', function($rootScope, newTweetsService) {

	var tweetsToAdd = [];

	var tweetsToAddObj = {
		iterateTweets: function() {
			return newTweetsService.fetchNewTweets().then(function(newTweetsObj) {

				var newTweets = newTweetsObj;
				var newTweetsLength = newTweetsObj.length;

				for(var i = 0; i < (newTweets.length); i++) {

					var tweetID = newTweets[i].tweet_ID;

					if (_.findWhere($rootScope.oldTweets, {tweet_ID: tweetID})){
						console.log("THIS TWEET ALREADY EXISTS");
						console.log(tweetID);
					} else {
						console.log("A NEW TWEET WAS FOUND");
						console.log(tweetID);

						tweetsToAdd.push(tweetID);
					}//end if statement
				}//end for loop
				console.log("I AM tweetsToAdd");
				console.log(tweetsToAdd.length);
			});//end return newTweetsService
		}//iterateTweets
	};//tweetsToAddObj

	return tweetsToAddObj;

});//isolateNewTweets


xpnkApp.factory('tweetsCompare', function($rootScope, $q, newTweetsService) {

	var compareObj = {

		compareTweets: function() {
			return newTweetsService.fetchNewTweets().then(function(newTweetsObj){
				var newOrNotNew = angular.equals(newTweetsObj, $rootScope.oldTweets);
				//var newOrNotNew = newTweetsObj.length - $rootScope.oldTweets.length;

				$rootScope.oldTweets = newTweetsObj;

				return newOrNotNew;
			});//
		}//compareTweets

	}; //compareObj

	return compareObj;
}); //tweetsCompare

//TODO retool this to put newData in $rootScope and then add $rootScope.$watch('newData', display New Tweets label);
xpnkApp.factory('newTweetsService', function($http, $routeParams, $rootScope, $q) {

	var group_name = $routeParams.groupName;
	var group_data = './data/'+group_name+'_tweets.json';

		var newTweetsObj = {
			fetchNewTweets: function() {
			console.log("newTweetsService IS WATCHING newData");
				return $http.get(group_data).then(function(result){

					$rootScope.newData = result.data;
					//newTweets = _.groupBy(newData, "twitter_user");
					//return newTweets;
					//tweetscount = _.size(newTweets);
					//tweeters = _.keys(newTweets);

					//tweet_count = newData.length;

					//console.log("THIS IS THE FACTORY OUTPUT:");
					//console.log(newTweets);

				});//end GET
			}//fetchNewTweets
		};//newTweetsObj

	return newTweetsObj;

});	//end newTweetsService

xpnkApp.factory('addNewTweetsService', function($rootScope, isolateNewTweets) {

	var addTheseTweets = ["610557817343377408", "610048807984852992"];
	var addTweetsLength = addTheseTweets.length;

	var addNewTweetsObj = {
		addNewTweets: function() {
			for(var i = 0; i < (addTweetsLength); i++) {

			} //for loop
		} // addNewTweets
	}; // addNewTweetsObj

	return addNewTweetsObj;

});//addNewTweetsService

xpnkApp.directive('profileImage', function() {
	return {
		link: function($scope, $element, $attr){
			transclude: true,
			$scope.thisProfileImage = $scope.tweet[0].profile_image;
		}
	}
});//end profileImage directive

xpnkApp.directive('twender', function($compile, $timeout, $templateRequest){
	return{
		templateUrl: 'xpnk-tweets.html'
	}
});//end twender directive

xpnkApp.controller('Users', function Users($http, $scope, $routeParams) {

	$scope.group_name = $routeParams.groupName;

	$http({method: 'GET', url: './data/'+$scope.group_name+'_users.json'}).success(function(data){
		$scope.users = data;
    });
})  
//uses nested controllers in the html to display tweets per user
