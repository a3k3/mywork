
/* App Controllers */


function MyCtrl1($scope, getAllQuestions) {
    $scope.questions = [];
    getAllQuestions.then(function (response) {
        $scope.questions = response.data;
    }, function myError(response) {
        $scope.status = response.statusText;
    });
    $scope.next = function () {
        $('question.active').next().addClass('active');
    }
}
MyCtrl1.$inject = ['$scope', 'getAllQuestions'];

 
function MyCtrl2() {
}
MyCtrl2.$inject = [];

function animateQ() {

}

