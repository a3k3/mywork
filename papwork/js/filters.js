'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$filter */

var myfilter = angular.module('experienceApp.filters', []);

myfilter.filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]);

myfilter.filter('formatMoney', [function () {
    return function(text) {
        return String(text).replace();
    }
}]);

myfilter.filter('responsetblhead', [function () {
    return function (data) {
        var outData = [],reviewerStart=[];
        $.each(JSON.parse(data), function (index, obj) {
            $.each(obj, function (i, ob) {
                if (i == 0) {
                    outData.push(Object.keys(ob)[0]);
                } else if (i == 1) {
                    $.each(ob.userResponses, function (ini, iob) {
                        if (outData.indexOf(iob.Q) == -1) {
                            outData.push(iob.Q);
                        }
                    })
                } else if(i==2){
                    $.each(ob.reviewerResponses, function (ini, iob) {
                        reviewerStart.push(outData.length);
                        $.each(iob, function (inri, irob) {
                            outData.push(irob.Q);                            
                        })
                    })
                }                
            })
        });
        return outData;
    }
}])
