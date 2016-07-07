angular.module('xpnkApp.services', [])

.filter("trust", ["$sce",
function($sce) {
  return $sce.trustAsHtml;
}])

//TODO Add filters to return the post counts to display in the various network buttons
//instead of having all that logic in the view.


/*********************************************************************
 * TWITTER SERVICES
 *********************************************************************/
.factory('getTweetsJSON', function ($http, $rootScope, $routeParams) {
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
}) //getTweetsJSON

.filter ('memberTweets', function () {
  return function (thisData, xpnkID) {

    console.log("thisTweeter 02:");
    console.log(xpnkID);

    var tweeter = xpnkID;
    var myTweets;

    console.log("thisData:");
    console.log(thisData);

    angular.forEach(thisData, function() {
      if (XpnkID === thisMember) {
        myTweets = TwitterPosts;
        console.log("myTweets:");
        console.log(myTweets);
      }
    })
    return myTweets;
  }          
})

.factory('isolateNewTweets', function($rootScope, newTweetsService) {
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
})//isolateNewTweets

.factory('tweetsCompare', function($rootScope, $q, newTweetsService) {
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
}) //checkForNewTweets

//6/22 retool this to put newData in $rootScope and then add   $rootScope.$watch('newData', display New Tweets label);
.factory('newTweetsService', function($http, $routeParams, $rootScope, $q) {
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
})	//end updateTweets factory

.factory('addNewTweetsService', function($rootScope, isolateNewTweets) {
    var addTheseTweets = ["610557817343377408", "610048807984852992"];
    var addTweetsLength = addTheseTweets.length;
    var addNewTweetsObj = {
        addNewTweets: function() {
            for(var i = 0; i < (addTweetsLength); i++) {

            } //for loop
        } // addNewTweets
    }; // addNewTweetsObj
    return addNewTweetsObj;
})//addNewTweetsService

/*********************************************************************
 * INSTAGRAM SERVICES
 *********************************************************************/

.factory('getInstagramsJSON', function ($http, $rootScope, $routeParams) {
    var data = [];
    var instagramsJSONObj = {
        getJSON: function(){
            var group_name = $routeParams.groupName;
            var group_data = './data/'+group_name+'_instagrams.json';

            return $http({method: 'GET', url: group_data}).success(function(data){
                data = (data);
                $rootScope.checkdata = data;
                console.log("I AM INSTAGRAM DATA:");
                console.log(data);
                console.log("I AM INSTAGRAM CHECKDATA:");
                console.log($rootScope.checkdata);
            });//end GET
        }	// getJSON
    };	//instagramsJSONObj
    return instagramsJSONObj;
}) //getInstagramsJSON

.factory('isolateNewInstagrams', function ($rootScope, newInstagramsService) {
   var instagramsToAdd = [];
   var instagramsToAddObj = {
       iterateInstagrams: function () {
           return newInstagramsService.fetchNewInstagrams().then(function (newInstagramsObj) {
               var newInstagrams = newInstagramsObj;
               var newInstagramsLength = newInstagramsObj.length;
               for (var i = 0; i < (newInstagrams.length); i++) {
                   var instagramID = newInstagrams[i].InstagramDate;
                   if (_.findWhere($rootScope.oldInstagrams, {InstagramDate: instagramID})) {
                       console.log("THIS INSTAGRAM ALREADY EXISTS");
                       console.log(instagramID);
                   } else {
                       console.log("A NEW INSTAGRAM WAS FOUND");
                       console.log(instagramID);
                       instagramsToAdd.push(instagramID);
                   }//end if statement
               }//end for loop
               console.log("I AM instagramsToAdd");
               console.log(instagramsToAdd.length);
           });//end return newInstagramsService
       }//iterateInstagrams
   };//instagramsToAddObj
   return instagramsToAddObj;
})//isolateNewInstagrams

.factory('instagramsCompare', function($rootScope, $q, newInstagramsService) {
   var compareObj = {
       compareInstagrams: function() {
           return newInstagramsService.fetchNewInstagrams().then(function(newInstagramsObj){
               var newOrNotNew = angular.equals(newInsagramsObj, $rootScope.oldInstagrams);
               //var newOrNotNew = newInstagramsObj.length - $rootScope.oldTweets.length;
               $rootScope.oldInstagrams = newInstagramsObj;
               return newOrNotNew;
           });//return
       }//compareInstagrams
   }; //compareObj
   return compareObj;
}) //checkForNewInstagrams

.factory('newInstagramsService', function($http, $routeParams, $rootScope, $q) {
   var group_name = $routeParams.groupName;
   var group_data = './data/'+group_name+'_instagrams.json';
   var newInstagramsObj = {
       fetchNewInstagrams: function() {
           console.log("newInstagramsService IS WATCHING newData");
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
       }//fetchNewInstagrams
   };//newInstagramsObj
   return newInstagramsObj;
})	//end newInstagramsService factory

.factory('addNewInstagramsService', function($rootScope, isolateNewInstagrams) {
   var addTheseInstagrams = ["610557817343377408", "610048807984852992"];
   var addInstagramsLength = addTheseInstagrams.length;
   var addNewInstagramsObj = {
       addNewInstagrams: function() {
           for(var i = 0; i < (addInstagramsLength); i++) {
           } //for loop
       } // addNewInstagrams
   }; // addNewInstagramsObj
   return addNewInstagramsObj;
});//addNewInstagramsService