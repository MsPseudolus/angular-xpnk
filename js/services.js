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
 * XAPNIK AUTH SERVICES
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

.factory('xpnkAuth', function($http, $resource, $localStorage, $state, $q, $route, $routeParams, xpnk_api, GroupObj, MemberObj) {
  var auth = {};

  auth.Login            = Login;
  auth.Logout           = Logout;
  auth.TokenCheck       = TokenCheck;
  auth.GetGroup         = GetGroup;
  auth.InGroup          = InGroup;
  auth.Get_xpnkid       = Get_xpnkid;
  auth.AccessGroup      = AccessGroup;
  auth.GetGroupid       = GetGroupid;

  return auth;

  function AccessGroup() {

    group_id                      = undefined;

    var group                     = {};
        
    var return_val                = undefined;

    var xpnk_token                = $localStorage.xpnkToken;

    var uid                       = $localStorage.xpnkID;

    var deferred = $q.defer();

    if ( TokenIDCheck( xpnk_token, uid ) == true ) {
      TokenCheck().then( function( data ){
        if ( data == 200 ) {
          if ( group_id == undefined ) {
            GetGroupid().then (function ( result ){
              group_id            = result.data;
              GetGroup( group_id ).then( function( response ){
                group             = response;
                if ( InGroup( group ) != 3 ) {
                return_val        = true;
                deferred.resolve( return_val );
                } else {
                  //user not in group
                  console.log("We didn't find your userID in this group. Have you received and accepted an invitation?")
                  return_val      = false;
                  deferred.resolve( return_val );
                }
              });
            })
          } 
        }
      });
    } else {
      console.log( "Looks like you need to login. If you haven't accepted an invitation to this group, you'll need to do that first.");
      return_val = false;
      deferred.resolve( return_val );
    }  
  return deferred.promise;  
  }  

  function TokenIDCheck ( xpnk_token, uid ) {
    if ( ( xpnk_token != undefined ) && ( uid != undefined ) ) {
      return true;
    } else {
      return false;
    }
  }

  function Login(){
    var get_token           = xpnk_api + 'xpnk_auth_set';
    var xpnk_group          = GroupObj.getObjID().toString();
    var xpnk_id             = MemberObj.data.User_ID.toString();
    
    return $http({method: 'GET', url: get_token}).success(function(data){
      xpnk_token          = data;
      if (xpnk_token != "") {
        $localStorage.xpnkToken = xpnk_token;
        $localStorage.xpnkGroup = xpnk_group;
        $localStorage.xpnkID = xpnk_id;
      } else {
          console.log("No token was issued. Something might be wrong with the token api.");
        }
    });
  }

  function Logout() {
    delete $localStorage.xpnkToken;
  }     

  function TokenCheck() {
    if ($localStorage.xpnkToken) {
      return $http.post('http://localhost:9090/api/v1/xpnk_auth_check', {headers:{'token' : $localStorage.xpnkToken}})             
      .then( function( response ){
          var user                    = $localStorage.xpnkID;
          return response.status;
      }, function( response ) {
        console.log( "The token wasn't validated: " , response.data );
        return $q.reject( response.data );
        }
      );
    } else {
      console.log( "No token? " + $localStorage.xpnkToken );
      return $q.reject( 0 );
    }
  } 

  function GetGroupid() {
    var group_name              = $route.current.params.groupName;

    return $http({ method: 'GET', url: xpnk_api + 'groups/id/' + group_name })
      .success( function ( data ){
          var groupid = data;
          if ( groupid != "" && groupid != 'undefined' ) {
            $localStorage.xpnkGroup = groupid;
            return groupid;
          } else {
            console.log("GroupID associated with group name wasn't returned or was returned empty from the database.")
          } 
      })
      .error( function( data ){
          console.log("GroupID wasn't retrieved from the database: " + status);
          return 0;
      });
  }

  function GetGroup ( group_id ){
    var user                        = $localStorage.xpnkID;
    return $http({ method: 'GET', url: xpnk_api + 'groups/members/' + group_id })
      .then( function ( data ){
          group = data.data;
          return group;
      }, function( error ){
          console.log( "Failed to get the group: " , error );
          group = error;
          return group;
      });
  }  

  function InGroup ( group_array ) {
    if ( $localStorage.xpnkID ) {
      var user                    = $localStorage.xpnkID;
    } else {
      return 0;
    }
    var return_value = ( function() {
      var thisvalue             = 3;
      var user_int              = parseInt( user, 10 );
      var userIndexValue        = group_array.indexOf( user_int, 0 );
        if ( userIndexValue != -1 ) {
          thisvalue = user;
          return thisvalue;
        } else {
           console.log( "The user wasn't found in the group. indexOf returned: " , thisvalue );
           return thisvalue;    
        }
    }); 
    return return_value();
  }

  function Get_xpnkid(slackerid) {
    var this_xpnk_id = $http({method: 'GET', url: xpnk_api + 'get_xpnkid/slack/' + slackerid})
      .success(function(data){
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

.factory("messageService", function($q){
    return {
        getMessage: function(){
            return $q.when("Hello World!");
        }
    };
})

/*********************************************************************
 * XAPNIK NEW GROUP MEMBER SERVICES
 *********************************************************************/

.factory('GroupObj', function() {

  return {

    data: {
      group_id:         '',
      group_name:       '',
      group_source:     ''
    },

    setObj: function (groupObject, groupSource) {
      this.data.group_id = groupObject.GroupID;
      this.data.group_name = groupObject.GroupName;
      this.data.group_source = groupSource;
    },

    getObjID: function () {
      return this.data.group_id;
    },
    getObjName: function() {
      return this.data.group_name;
    },
    getObj: function() {
      return this.data;
    }
  };
})

.factory( 'MemberObj', function() {
  return {
    data: {
      User_ID         : ' ',
      Slack_name      : ' ',
      Slack_ID        : ' ',
      Slack_avatar    : ' ',
      Twitter_user    : ' ',
      Twitter_ID      : ' ',
      Twitter_token   : ' ',
      Twitter_secret  : ' ',
      Insta_user      : ' ',
      Insta_userid    : ' ',
      Insta_token     : ' ',
      Disqus_username : ' ',
      Disqus_userid   : ' ',
      Disqus_token    : ' ',
      Profile_image   : ' '
    },

    createObj: function () {
      this.data.User_ID         = '',
      this.data.Twitter_user    = '',
      this.data.Twitter_ID      = '',
      this.data.Twitter_token   = '',
      this.data.Twitter_secret  = '',
      this.data.Insta_user      = '',
      this.data.Insta_userid    = '',
      this.data.Insta_token     = '',
      this.data.Disqus_username = '',
      this.data.Disqus_userid   = '',
      this.data.Disqus_token    = '',
      this.data.Profile_image   = ''
    },

    updateObj: function ( userObject ) {
      if ( userObject.User_ID ) {this.data.User_ID = userObject.User_ID};
      if ( userObject.Slack_name ) {this.data.Slack_name = userObject.Slack_name};
      if ( userObject.Slack_ID ) {this.data.Slack_ID = userObject.Slack_ID};
      if ( userObject.Slack_avatar ) {this.data.Slack_avatar = userObject.Slack_avatar};
      if ( userObject.Twitter_user ) {this.data.Twitter_user = userObject.Twitter_user};
      if ( userObject.Twitter_ID ) {this.data.Twitter_ID = userObject.Twitter_ID};
      if ( userObject.Twitter_token ) {this.data.Twitter_token  = userObject.Twitter_token};
      if ( userObject.Twitter_secret ) {this.data.Twitter_secret  = userObject.Twitter_secret};
      if ( userObject.Insta_user ) {this.data.Insta_user  = userObject.Insta_user};
      if ( userObject.Insta_userid ) {this.data.Insta_userid = userObject.Insta_userid};
      if ( userObject.Insta_token ) {this.data.Insta_token = userObject.Insta_token};
      if ( userObject.Disqus_username ) {this.data.Disqus_username = userObject.Disqus_username};
      if ( userObject.Disqus_userid ) {this.data.Disqus_userid = userObject.Disqus_userid};
      if ( userObject.Disqus_token ){this.data.Disqus_token = userObject.Disqus_token};
      if ( userObject.Profile_image ) {this.data.Profile_image = userObject.Profile_image};
    },

    emptyObj: function () {
      this.data.User_ID         = '',
      this.data.Twitter_user    = '',
      this.data.Twitter_ID      = '',
      this.data.Twitter_token   = '',
      this.data.Twitter_secret  = '',
      this.data.Insta_user      = '',
      this.data.Insta_userid    = '',
      this.data.Insta_token     = '',
      this.data.Disqus_username = '',
      this.data.Disqus_userid   = '',
      this.data.Disqus_token    = '',
      this.data.Profile_image   = ''
    },

    getObj: function () {
      return this.data;
    }
  }  
})

.factory ("InsertNewUser", function($http, $q, xpnk_api){
  return ({
    insert: insert
  });

  function insert ( data ) {
    var request = $http({
      method: "post",
      url: xpnk_api + 'users/new',
      data: data 
    });
    return( request.then(  handleSuccess, handleError ) );
  }
  function handleError( response ) {
    if( ! angular.isObject( response.data ) || ! response.data.message ){
      return( $q.reject( "An unkown error occurred." ) );
    }
    return( $q.reject( response.data.message ) );
  }

  function handleSuccess( response ){
    console.log( "InsertNewUser response:  " + JSON.stringify( response ));
    return( response.data );
  }
})  

  .factory ("UpdateUser", function( $http, $q, xpnk_api ) {
    return ({
      update: update
    });
    function update ( data ) {
    var request = $http({
      method: "post",
      contentType: "application/json",
      url: xpnk_api + 'users/update',
      data: data 
    });
    return( request.then(  handleSuccess, handleError ) );
  }
  function handleError( response ) {
    if( ! angular.isObject( response.data ) || ! response.data.message ){
      return( $q.reject( "An unkown error occurred." ) );
    }
    console.log( "Update user failed. Response:  " + response );
    return( $q.reject( response.data.message ) );
  }

  function handleSuccess( response ){
    console.log( "UpdateUser response:  " + JSON.stringify( response ));
    return( response.data );
  }
})  

  
.factory("AddMemberToGroup", function($http, $q, xpnk_api){
  return ({
    addMember: addMember
  });

  function addMember ( id, userId ) {
    console.log( "addMember thinks it's adding this user to the group: " + userId);
    var request = $http({
      method: "post",
      url: xpnk_api + 'groups/add',
      data: {
        id: id,
        userId: userId
      }
    });
    return( request.then( handleSuccess, handleError ) );
  }
  function handleError( response ) {
    if( ! angular.isObject( response.data ) || ! response.data.message ){
      return( $q.reject( "An unknown error occurred." ) );
    }
    return( $q.reject( response.data.message ) );
  }

  function handleSuccess( response ){
    console.log( "AddMemberToGroup response:  " + JSON.stringify( response ));
    return( response.data );
  }
})


/*********************************************************************
 * SLACK SERVICES
 *********************************************************************/

//this is the only xpnk user endpoint that doesn't require the xpnk
//token, as it is an entry point for new users and checks the db for
//the user's slack id before issuing an xpnk token
 .factory('slackTokenService', function ($resource, xpnk_api) {
    return $resource(xpnk_api + 'slack_new_member');
 })

 .factory('slackGroupTokenService', function($resource) {
    return $resource('https://slack.com/api/oauth.access');
 })

 .factory('newGroupFromSlackService', function ($resource, xpnk_api) {
    return $resource(xpnk_api + 'slack_new_group');
 })

/*********************************************************************
 * TWITTER SERVICES
 *********************************************************************/
 .factory('twitterAuthService', function ($resource, xpnk_api) {
    return $resource(xpnk_api + 'twitter_auth');
 })
 .factory('userByTwitterService', function ($resource,xpnk_api) {
    return $resource(xpnk_api + 'users/twitter?id=:id', {id:'@id'})
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