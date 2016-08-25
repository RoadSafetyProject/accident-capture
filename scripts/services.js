/* global angular */

'use strict';

/* Services */

var appServices = angular.module('appServices', ['ngResource'])
    .service("MapService", function ($http, $q) {
        return {
            getReverseCoding: function (latitude, longitude) {
                var deffered = $q.defer();
                $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," + longitude).then(function (results) {
                    deffered.resolve(results.data.results);
                })
                return deffered.promise;
            }
        }
    })
    .service("FileReader", function ($q) {
        return {

            onLoad: function (reader, deferred, scope) {
                return function () {
                    scope.$apply(function () {
                        deferred.resolve(reader.result);
                    });
                };
            },

            onError: function (reader, deferred, scope) {
                return function () {
                    scope.$apply(function () {
                        deferred.reject(reader.result);
                    });
                };
            },

            onProgress: function (reader, scope) {
                return function (event) {
                    scope.$broadcast("fileProgress",
                        {
                            total: event.total,
                            loaded: event.loaded
                        });
                };
            },

            getReader: function (deferred, scope) {
                var reader = new FileReader();
                reader.onload = this.onLoad(reader, deferred, scope);
                reader.onerror = this.onError(reader, deferred, scope);
                reader.onprogress = this.onProgress(reader, scope);
                return reader;
            },

            readAsDataUrl: function (file, scope) {
                var deferred = $q.defer();

                var reader = this.getReader(deferred, scope);
                reader.readAsDataURL(file);

                return deferred.promise;
            }
        };
    })