/* global angular */

'use strict';

/* Services */

var appServices = angular.module('appServices', ['ngResource'])
    .service("MapService", function ($http, $q) {
        return {
            getReverseCoding: function (latitude,longitude) {
                var deffered = $q.defer();
                $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," + longitude).then(function (results) {
                    deffered.resolve(results.data.results);
                })
                return deffered.promise;
            }
        }
    })