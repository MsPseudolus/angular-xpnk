angular.module('xpnkApp', [
    'xpnkApp.controllers',
    'xpnkApp.services',
    'xpnkApp.directives',
    'ngSanitize',
    'ngAnimate',
    'ngRoute',
    'ui.router',
    'ngAnimate',
    'oauthio',
    'ngResource'])

.config(function($routeProvider, $stateProvider, $urlRouterProvider){
    $routeProvider
        .when('/group/:groupName',{
            templateUrl: 'group.html'
        })
        .when('/group/:groupName/invite',{
            templateUrl: 'invite.html'
        })
        .when('/about', {
            templateUrl: 'hello-world.html'
        })
        .when('/group/:groupName/:instaCode',{
            templateUrl: 'group.html'
        });

    $stateProvider.state('sixtyseconds', {
      templateUrl: 'sixtyseconds.html'
    })
    $stateProvider.state('invite-reminder', {
        templateUrl: 'invite-reminder.html'
    }) 
    $stateProvider.state('twit-user-auth', {
        templateUrl: 'twit-user-auth.html'
    })
    $stateProvider.state('insta-user-auth', {
        templateUrl: 'insta-user-auth.html'
    })
    $stateProvider.state('invite-great-job', {
        templateUrl: 'invite-great-job.html'
    });
});
