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
        AWS.config.region = 'us-east-2';
        var bucket = new AWS.S3({ params: { Bucket: creds.bucket } });

        return bucket;
    }
});

myservice.service('loginService', function () {
    this.fblogin = function () {
        // Initialize the Amazon Cognito credentials provider
        AWS.config.region = 'us-east-2'; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-2:80bf8830-6b8d-4f27-97f9-f13e3ba86bd4',
        });

        WS.config.credentials.get(function () {

            var syncClient = new AWS.CognitoSyncManager();

            syncClient.openOrCreateDataset('myDataset', function (err, dataset) {

                dataset.put('myKey', 'myValue', function (err, record) {

                    dataset.synchronize({

                        onSuccess: function (data, newRecords) {
                            // Your handler code here
                            return { 'data': data, 'newRecords': newRecords }
                        }

                    });

                });

            });

        });
    }
});

myservice.service('FBLogin', ['$rootScope', function ($rootScope) {
    this.watchLoginChange = function () {

        var _self = this;

        FB.Event.subscribe('auth.authResponseChange', function (res) {

            if (res.status === 'connected') {

                /*
                 The user is already logged,
                 is possible retrieve his personal info
                */
                _self.getUserInfo();

                /*
                 This is also the point where you should create a
                 session for the current user.
                 For this purpose you can use the data inside the
                 res.authResponse object.
                */
                $rootScope.loginstatus = true;
            }
            else {

                /*
                 The user is not logged to the app, or into Facebook:
                 destroy the session on the server.
                */
                $rootScope.loginstatus = false;
            }

        });

    }
    this.getUserInfo = function () {

        var _self = this;

        FB.api('/me', function (res) {
            $rootScope.$apply(function () {
                $rootScope.user = _self.user = res;
            });
        });

    }
    this.logout = function () {

        var _self = this;

        FB.logout(function (response) {
            $rootScope.$apply(function () {
                $rootScope.user = _self.user = {};
                $rootScope.user.logintype = 'fb';
                $rootScope.loginstatus = false;
            });
        });

    }
}]);

myservice.service('getResponseData', ['$http', function ($http) {
    return $http({
        method: "GET",
        url: "../asset/data/responseData.json"
    })
}]);
