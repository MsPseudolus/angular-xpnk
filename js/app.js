angular.module('xpnkApp', [
    'xpnkApp.controllers',
    'xpnkApp.services',
    'xpnkApp.directives',
    'ngSanitize',
    'ngAnimate',
    'ngRoute',
    'ui.router',
    'ngStorage',
    'oauthio',
    'ngResource',
    'Deg.SlackApi',
    'xpnkConstants',
    'semantic.modals'])

.config  (function( $routeProvider, $stateProvider, $urlRouterProvider, $httpProvider){
    $routeProvider
         /*
        .when('/',{
            templateUrl: 'welcome.html'
        })
        */
        .when('/group/:groupName',{
            templateUrl: 'group.html',
            resolve: {

                function ( $q, xpnkAuth, $route, $location ) {

                   var deferred        = $q.defer();
                   var group_name      = $route.current.params.groupName;

                   xpnkAuth.AccessGroup().then( function ( response ){
                    if ( response != true) {
                        console.log( "AccessGroup return != true", response );
                        $location.path( '/group/'+group_name+'/reg-login' );
                        deferred.reject();
                    } else {
                        deferred.resolve();
                    }
                   });                    
                    return deferred.promise;
                }
               
            }             
              
        })
        .when('/group/:groupName/invite',{
            templateUrl: 'invite.html'
        })
        .when('/group/:groupName/reg-login',{
            templateUrl: 'group-reg-login.html'
        })    
        .when('/group/:groupName/slack-invite', {
            templateUrl: 'slack-invite.html'
        })
        .when('/about', {
            templateUrl: 'hello-world.html'
        })
        .when('/welcome', {
            templateUrl: 'welcome.html'
        })
        .when('/added_to_Slack', {
            templateUrl: 'added-to-Slack.html'
        })
        .when('/added_to_Slack_ii', {
            templateUrl: 'added-to-Slack_ii.html'
        })
        .when('/privacy-and-terms', {
            templateUrl: 'terms.html'
        })
        ;

    $stateProvider.state('sixtyseconds', {
      templateUrl: 'sixtyseconds.html'
    })
    $stateProvider.state('invite-reminder', {
        templateUrl: 'invite-reminder.html'
    }) 
    $stateProvider.state('reg-login', {
        templateUrl: 'reg-login.html'
    }) 
    $stateProvider.state('twit-user-auth', {
        templateUrl: 'twit-user-auth.html'
    })
    $stateProvider.state('insta-user-auth', {
        templateUrl: 'insta-user-auth.html'
    })
    $stateProvider.state('disqus-user-auth', {
        templateUrl: 'disqus-user-auth.html'
    })
    $stateProvider.state('twit-user-auth-build', {
        templateUrl: 'twit-user-auth-build.html'
    })
    $stateProvider.state('insta-user-auth-build', {
        templateUrl: 'insta-user-auth-build.html'
    })
    $stateProvider.state('disqus-user-auth-build', {
        templateUrl: 'disqus-user-auth-build.html'
    })
    $stateProvider.state('invite-great-job', {
        templateUrl: 'invite-great-job.html'
    })
    $stateProvider.state('one-moment',{
        templateUrl: 'one-moment.html'
    });

    $httpProvider.interceptors.push('headerInterceptor');
})
