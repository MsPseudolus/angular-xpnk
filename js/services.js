angular.module('xpnkApp.services', [])

.filter("trust", ["$sce",
  function($sce) {
    return $sce.trustAsHtml;
}])

.filter("limitHtml", 
  function(embed, limit) {
    return embed > limit ? embed.substr (0, limit - 1) : embed;
})

//TODO Add filters to return the post counts to display in the various network buttons
//instead of having all that logic in the view.

/*********************************************************************
 * XPNK AUTH SERVICES
 *********************************************************************/

 .factory('headerInterceptor', function ($q, $localStorage, xpnk_api) {
    return {
      'request': function(config) {
        var reqURL = config.url;
        if ( reqURL.match(xpnk_api) ) {
            config.headers.token = $localStorage.xpnkToken;
            config.headers.xpnkid = $localStorage.xpnkID;
            }  
        return config;        
      }
    }
  })  

.factory('xpnkAuth', function($http, $resource, $localStorage, xpnk_api) {
  var auth = {};

  auth.Login = Login;
  auth.Logout = Logout;
  auth.Auth = Auth;
  auth.Get_xpnkid = Get_xpnkid;

  return auth;

  var xpnk_token = "";

  function Login(){
    var get_token = xpnk_api + 'xpnk_auth_set';
    return $http({method: 'GET', url: get_token}).success(function(data){
      xpnk_token = data;
      if (xpnk_token != "") {
          $localStorage.xpnkToken = xpnk_token;
        } else {
          console.log("No token was issued.");
        }
    });
  }

  function Logout() {
    delete $localStorage.xpnkToken;
  }     

  function Auth() {
    var check_token = {
      method: 'POST',
      url: xpnk_api + 'xpnk_auth_check',
      headers: {
        'token' : $localStorage.xpnkToken,
      },
    }
    var response = $http(check_token).success(function(data, status, headers){
      console.log("Authentication successful: " + status);
    })
    .error(function(data,status,headers){
      console.log("The token was not authenticated: " + status);
    });
    return response;
  }

  function Get_xpnkid(slackerid) {
    var this_xpnk_id = $http({method: 'GET', url: xpnk_api + 'get_xpnkid/slack/' + slackerid}).success(function(data){
      var xpnk_id = data.toString();
      if (xpnk_id != "" && xpnk_id != 'undefined') {
        $localStorage.xpnkID = xpnk_id;
       } else {
        console.log("xpnkID associated with SlackID wasn't returned or was returned empty from the database.")
       } 
    })
    .error(function(data,status){
      console.log("xpnkID wasn't retrieved from the database: " + status);
    });
  }  
})  

/*********************************************************************
 * SLACK SERVICES
 * this is the only xpnk user endpoint that doesn't require the xpnk
 * token, as it is an entry point for new users and checks the db for
 * the user's slack id before issuing an xpnk token
 *********************************************************************/
 .factory('slackTokenService', function ($resource, xpnk_api) {
    return $resource(xpnk_api + 'slack_new_member');
 })

/*********************************************************************
 * TWITTER SERVICES
 *********************************************************************/
 .factory('twitterTokenService', function ($resource, xpnk_api) {
    return $resource(xpnk_api + 'twitter_auth');
 })


.factory('getTweetsJSON', function ($http, $rootScope, $routeParams) {
    var data = [];

    var tweetsJSONObj = {
        getJSON: function(){
            var group_name = $routeParams.groupName;
            var group_data = './data/'+group_name+'_tweets.json';
            return $http({method: 'GET', url: group_data}).success(function(data){
                data = (data);
                $rootScope.checkdata = data;
            });//end GET
        }	// getJSON
    };	//tweetsJSONObj
    return tweetsJSONObj;
}) //getTweetsJSON

.filter ('memberTweets', function () {
  return function (thisData, xpnkID) {

    var tweeter = xpnkID;
    var myTweets;

    angular.forEach(thisData, function() {
      if (XpnkID === thisMember) {
        myTweets = TwitterPosts;
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
                    } else {
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

 .factory('igTokenService', function ($resource, xpnk_api) {
    return $resource(xpnk_api + 'ig_auth');
 })

.factory('getInstagramsJSON', function ($http, $rootScope, $routeParams) {
    var data = [];
    var instagramsJSONObj = {
        getJSON: function(){
            var group_name = $routeParams.groupName;
            var group_data = './data/'+group_name+'_instagrams.json';

            return $http({method: 'GET', url: group_data}).success(function(data){
                data = (data);
                $rootScope.checkIGdata = data;
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
                   } else {
                       instagramsToAdd.push(instagramID);
                   }//end if statement
               }//end for loop
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
           return $http.get(group_data).then(function(result){
               $rootScope.newData = result.data;
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
})//addNewInstagramsService

/*********************************************************************
 * DISQUS SERVICES
 *********************************************************************/

.factory('disqusTokenService', function ($resource, xpnk_api) {
    return $resource(xpnk_api + 'disqus_auth');
 })

.factory('getDisqusJSON', function ($http, $rootScope, $routeParams) {
    var data = [];
    var disqusJSONObj = {
        getJSON: function(){
            var group_name = $routeParams.groupName;
            var group_data = './data/'+group_name+'_disqus.json';

            return $http({method: 'GET', url: group_data}).success(function(data){
                data = (data);
                $rootScope.checkDisqusData = data;
            });//end GET
        } // getJSON
    };  //instagramsJSONObj
    return disqusJSONObj;
}) //getInstagramsJSON