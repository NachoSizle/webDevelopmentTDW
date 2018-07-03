window.onload = function () {
    init();
};

var userLogged = null;
var proposedSolution = null;
var questionSelected = null;
var numSolutions = 0;
var actualSolution = null;
var numProposeRationingsAnswered = 0;
var numRationingsAnswered = 0;
var totalNumRationings = 0;
var answerSaved = null;

function init() {
    initElements();
    loadInitValues();
}

function initElements() {
    $(document).ready(function () {
        $('.sidenav').sidenav();
        $('.modal').modal();
        $('.fixed-action-btn').floatingActionButton();
        $('.collapsible').collapsible();
    });
}

function loadInitValues() {
    loadProfile();
}

function loadProfile() {
    if (supportsHTML5Storage()) {
        var user = localStorage.getItem('userLogged');
        this.userLogged = JSON.parse(user);

        this.saveToken = localStorage.getItem('X-Token');

        var question = localStorage.getItem('questionSelected');
        this.questionSelected = JSON.parse(question);

        var answerResponse = localStorage.getItem('answersSolutionStudent');
        this.answersSolutionStudent = JSON.parse(answerResponse);

        // SACAMOS LAS SOLUCIONES DADAS A ESTA CUESTION
        this.getAllAnswersToThisQuestion().then((res) => {
            if (res !== null && res !== undefined) {
                this.incorrectSolutions = res;
                this.numSolutions = res.length;
                this.calcTotalNumRationings().then((rationings) => {
                    this.allRationingsToThisQuestions = rationings;
                    this.totalNumRationings = rationings.length;
                    this.setDataToPage();
                }).catch(() => {
                    this.allRationingsToThisQuestions = [];
                    this.totalNumRationings = 0;
                    this.setDataToPage();
                })
            }
        }).catch((err) => {
            if (err.status === 404) {
                this.incorrectSolutions = [];
                this.numSolutions = 0;
                this.allRationingsToThisQuestions = [];
                this.totalNumRationings = 0;
                this.setDataToPage();
            }
        });
    }
}

function getAllAnswersToThisQuestion() {
    var questionsAnswered = [];
    return new Promise((resolve, reject) => {
        this.requestApi('GET', 'solutions', null, this.saveToken).then((response) => {
            if (response !== null && response !== undefined) {
                var resParsered = JSON.parse(response);
                var solutionsParsered = resParsered.soluciones;
                if (solutionsParsered.length > 0) {
                    solutionsParsered.map((solution) => {
                        var sol = solution.answer;
                        if (sol.idQuestion === this.questionSelected.idCuestion) {
                            questionsAnswered.push(sol);
                        }
                    });
                }
                resolve(questionsAnswered);
            }
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
}

function calcTotalNumRationings() {
    var numRationings = 0;
    var rationingFromThisAnswer = [];

    return new Promise((resolve, reject) => {
        this.requestApi('GET', 'rationings', null, this.saveToken).then((response) => {
            if (response !== null && response !== undefined) {
                var resParsered = JSON.parse(response);
                var rationingsParsered = resParsered.razonamientos;
                if (rationingsParsered.length > 0) {
                    this.incorrectSolutions.map((sol) => {
                        rationingsParsered.map((rationing) => {
                            var rat = rationing.rationing;
                            if (sol.idAnswer === rat.idSolution) {
                                rationingFromThisAnswer.push(rat);
                            }
                        });
                    });
                }
                resolve(rationingFromThisAnswer);
            }
        }).catch((err) => {
            if (err.status === 404) {
                reject();
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

    $('#titleQuestionCard').text(this.questionSelected.enum_descripcion);
    $('#questionTitleAddSolution').text(this.questionSelected.enum_descripcion);
}

function addSolution() {
    var proposeSolutionTA = $('#questionProposeSolutionTA').val();
    $('#questionProposeSolutionTA').val('');

    this.proposedSolution = proposeSolutionTA;

    var proposeSolutionStudentAnswer = {
        "idQuestion": this.questionSelected.idCuestion,
        "student": this.userLogged.username,
        "questionTitle": this.questionSelected.enum_descripcion,
        "proposedSolution": this.proposedSolution,
        "isGood": false
    };

    var propAns = JSON.stringify(proposeSolutionStudentAnswer);

    this.saveAnswerFromStudent(propAns).then(() => {
        console.log('Saved!');
        $('#porposeSolutionText').text(proposeSolutionTA);
        $('#btnAddProposeSolution').addClass('disabled');
        $('#proposedSolutionsContainer').removeClass('scale-out').addClass('scale-in');
        $('#proposedSolutionsContainer').height('auto');
        checkIfQuestionHasFollowingSolutions();
    });
}

function saveAnswerFromStudent(proposedAnswer) {
    return new Promise((resolve) => {
        this.requestApi('POST', 'solutions', proposedAnswer, this.saveToken).then((response) => {
            if (response !== null && response !== undefined) {
                var answerSaved = JSON.parse(response);
                this.answerSaved = answerSaved.answer;
                resolve();
            }
        }).catch((err) => {
            console.log(err);
        });
    });
}

function checkIfQuestionHasFollowingSolutions() {
    if (this.incorrectSolutions.length > 0) {
        this.incorrectSolutions.map(function (actualSolution, index) {
            var incorrectSolutionObj = "<div class='card horizontal' id='cardActualSolution" + index + "'>" +
                "<div class='card-stacked'>" +
                "<div class='card-content pad10'>" +
                "<span class='right'>" +
                "<i class='material-icons' id='resValidateAnswer" + index + "'></i>" +
                "</span>" +
                "<p>" + actualSolution.proposedSolution + "</p>" +
                "</div>" +
                "<div class='card-action' id='actionFollowingSolution" + index + "'>" +
                "<label>" +
                "<input id='itsNotCorrectAnswer" + index + "' type='checkbox'/>" +
                "<span>It's correct</span>" +
                "</label>" +
                "<a href='#' onclick='validateAnswer(" + index + ")' class='right'>Validate!</a>" +
                "</div>" +
                "</div>" +
                "</div>";

            $('#containerAllFollowingSolutions').append(incorrectSolutionObj);
        });
        $('#followingSolutionContainer').removeClass('scale-out').addClass('scale-in');
        $('#followingSolutionContainer').height('auto');
    } else {
        finishQuestion();
    }
}

function validateAnswer(idSolution) {
    var itsCorrect = $('#itsNotCorrectAnswer' + idSolution).prop('checked');
    if (this.incorrectSolutions[idSolution].isGood === itsCorrect) {
        $('#resValidateAnswer' + idSolution).text('check_circle');
        if ($('#resValidateAnswer' + idSolution).hasClass('incorrectAnswer')) {
            $('#resValidateAnswer' + idSolution).removeClass('incorrectAnswer');
        }
        $('#resValidateAnswer' + idSolution).addClass('correctAnswer');
    } else {
        $('#resValidateAnswer' + idSolution).text('cancel');
        if ($('#resValidateAnswer' + idSolution).hasClass('correctAnswer')) {
            $('#resValidateAnswer' + idSolution).removeClass('correctAnswer');
        }
        $('#resValidateAnswer' + idSolution).addClass('incorrectAnswer');
    }

    showContainerAnswerRationing(idSolution);
}

function showContainerAnswerRationing(idSolution) {
    var addProposedRationing = "<div class='card horizontal proposedRationing' id='containerProposedRationing" + idSolution + "'>" +
        "<div class='card-stacked'>" +
        "<div class='card-content pad10'>" +
        "<div class='input-field col s12 noMarginBottom'>" +
        "<h4 id='textHeaderProposeRationing" + idSolution + "' class='noMarginTop'>Propose a rationing, please:</h4>" +
        "<input id='proposeRationing" + idSolution + "' type='text' class='validate'>" +
        "<h5 id='textProposeRationing" + idSolution + "'></h5>" +
        "</div>" +
        "</div>" +
        "<div class='card-action' id='actionSaveProposeRationing" + idSolution + "'>" +
        "<a href='#' onclick='saveProposeRationing(" + idSolution + ")' class='right'>Save!</a>" +
        "</div>" +
        "</div>" +
        "</div>";
    $('#cardActualSolution' + idSolution).after(addProposedRationing);
    finishThisFollowingSolution(idSolution);
}

function saveProposeRationing(idSolution) {
    var proposedRationing = $('#proposeRationing' + idSolution).val();
    $('#proposeRationing' + idSolution).prop('hidden', true);

    $('#textHeaderProposeRationing' + idSolution).text('Your proposed rationing: ');
    $('#textProposeRationing' + idSolution).text(proposedRationing);

    var proposedRationingAnswer = {
        "title": proposedRationing,
        "idSolution": this.incorrectSolutions[idSolution].idAnswer,
        "justifyRationing": false
    };

    var propRationing = JSON.stringify(proposedRationingAnswer);
    this.saveProposedRationing(propRationing).then(() => {
        $('#actionSaveProposeRationing' + idSolution).prop('hidden', true);
        showAllIncorrectSolutions(idSolution);
    });
}

function saveProposedRationing(propRationing) {
    return new Promise((resolve) => {
        this.requestApi('POST', 'rationings', propRationing, this.saveToken).then((response) => {
            if (response !== null && response !== undefined) {
                resolve();
            }
        }).catch((err) => {
            console.log(err);
        });
    });
}

function showAllIncorrectSolutions(idSolution) {
    this.numProposeRationingsAnswered++;

    //MOSTRAR TODOS LOS RAZONAMIENTOS QUE SE HAN DADO A ESTA PREGUNTA
    if (this.allRationingsToThisQuestions.length > 0) {
        this.allRationingsToThisQuestions.map(function (rationing, index) {
            var incorrectSolutionObj = "<div class='card horizontal checkRationing' id='cardActualRationing" + index + "'>" +
                "<div class='card-stacked'>" +
                "<div class='card-content pad10'>" +
                "<span class='right'>" +
                "<i class='material-icons' id='resValidateAnswerRationing" + index + "'></i>" +
                "</span>" +
                "<p>" + rationing.title + "</p>" +
                "</div>" +
                "<div class='card-action' id='actionRationingSolution" + index + "'>" +
                "<label>" +
                "<input id='itsNotCorrectAnswerProposedRationings" + index + "' type='checkbox'/>" +
                "<span>It's justify</span>" +
                "</label>" +
                "<a href='#' onclick='validateRationing(" + index + ", " + idSolution + ")' class='right'>Validate!</a>" +
                "</div>" +
                "</div>" +
                "</div>";

            $('#containerProposedRationing' + idSolution).after(incorrectSolutionObj);
        });
    } else if (this.numProposeRationingsAnswered === this.incorrectSolutions.length &&
        this.numRationingsAnswered === this.totalNumRationings) {
        finishQuestion();
    }
}

function validateRationing(idRationing, idSolution) {
    var justifyRationing = $('#itsNotCorrectAnswerProposedRationings' + idRationing).prop('checked');
    var actualRationing = this.allRationingsToThisQuestions[idRationing];

    if (justifyRationing === actualRationing.justifyRationing) {
        $('#resValidateAnswerRationing' + idRationing).text('check_circle');
        if ($('#resValidateAnswerRationing' + idRationing).hasClass('incorrectAnswer')) {
            $('#resValidateAnswerRationing' + idRationing).removeClass('incorrectAnswer');
        }
        $('#resValidateAnswerRationing' + idRationing).addClass('correctAnswer');
    } else {
        $('#resValidateAnswerRationing' + idRationing).text('cancel');
        if ($('#resValidateAnswerRationing' + idRationing).hasClass('correctAnswer')) {
            $('#resValidateAnswerRationing' + idRationing).removeClass('correctAnswer');
        }
        $('#resValidateAnswerRationing' + idRationing).addClass('incorrectAnswer');
    }

    finishThisFollowingRationing(idRationing);
}

function finishThisFollowingRationing(idRationing) {
    $('#actionRationingSolution' + idRationing).prop('hidden', true);
}

function finishThisFollowingSolution(idSolution) {
    $('#actionFollowingSolution' + idSolution).prop('hidden', true);
}

function finishQuestion() {
    var answerToSave = {
        "question": this.questionSelected,
        "answer": this.answerSaved
    };
    var solReview = localStorage.getItem('solutionsToReview');
    var arr = solReview ? JSON.parse(solReview) : [];
    arr.push(answerToSave);
    localStorage.setItem('solutionsToReview', JSON.stringify(arr));

    $('#finishModal').modal('open');
}

function backToPreviousPage() {
    window.location.href = './studentMainPage.html';
}