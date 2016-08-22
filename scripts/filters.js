'use strict';

/* Filters */

var appFilters = angular.module('appFilters', [])
    .filter("extrapolateDataValue", function (iRoadModal) {
        var dataElements = [];
        iRoadModal.getDataElements().then(function (resultDataElements) {
            dataElements = resultDataElements
        });
        var cached = {};

        function getDataElementId(event, dataElementName) {
            var returnValue = "";
            if(event){
                if(event.dataValues){
                    dataElements.forEach(function (dataElement) {
                        event.dataValues.forEach(function (dataValue,index) {
                            if (dataValue.dataElement == dataElement.id && dataElementName == dataElement.displayName) {
                                returnValue = event.event + dataValue.dataElement;
                            }
                        })
                    })
                }
            }
            return returnValue;
        }

        function getDataValue(event, dataElementName) {
            var cacheId = getDataElementId(event, dataElementName);
            if (cacheId in cached) {
                // avoid returning a promise!
                return cached[cacheId];
            } else {
                if(event) {
                    if (event.dataValues) {
                        dataElements.forEach(function (dataElement) {
                            event.dataValues.forEach(function (dataValue) {
                                if (dataValue.dataElement == dataElement.id && dataElementName == dataElement.displayName && dataElement.displayName.startsWith(iRoadModal.refferencePrefix)) {
                                    var newEvent = dataValue.value;
                                    if(newEvent){
                                        iRoadModal.getProgramByName(dataElementName.replace(iRoadModal.refferencePrefix, "")).then(function (program) {
                                            program.programStages[0].programStageDataElements.forEach(function (programStageDataElement) {
                                                if (programStageDataElement.dataElement.code)
                                                    if (programStageDataElement.dataElement.code.toLowerCase() == ("id_" + dataElementName.replace(iRoadModal.refferencePrefix, "").toLowerCase())) {
                                                        newEvent.dataValues.forEach(function (newDataValue) {
                                                            if (newDataValue.dataElement == programStageDataElement.dataElement.id) {
                                                                cached[event.event + dataValue.dataElement] = newDataValue.value;
                                                            }
                                                        })
                                                    }
                                            })
                                        })
                                    }
                                } else if (dataValue.dataElement == dataElement.id && dataElementName == dataElement.displayName) {
                                    cached[event.event + dataValue.dataElement] = dataValue.value;
                                }
                            })
                        })
                    }
                }
            }
        }

        getDataValue.$stateful = true;
        return getDataValue;
    })
    .filter("extrapolateDataElement", function (iRoadModal) {
        var dataElements = [];
        iRoadModal.getDataElements().then(function (resultDataElements) {
            dataElements = resultDataElements
        });
        var cached = {};

        function getDataValue(dataElementName) {
            var cacheId = dataElementName;
            if (cacheId in cached) {
                // avoid returning a promise!
                return cached[cacheId];
            } else {
                if(dataElementName && dataElementName.startsWith(iRoadModal.refferencePrefix)){
                    iRoadModal.getRelationship(dataElementName).then(function (dataElement) {
                        cached[dataElementName] = dataElement.name;
                    })
                }else{
                    cached[dataElementName] = dataElementName;
                }
            }
        }

        getDataValue.$stateful = true;
        return getDataValue;
    });
