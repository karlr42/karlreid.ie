'use strict';

/**
 * @ngdoc overview
 * @name karlreidieApp
 * @description
 * # karlreidieApp
 *
 * Main module of the application.
 */
angular
  .module('karlreidieApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'karlr42.angular-copyright'
  ])
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('')
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/contact', {
        templateUrl: 'views/contact.html',
        controller: 'ContactCtrl',
        controllerAs: 'contact'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
