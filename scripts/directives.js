'use strict';

/* Directives */

var appDirectives = angular.module('appDirectives', [])
    .directive('dateFormatter',function(dateFilter,$parse){
        return{
            restrict:'EAC',
            require:'?ngModel',
            link:function(scope,element,attrs,ngModel,ctrl){
                ngModel.$parsers.push(function(viewValue){
                    return dateFilter(viewValue,'yyyy-MM-dd');
                });
            }
        }
    })
    .directive('elementInput', function () {

        var controller = ['$scope', 'iRoadModal', '$uibModal','$log', function ($scope, iRoadModal, $uibModal,$log) {
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
            $scope.show = function(program,event){
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'views/details.html',
                    controller: 'DetailController',
                    size: "sm",
                    resolve: {
                        event: function () {
                            return event;
                        },
                        program:function(){
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
                    loading:true,
                    programs:[],
                    data:[],
                    searchRelations:function(value){
                        this.feedback = {status:"LOADING"};
                        var self = this;
                        return iRoadModal.get($scope.dataElement.name.replace(iRoadModal.refferencePrefix,""),
                            {filter:{left:this.dataElement.id,operator:"LIKE",right:value}}).then(function(results){
                            self.feedback = {};
                            self.data = results;
                        })
                    },
                    setDataElement:function(dataElementName){
                        this.feedback = {status:"LOADING"};
                        var self = this;
                        iRoadModal.getRelationship(dataElementName).then(function(dataElement){
                            self.dataElement = dataElement;
                            iRoadModal.getProgramByName(dataElementName.replace(iRoadModal.refferencePrefix,"")).then(function(program){
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
