'use strict';

/* Directives */

var appDirectives = angular.module('appDirectives', [])
    .directive('dateFormatter', function (dateFilter, $parse) {
        return {
            restrict: 'EAC',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel, ctrl) {
                ngModel.$parsers.push(function (viewValue) {
                    return dateFilter(viewValue, 'yyyy-MM-dd');
                });
            }
        }
    })
    .controller('LocationSelectorController', function (iRoadModal, $scope, $uibModalInstance, program, coordinate, MapService) {
        var latitude = -6.3690;
        var longitude = 34.8888;
        if (coordinate) {
            latitude = coordinate.latitude;
            longitude = coordinate.longitude;
        }
        angular.extend($scope, {
            center: {
                lat: latitude,
                lng: longitude,
                zoom: 5
            }, events: {
                map: {
                    enable: ['zoomstart', 'drag', 'click', 'mousemove'],
                    logic: 'emit'
                }
            }
        });
        $scope.markers = {
            m1: {
                lat: latitude,
                lng: longitude,
                message: "I'm a static marker",
                icon: {},
                draggable: true
            }
        }
        $scope.$on('leafletDirectiveMarker.dragend', function (event, marker) {
            console.log(marker);
            $scope.markers.m1.lat = marker.model.lat;
            $scope.markers.m1.lng = marker.model.lng;
            MapService.getReverseCoding($scope.markers.m1.lat, $scope.markers.m1.lng).then(function (results) {
                $scope.address = results;
            })
        });
        $scope.setLocation = function () {
            var coordinate = {
                latitude: $scope.markers.m1.lat,
                longitude: $scope.markers.m1.lng
            };
            $uibModalInstance.close(coordinate);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .directive('locationSelector', function () {
        return {
            restrict: 'AEC',
            require: '^form',
            scope: {
                ngLocationModel: '='
            },
            template: '<div class="input-group"><input ng-model="address" type="text" class="form-control" aria-label="..."><div class="input-group-btn"><button type="button" class="btn btn-default dropdown-toggle" ng-click="chooseLocation()" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Choose Location</button></div><!-- /btn-group --> </div>',
            controller: function ($scope, $uibModal, MapService) {
                console.log($scope);
                console.log($scope['ngLocationModel']);
                $scope.$watch('ngLocationModel',function(){
                    if($scope.ngLocationModel){
                        MapService.getReverseCoding($scope.ngLocationModel.latitude, $scope.ngLocationModel.longitude).then(function (results) {
                            $scope.address = results[0].formatted_address;
                        })
                    }
                })
                if ($scope.ngModel) {

                }
                $scope.chooseLocation = function () {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'views/directives/location-selector.html',
                        controller: 'LocationSelectorController',
                        size: "lg",
                        resolve: {
                            coordinate: function () {
                                return $scope.ngModel;
                            },
                            program: function () {
                                return $scope.program;
                            }
                        }
                    });
                    modalInstance.result.then(function (coordinate) {
                        $scope.ngModel = coordinate;
                        MapService.getReverseCoding(coordinate.latitude, coordinate.longitude).then(function (results) {
                            $scope.address = results[0].formatted_address;
                        })
                    }, function () {
                    });
                }
            }
        }
    })
    .directive('elementInput', function () {

        var controller = ['$scope', 'iRoadModal', '$uibModal', '$log', function ($scope, iRoadModal, $uibModal, $log) {
            function getDayClass(data) {
                var date = data.date,
                    mode = data.mode;
                if (mode === 'day') {
                    var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                    for (var i = 0; i < $scope.events.length; i++) {
                        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                        if (dayToCheck === currentDay) {
                            return $scope.events[i].status;
                        }
                    }
                }
            }

            // Disable weekend selection
            function disabled(data) {
                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            }

            //iRoadModal.getDataElementByName($scope.ngDataElementName).then(function (dataElement) {
            $scope.show = function (program, event) {
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'views/details.html',
                    controller: 'DetailController',
                    size: "sm",
                    resolve: {
                        event: function () {
                            return event;
                        },
                        program: function () {
                            return program;
                        }
                    }
                });

                modalInstance.result.then(function (resultItem) {

                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            $scope.dataElement = $scope.ngProgramStageDataElement.dataElement;
            var numericalDataElementValueType = ["NUMBER","INTEGER","INTEGER_POSITIVE","INTEGER_NEGATIVE","INTEGER_ZERO_OR_POSITIVE"];
            if(numericalDataElementValueType.indexOf($scope.dataElement.valueType) != -1 ){
                if($scope.ngModel && $scope.ngModel.value != ""){
                    $scope.ngModel.value = parseInt($scope.ngModel.value);
                }
            }
            else if ($scope.dataElement.valueType == "FILE_RESOURCE") {
                $scope.readURL = function() {
                    console.log(arguments);
                    if (input.files && input.files[0]) {
                        var reader = new FileReader();

                        reader.onload = function (e) {
                            $('#blah')
                                .attr('src', e.target.result)
                                .width(150)
                                .height(200);
                        };

                        reader.readAsDataURL(input.files[0]);
                    }
                }
            }
            else if ($scope.dataElement.valueType == "DATE") {
                if($scope.ngModel && $scope.ngModel.value != ""){
                    $scope.ngModel.value = new Date(parseInt($scope.ngModel.value.substr(0,4)),parseInt($scope.ngModel.value.substr(5,2)) - 1,parseInt($scope.ngModel.value.substr(8)))

                }
                $scope.inlineOptions = {
                    customClass: getDayClass,
                    minDate: new Date(),
                    showWeeks: true
                };

                $scope.dateOptions = {
                    dateDisabled: disabled,
                    formatYear: 'yy',
                    maxDate: new Date(2020, 5, 22),
                    minDate: new Date(),
                    startingDay: 1
                };

                $scope.toggleMin = function () {
                    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
                    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
                };

                $scope.toggleMin();

                $scope.open1 = function () {
                    $scope.popup1.opened = true;
                };

                $scope.open2 = function () {
                    $scope.popup2.opened = true;
                };

                $scope.setDate = function (year, month, day) {
                    $scope.dt = new Date(year, month, day);
                };

                $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                $scope.format = $scope.formats[0];
                $scope.altInputFormats = ['M!/d!/yyyy'];

                $scope.popup1 = {
                    opened: false
                };

                $scope.popup2 = {
                    opened: false
                };
            }
            else if ($scope.dataElement.name.startsWith(iRoadModal.refferencePrefix)) {
                $scope.relation = {
                    loading: true,
                    programs: [],
                    data: [],
                    searchRelations: function (value) {
                        this.feedback = {status: "LOADING"};
                        var self = this;
                        return iRoadModal.get($scope.dataElement.name.replace(iRoadModal.refferencePrefix, ""),
                            {
                                filter: {
                                    left: this.dataElement.id,
                                    operator: "LIKE",
                                    right: value
                                }
                            }).then(function (results) {
                            self.feedback = {};
                            self.data = results;
                        })
                    },
                    setDataElement: function (dataElementName) {
                        this.feedback = {status: "LOADING"};
                        var self = this;
                        iRoadModal.getRelationship(dataElementName).then(function (dataElement) {
                            self.dataElement = dataElement;
                            iRoadModal.getProgramByName(dataElementName.replace(iRoadModal.refferencePrefix, "")).then(function (program) {
                                self.programs.push(program);
                                self.feedback = {};
                            })
                        })
                    }
                }
                $scope.relation.setDataElement($scope.dataElement.name)
            }
        }];
        return {
            restrict: 'AEC',
            require: '^form',
            scope: {
                ngModel: '=',
                ngProgramStageDataElement: '='
            },
            controller: controller,
            templateUrl: 'views/directives/elementInput.html'
        };
    })
    .controller('CameraController', function ($scope,$uibModalInstance) {

        $scope.setPhoto = function () {
            $uibModalInstance.close($scope.picture);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .directive("fileSelect",function() {
        return {
            scope: {
                ngModel: '=',
                event: '=',
                dhisDataElement: '='
            },
            controller:function($scope,$uibModal,FileReader,FileService,iRoadModal){
                console.log($scope)
                $scope.imageSrc = iRoadModal.getFileUrl($scope.event,$scope.dhisDataElement);
                $scope.getFile = function () {
                    $scope.progress = 0;
                    console.log($scope.file);
                    FileService.upload($scope.file).then(function(response){
                        alert("Should Be first");
                        console.log(response);
                    })
                    FileReader.readAsDataUrl($scope.file, $scope)
                        .then(function(result) {
                            $scope.imageSrc = result;
                        });
                };

                $scope.$on("fileProgress", function(e, progress) {
                    $scope.progress = progress.loaded / progress.total;
                });
                $scope.capturePhoto = function () {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'views/directives/camera.html',
                        controller: 'CameraController',
                        size: "lg"
                    });
                    modalInstance.result.then(function (photo) {
                        $scope.imageSrc = photo;
                    }, function () {
                    });
                }
            },
            templateUrl:"views/directives/fileInput.html"
        }
    })
    .directive("fileInput",function() {
        return {
            link: function ($scope, el) {
                el.bind("change",function (e) {
                    console.log(arguments);
                    $scope.file = (e.srcElement || e.target).files[0];
                    $scope.getFile();
                });
            }
        }
    })
