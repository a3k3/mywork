'use strict';


// Demonstrate how to register services
// In this case it is a simple constant service.
var myservice = angular.module('experienceApp.services', []);
myservice.value('version', '0.2');

myservice.service('getAllQuestions', ['$http',function ($http) {
    return $http({
        method: "GET",
        url: "../asset/data/questionData.json"
    })
}]);


myservice.service('getSettings', ['$http', function ($http) {
    return $http({
        method: "GET",
        url: "../asset/data/buildquestionData.json"
    })
}]);

myservice.service('getCoverData', ['$http', function ($http) {
    return $http({
        method: "GET",
        url: "../asset/data/cover.json"
    })
}]);

myservice.service('getSuccessData', ['$http', function ($http) {
    return $http({
        method: "GET",
        url: "../asset/data/success.json"
    })
}]);

myservice.service('getFieldTypeData', ['$http', function ($http) {
    return $http({
        method: "GET",
        url: "../asset/data/questionType.json"
    })
}]);

myservice.service('getSampleQuestionData', ['$http', function ($http) {
    return $http({
        method: "GET",
        url: "../asset/data/dummyQuestion.json"
    })
}]);
