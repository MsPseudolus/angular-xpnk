angular.module('xpnkApp', [
    'xpnkApp.controllers',
    'xpnkApp.services',
    'xpnkApp.directives',
    'ngSanitize',
    'ngAnimate',
    'ngRoute'])

.config(function($routeProvider){
    $routeProvider
        .when('/hello',{
            templateUrl: 'hello.html'
        })
        .when('/group/:groupName',{
            templateUrl: 'group.html'
        });
});