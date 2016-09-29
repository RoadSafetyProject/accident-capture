/* global angular */

'use strict';

/* Controllers */
var appControllers = angular.module('appControllers', ['iroad-relation-modal'])

    .controller('MainController', function (NgTableParams,iRoadModal, $scope,$uibModal,$log) {
        $scope.loading = true;
        $scope.tableParams = new NgTableParams();
        $scope.params ={pageSize:4};
        $scope.programName = "Accident";
        $scope.currentAccidentEvent = {};

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

            modalInstance.result.then(function (event) {
                iRoadModal.setRelations(event).then(function(){

                });
            }, function () {
                iRoadModal.setRelations(event).then(function(){

                });
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.showEdit = function(event){
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
                    otherData : function(){
                        return {
                            mode : 'edit'
                        }
                    }

                }
            });

            modalInstance.result.then(function (resultEvent) {
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
            $scope.currentAccidentEvent = {};
            var event = {};
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
                    otherData : function(){
                        return {
                            mode : 'add',
                            eventId : "",
                            programName : $scope.programName
                        }
                    }
                }
            });
            modalInstance.result.then(function (resultEvent) {
                if(resultEvent.event){
                    $scope.currentAccidentEvent = resultEvent;
                    $scope.tableParams.data.push(resultEvent);
                    $scope.addRelationData('Accident Vehicle',true);
                }
            }, function () {

            });
        };


        $scope.addRelationData = function (relationName,shouldAllowAddMore){
            iRoadModal.getProgramByName(relationName).then(function(program){
                iRoadModal.getRelationshipDataElementByProgram(iRoadModal.refferencePrefix + $scope.programName,program).then(function(dataElement){
                    var relationEvent = {};
                    relationEvent.dataValues = [];
                    relationEvent.dataValues.push({
                        dataElement :dataElement.id,
                        value : $scope.currentAccidentEvent.event
                    });
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'views/addedit.html',
                        controller: 'EditController',
                        size: "lg",
                        resolve: {
                            event: function () {
                                return relationEvent;
                            },
                            program:function(){
                                return program;
                            },
                            otherData : function(){
                                return {
                                    mode : 'addRelation',
                                    eventId : $scope.currentAccidentEvent.event,
                                    programName : $scope.programName,
                                    eventList : []
                                }
                            }
                        }
                    });
                    modalInstance.result.then(function (resultEvent) {
                        if(shouldAllowAddMore){
                            $scope.addRelationData("Accident Witness",false);
                        }else{
                            $log.info('Relation Modal dismissed at: ' + new Date());
                        }
                    }, function () {
                        $log.info('Relation Modal dismissed at: ' + new Date());
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
    .controller('EditController', function (NgTableParams,$uibModal,$log,iRoadModal, $scope,$uibModalInstance,program,event,otherData) {
        $scope.data = {};
        $scope.data.otherData = otherData;
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
        $scope.save = function () {
            $scope.loading = true;
            iRoadModal.save($scope.event,$scope.program).then(function(result){
                $scope.loading = false;
                $uibModalInstance.close(result);
            },function(error){
                $scope.loading = false;
            });
        };

        $scope.addMoreRelationData = function(){
            iRoadModal.getRelationshipDataElementByProgram(iRoadModal.refferencePrefix + otherData.programName,program).then(function(dataElement){
                var relationEvent = {};
                $scope.data.otherData.mode = "addMoreRelation";
                relationEvent.dataValues = [];
                relationEvent.dataValues.push({
                    dataElement :dataElement.id,
                    value : $scope.data.otherData.eventId
                });
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'views/addedit.html',
                    controller: 'EditController',
                    size: "lg",
                    resolve: {
                        event: function () {
                            return relationEvent;
                        },
                        program:function(){
                            return program;
                        },
                        otherData : function(){
                            return $scope.data.otherData;
                        }
                    }
                });
                modalInstance.result.then(function (resultEvent) {
                    if(resultEvent.event){
                        $scope.data.otherData.eventList.push(resultEvent);
                        $scope.data.otherData.mode = "addRelation";
                    }
                }, function () {
                    $log.info('Relation Modal dismissed at: ' + new Date());
                    $scope.data.otherData.mode = "addRelation";
                });
            });
        };

        $scope.cancel = function () {
            $scope.data.otherData.mode = "addRelation";
            iRoadModal.setRelations($scope.event).then(function(){
                $uibModalInstance.close({});
            })
        };
    });
