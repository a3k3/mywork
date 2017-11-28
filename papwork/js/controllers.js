
/* App Controllers */


function questionsCtrl($scope, getAllQuestions) {
    $scope.questionsObj = {
        questions: [],
        maxCount: 0,
        minCount: 0,
        activeNow: 0,
        percentComplete: function () {
            return (this.activeNow / this.maxCount) * 100;
        }
    };
    getAllQuestions.then(function (response) {
        $scope.questionsObj.questions = response.data;
        $scope.questionsObj.activeNow = 1;
        $scope.questionsObj.maxCount = $scope.questionsObj.questions.length;
    }, function myError(response) {
        $scope.status = response.statusText;
    });

    //next button click
    $scope.questionsObj.next = function () {
        var _active = document.getElementsByClassName("active");
        _active = angular.element(_active);
        _active.removeClass('active').addClass('visited').next().addClass('active').removeClass('next_active').next().addClass('next_active');
    }

    //prev button click
    $scope.questionsObj.prev = function () {
        var _active = document.getElementsByClassName("active");
        _active = angular.element(_active);
        _active.removeClass('active').addClass('next_active').prev().addClass('active').removeClass('next_active').removeClass('visited');
        _active.next().removeClass('next_active');
    }
}
questionsCtrl.$inject = ['$scope', 'getAllQuestions'];


function MyCtrl2() {
}
MyCtrl2.$inject = [];

function animateQ() {

}

