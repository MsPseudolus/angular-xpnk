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

//displays the tweets on the page
.directive('embedTemplate', function($interpolate) {
    return {
        link: function($scope, $element, $attr){
            twttr.widgets.createTweet($attr.id,$element [0],{ align: 'left' });
        }
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