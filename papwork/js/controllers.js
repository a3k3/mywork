
/* App Controllers */


function MyCtrl1($scope, getAllQuestions) {
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
    $scope.next = function () {
    }
}
MyCtrl1.$inject = ['$scope', 'getAllQuestions'];


function MyCtrl2() {
}
MyCtrl2.$inject = [];

function animateQ() {

}

