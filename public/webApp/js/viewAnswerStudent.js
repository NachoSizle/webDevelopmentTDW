window.onload = function () {
    init();
};

var userLogged = null;
var questionSelected = null;
var answerToReview = null;
var answersSolutionStudents = [];
var proposedSolutionToQuestionSelected = null;

function init() {
    $('#goodSolutionCheck').click(function () {
        if ($('.rationingContainer').hasClass('scale-out')) {
            $('.rationingContainer').removeClass('scale-out').addClass('scale-in');
            $('.rationingContainer').height('auto');
        } else {
            $('.rationingContainer').removeClass('scale-in').addClass('scale-out');
            $('.rationingContainer').height(0);
        }
    })

    initElements();
    loadInitValues();
}

function initElements() {
    $(document).ready(function () {
        $('.sidenav').sidenav();
        $('.modal').modal();
        $('.collapsible').collapsible();
    });
}

function loadInitValues() {
    loadData();
}

function loadData() {
    if (supportsHTML5Storage()) {
        var user = localStorage.getItem('userLogged');
        this.userLogged = JSON.parse(user);
        var question = localStorage.getItem('questionSelected');
        this.questionSelected = JSON.parse(question);

        this.saveToken = localStorage.getItem('X-Token');

        this.reviewMode = JSON.parse(localStorage.getItem('review'));
        if (this.reviewMode) {
            this.answerToReview = JSON.parse(localStorage.getItem('answerToReview'));
            if (this.answerToReview) {
                this.questionSelected = this.answerToReview.question;
                $('#noAnswers').attr('hidden');
                this.setDataToPage();
            } else {
                $('warningText').text('Question not update');
                $('#errModal').modal('open');
                $('#noAnswers').removeAttr('hidden');
            }
        } else {
            this.onlyUserLogged = JSON.parse(localStorage.getItem('onlyUserLogged'));

            if (!this.onlyUserLogged) {
                $('.onlyShowStudent').map((li) => {
                    $($('.onlyShowStudent')[li]).hide()
                });
            } else {
                $('.onlyShowMaster').map((li) => {
                    $($('.onlyShowMaster')[li]).hide()
                });
            }

            this.getSolutionsFromStudents(this.questionSelected.idCuestion).then((res) => {
                this.answersSolutionStudents = res;
                this.setDataToPage();
            });
        }
    }
}

function getSolutionsFromStudents(idCuestion) {
    var solutionsToProcess = [];
    return new Promise((resolve, reject) => {
        this.requestApi('GET', 'solutions', null, this.saveToken).then((response) => {
            if (response !== null && response !== undefined) {
                var resParsered = JSON.parse(response);
                var solutionsParsered = resParsered.soluciones;
                if (solutionsParsered.length > 0) {
                    solutionsParsered.map((solution) => {
                        var sol = solution.answer;
                        if (sol.idQuestion === idCuestion) {
                            if (this.onlyUserLogged) {
                                if (sol.student === this.userLogged.username) {
                                    solutionsToProcess.push(sol);
                                }
                            } else {
                                solutionsToProcess.push(sol);
                            }
                        }
                    });
                }
                resolve(solutionsToProcess);
            }
        }).catch((err) => {
            console.log(err);
            if (err.status === 404) {
                resolve([]);
            }
            reject(err);
        });
    });
}

function supportsHTML5Storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function setDataToPage() {
    $('#userLogged')[0].innerText = "User logged: " + this.userLogged["username"];

    $('.firstTitle').text('Question: ' + this.questionSelected.enum_descripcion);
    if (this.reviewMode) {
        this.setAnswerToCorrect();
    } else {
        this.setAnswersToCollapsible();
    }
}

function setAnswerToCorrect() {
    var answer = this.answerToReview.answer;
    var question = this.answerToReview.question;
    var structSolution = "<li>" +
        "<div class='collapsible-header'>" +
        "<i class='material-icons'>filter_drama</i>" + answer.student + "</div>" +
        "<div class='collapsible-body'>" +
        "<h5>Answer: " + answer.proposedSolution + "</h5>" +
        "<div class='row actionCollapsibleBody'>" +
        "<label>" +
        "<input id='itsNotCorrectAnswer' type='checkbox'/>" +
        "<span>It's correct</span>" +
        "</label>" +
        "<a href='#' onclick='saveCorrection()' class='right'>Save!</a>" +
        "</div>" +
        "</div>" +
        "</li>";
    $('#collapsibleOfAnswers').append(structSolution);
}

function saveCorrection() {
    var answer = this.answerToReview.answer;
    var isCorrect = $('#itsNotCorrectAnswer').prop('checked');
    var answerToSave = {
        isGood: isCorrect,
    };
    var answerParsered = JSON.stringify(answerToSave);

    this.requestApi('PUT', 'solutions/' + answer.idAnswer, answerParsered, this.saveToken).then((res) => {
        localStorage.setItem('answerReviewed', JSON.stringify(this.answerToReview));
        localStorage.removeItem('review');
        localStorage.removeItem('answerToReview');
        $('.okText').text('State of this question has been update!');
        $('#okModal').modal('open');
    });
}

function setAnswersToCollapsible() {
    if (this.answersSolutionStudents.length > 0) {
        $('#noAnswers').attr('hidden');
        this.answersSolutionStudents.map(function (propSolution, index) {
            if (propSolution !== null && propSolution !== undefined) {
                var isGood = propSolution.isGood ? 'correctAnswer' : 'incorrectAnswer';
                var iconGood = propSolution.isGood ? 'check_circle' : 'cancel';
                var structSolution = "<li>" +
                    "<div class='collapsible-header'>" +
                    "<i class='material-icons'>filter_drama</i>" + propSolution.student + "</div>" +
                    "<div class='collapsible-body'>" +
                    "<h5>Answer: " + propSolution.proposedSolution + "</h5>" +
                    "<div class='row'>" +
                    "<span class='resText'>Result:</span>" +
                    "<span>" +
                    "<i class='material-icons " + isGood + "'>" + iconGood + "</i>" +
                    "</span>" +
                    "</div>" +
                    "</div>" +
                    "</li>";
                $('#collapsibleOfAnswers').append(structSolution);
            }
        });
    } else {
        $('#noAnswers').removeAttr('hidden');
    }
}
/*
function getRationings(answer) {
    return new Promise((resolve) => {
        var rationingToProcess = [];
        this.requestApi('GET', 'rationings', null, this.saveToken).then((response) => {
            if (response !== null && response !== undefined) {
                var resParsered = JSON.parse(response);
                var rationingsParsered = resParsered.razonamientos;
                if (rationingsParsered.length > 0) {
                    rationingsParsered.map((rationing) => {
                        var rationing = rationing.rationing;
                        if (rationing.idSolution === answer.idQuestion) {
                            rationingToProcess.push(rationing);
                        }
                    });
                }
                resolve(rationingToProcess);
            }
        }).catch((err) => {
            console.log(err);
            if (err.status === 404) {
                resolve(null);
            }
        });
    });
}
*/

function backToPreviousPage() {
    window.location.href = './masterMainPage.html';
}