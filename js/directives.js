angular.module('xpnkApp.directives', [])

.directive('thisTweet', function($filter) {
    return {
        scope: { 
            xpnkID: '@',
            filter: '@',
            thisTweet: '=',
            link: function(xpnkID){console.log("xpnkID fr dir:"); console.log(xpnkID);}
        },
        template: '<div ng-repeat="Tweet in thisTweet | filter:filter" embed-template>' + '{{Tweet.TweetID}}' + '</div>'
    }
})

.directive('embedTemplate', function($interpolate) {
    return {
        link: function($scope, $element, $attr){
            twttr.widgets.createTweet($attr.id,$element [0],{ align: 'left' })
            .then( function ( el ) {
                $scope.tweetHasLoaded = true;
                $scope.$digest();
                console.log('Tweet added.');
            });
        }
    }
})

.directive('twintents', function() {
    return {
        template: '<div class="twintents" ng-if="tweetHasLoaded"><span><a href="https://twitter.com/intent/retweet?tweet_id={{thistweet.TweetID}}"><span class="icon-retweet-button"></span></a></span><span><a href="https://twitter.com/intent/tweet?in_reply_to={{thistweet.TweetID}}"><span class="icon-reply"></span></a></span></div>'
    }
})

.directive('memberposts', function($compile, $timeout, $templateRequest){
     return{
            templateUrl: 'group-member-posts.html'
     }
})

.directive('twender', function($compile, $timeout, $templateRequest){
    return{
        templateUrl: 'xpnk-tweets.html'
    }
})

.directive ('instarender', function($compile, $timeout, $templateRequest) {
	return {
		templateUrl: 'xpnk-instagrams.html'
    }
})

.directive ('disqusrender', function($compile, $timeout, $templateRequest) {
    return {
        templateUrl: 'xpnk-disqus.html'
    }
})
/* 
* It's necessary to delay the execution of the instagram script, 
* otherwise it runs before the embeds are fully loaded
*/
.directive ('processInsta', function($interpolate, $timeout){
    return {
        link: function($scope, $element, $attr, scope, element, attrs) {
            $timeout(function() {
                instgrm.Embeds.process();
            }, 50)
        }    
    }
})

/*
* 
* Onboarding process directives
*
*/
.directive('welcome', function($compile, $timeout, $templateRequest){
    return {
        templateUrl: 'welcome.html'
    }
})

.directive('grouplogin', function($compile, $timeout, $templateRequest){
    return {
        templateUrl: 'reg-login.html'
    }
})

.directive('sixtyseconds', function($compile, $timeout, $templateRequest){
    return {
        templateUrl: 'sixtyseconds.html'
    }
})