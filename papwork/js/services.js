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

myservice.service('getTypeData', ['$http', function ($http) {
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

myservice.service('uploadData', ['$http', function ($http) {
    this.uploadImage = function (data) {
        return $http({
            method: 'POST',
            url: 'https://api.imgur.com/3/image',
            data: {
                'image': data,
                'type': 'base64'
            },
            headers: {
                'Authorization': 'Client-ID ad8dc2dd252ac7c'
            }
        });
    }
}]);

myservice.service('uploadDataToAWS',function () {
    var creds = {
        bucket: 'papwork',
        access_key: 'AKIAJC7GME4TSDD4AFSA',
        secret_key: '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'
    }
    this.upload = function () {
        // Configure The S3 Object 
        AWS.config.update({ accessKeyId: creds.access_key, secretAccessKey: creds.secret_key });
        AWS.config.region = 'us-east-1';
        var bucket = new AWS.S3({ params: { Bucket: creds.bucket } });

        return bucket;
    }
});
