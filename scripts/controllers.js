/* global angular */

'use strict';

/* Controllers */
var appControllers = angular.module('appControllers', ['iroad-relation-modal'])

    .controller('MainController', function (NgTableParams,iRoadModal, $scope,$uibModal,$log) {
        $scope.loading = true;
        $scope.tableParams = new NgTableParams();
        $scope.params ={pageSize:20};

        $scope.data = {
            accidentBasicInformation : {},
            basicInformationVisibility : false
        };

        $scope.programName = "Accident";

        /**
         * createColumns
         * @param programStageDataElements
         * @returns {Array}
         */
        function createColumns(programStageDataElements) {
            var cols = [];
            if (programStageDataElements){
                programStageDataElements.forEach(function (programStageDataElement) {
                    var filter = {};
                    filter[programStageDataElement.dataElement.name.replace(" ","")] = 'text';
                    cols.push({
                        field: programStageDataElement.dataElement.name.replace(" ",""),
                        title: programStageDataElement.dataElement.name,
                        headerTitle: programStageDataElement.dataElement.name,
                        show: programStageDataElement.displayInReports,
                        sortable: programStageDataElement.dataElement.name.replace(" ",""),
                        filter: filter
                    });
                })
            }
            cols.push({
                field: "",
                title: "Action",
                headerTitle: "Action",
                show: true
            });
            return cols;
        }

        getAccidents();
        function getAccidents(){
            iRoadModal.getAll($scope.programName,$scope.params).then(function(results){
                $scope.tableParams.settings({
                    dataset: results
                });
                $scope.loading = false;
                iRoadModal.getProgramByName($scope.programName).then(function(program){
                    $scope.program = program;
                    $scope.tableCols = createColumns(program.programStages[0].programStageDataElements);
                })
            },function(){
                $scope.loading = false;
            })
        }

        $scope.showDetails = function(event){
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
                        return $scope.program;
                    }
                }
            });

            modalInstance.result.then(function (resultItem) {
                iRoadModal.setRelations(event).then(function(){

                });
            }, function () {
                iRoadModal.setRelations(event).then(function(){

                });
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.showEdit = function(event){
            $scope.data.basicInformationVisibility = false;
            $scope.data.accidentBasicInformation = {};
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'views/addedit.html',
                controller: 'EditController',
                size: "lg",
                resolve: {
                    event: function () {
                        return event;
                    },
                    program:function(){
                        return $scope.program;
                    },
                    otherData :function(){
                        return $scope.data
                    }
                }
            });

            modalInstance.result.then(function (response) {
                var resultEvent = response.result;
                console.log(response);
                $scope.tableParams.data.forEach(function(event){
                    if(event.event == resultEvent.event){
                        Object.keys(event).forEach(function(key){
                            event[key] = resultEvent[key];
                        })

                    }
                });
                $scope.tableParams.reload();
            }, function () {
                iRoadModal.setRelations(event).then(function(){

                });
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
        $scope.showAddNew = function(){
            var event = {};
            $scope.data.basicInformationVisibility = true;
            $scope.data.accidentBasicInformation = {};
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'views/addedit.html',
                controller: 'EditController',
                size: "lg",
                resolve: {
                    event: function () {
                        return event;
                    },
                    program:function(){
                        return $scope.program;
                    },
                    otherData :function(){
                        return $scope.data
                    }
                }
            });

            modalInstance.result.then(function (response) {
                var resultEvent = response.result;
                $scope.data = response.data;
                $scope.data.basicInformationVisibility = false;
                if(resultEvent.event){
                    $scope.tableParams.data.push(resultEvent);
                    if(parseInt($scope.data.accidentBasicInformation.numberOfVehicle)>0){
                        $scope.addRelationData("Accident Vehicle",resultEvent,true);
                    }else if(parseInt($scope.data.accidentBasicInformation.numberOfWitness)>0){
                        $scope.addRelationData("Accident Witness",resultEvent,false);
                    }
                }
            }, function () {

            });
        };


        $scope.addRelationData = function (relationName,event,shouldAddRelation){
            iRoadModal.getProgramByName(relationName).then(function(program){
                program.displayName = $scope.program.displayName + " - " + relationName;
                iRoadModal.getRelationshipDataElementByProgram(iRoadModal.refferencePrefix + $scope.programName,program).then(function(dataElement){
                    var relationEvent = {};
                    iRoadModal.initiateEvent(relationEvent,program).then(function(newEvent){
                        newEvent.dataValues.forEach(function(dataValue,index){
                            if(dataValue.dataElement == dataElement.id){
                                if(dataValue.dataElement == dataElement.id){
                                    dataValue.value = event.event;
                                }
                            }
                        });
                        var modalInstance = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'views/addedit.html',
                            controller: 'EditController',
                            size: "lg",
                            resolve: {
                                event: function () {
                                    return newEvent;
                                },
                                program:function(){
                                    return program;
                                },
                            otherData :function(){
                                return $scope.data
                            }
                            }
                        });
                        modalInstance.result.then(function (resultEvent) {
                            console.log('Event added',resultEvent);
                            if(parseInt($scope.data.accidentBasicInformation.numberOfWitness)>0 && shouldAddRelation){
                                $scope.addRelationData("Accident Witness",resultEvent,false);
                            }
                        }, function () {
                            $log.info('Relation Modal dismissed at: ' + new Date());
                        });
                    });
                });
            });
        };

    })
    .controller('DetailController', function (iRoadModal, $scope,$uibModalInstance,program,event) {
        $scope.loading = true;
        iRoadModal.getRelations(event).then(function(newEvent){
            $scope.event = newEvent;
            $scope.loading = false;
        });
        $scope.program = program;
        $scope.ok = function () {
            $uibModalInstance.close({});
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    })
    .controller('EditController', function (NgTableParams,iRoadModal, $scope,$uibModalInstance,program,event,otherData) {
        iRoadModal.initiateEvent(event,program).then(function(newEvent){
            $scope.event = newEvent;
            $scope.loading = false;
            $scope.getDataElementIndex = function(dataElement){
                var index = "";
                $scope.event.dataValues.forEach(function(dataValue,i){
                    if(dataValue.dataElement == dataElement.id){
                        index = i;
                    }
                });
                return index;
            }
        });
        $scope.program = program;
        $scope.data = otherData;
        $scope.save = function () {
            $scope.loading = true;
            console.log($scope.event);
            iRoadModal.save($scope.event,$scope.program).then(function(result){
                $scope.loading = false;
                $uibModalInstance.close({result:result,data:$scope.data });
            },function(error){
                $scope.loading = false;
            });
        };

        $scope.cancel = function () {
            iRoadModal.setRelations($scope.event).then(function(){
                $uibModalInstance.close({result:{},data:$scope.data });
            })
        };
    });
