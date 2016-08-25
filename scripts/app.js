'use strict';

/* App Module */

var app = angular.module('app',
                    ['ui.bootstrap', 
                     'ngRoute', 
                     'ngCookies', 
                     'ngSanitize',
                     'appDirectives', 
                     'appControllers','angularLocalStorage','ui.select',
                     'appServices',
                     'appFilters',
                     'd2Services',
                     'd2Controllers',
                     'pascalprecht.translate',
                     'd2HeaderBar','ngTable','toaster','eventCaptureServices','ui-leaflet','camera'])
              
.value('DHIS2URL', '/dhis2/')

.config(function($translateProvider,$routeProvider) {
	
	$routeProvider.when('/', {
        templateUrl: 'views/home.html',
        controller: 'MainController'
    }).otherwise({
        redirectTo : '/'
    });
     
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escaped');
    $translateProvider.useLoader('i18nLoader');
});
