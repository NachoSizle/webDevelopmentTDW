window.onload = function () {
    init();
};

var userLogged = null;
var proposedSolution = null;
var answerSolutionStudent = [];
var questionSelected = null;
var numSolutions = 0;
var actualSolution = null;
var numProposeRationingsAnswered = 0;
var numRationingsAnswered = 0;
var totalNumRationings = 0;
var solutionsToReview = [];
var numSolutionsToReview = 0;

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

        var solutionsReview = localStorage.getItem('solutionsToReview');
        this.solutionsToReview = JSON.parse(solutionsReview);
        this.numSolutionsToReview = this.solutionsToReview.length;

        // SACAMOS LAS SOLUCIONES DADAS A ESTA CUESTION
        this.getAllAnswersToThisQuestion().then((res) => {
            if (res !== null && res !== undefined) {
                this.incorrectSolutions = res;
                this.numSolutions = res.length;
                this.calcTotalNumRationings().then((rationings) => {
                    this.allRationingsToThisQuestions = rationings;
                    this.totalNumRationings = rationings.length;
                    this.setDataToPage();
                });
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
            console.log(err);
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
    $('#titleQuestionCard').text(this.questionSelected.enum_descripcion);
    $('#questionTitleAddSolution').text(this.questionSelected.enum_descripcion);
}

function addSolution() {
    var proposeSolutionTA = $('#questionProposeSolutionTA').val();
    $('#questionProposeSolutionTA').val('');

    this.proposedSolution = proposeSolutionTA;

    $('#porposeSolutionText').text(proposeSolutionTA);
    $('#btnAddProposeSolution').addClass('disabled');
    $('#proposedSolutionsContainer').removeClass('scale-out').addClass('scale-in');
    $('#proposedSolutionsContainer').height('auto');
    checkIfQuestionHasFollowingSolutions();
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
    // TO-DO: SAVE ANSWER
    var proposeSolutionStudentAnswer = {
        "answer": itsCorrect,
        "followingSolution": this.incorrectSolutions[idSolution],
        "idAnswer": this.incorrectSolutions[idSolution].id
    };
    this.answerSolutionStudent.push(proposeSolutionStudentAnswer);
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

    // TO-DO: SAVE RATIONING
    var proposedRationingAnswer = {
        "proposedRationing": proposedRationing,
        "idSolution": idSolution,
        "user": this.userLogged.user,
    };

    addProposeRationingToAnswer(proposedRationingAnswer);

    $('#actionSaveProposeRationing' + idSolution).prop('hidden', true);

    showAllIncorrectSolutions(idSolution);
}

function addProposeRationingToAnswer(proposedRationingAnswer) {
    this.answerSolutionStudent.forEach(answer => {
        if (answer.idAnswer === proposedRationingAnswer.idSolution) {
            answer["proposeRationing"] = proposedRationingAnswer;
        }
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

    var justifyRationingAnswer = {
        "idRationing": idRationing,
        "idSolution": idSolution,
        "answer": justifyRationing
    };
    // TO-DO: SAVE RATIONING
    saveResponseRationing(justifyRationingAnswer);
    finishThisFollowingRationing(idRationing);
}

function saveResponseRationing(justifyRationingStudentAnswer) {
    this.numRationingsAnswered++;
    this.answerSolutionStudent.forEach(answer => {
        if (answer.idAnswer === justifyRationingStudentAnswer.idSolution) {
            if (answer["proposedRationingsAnswers"] === undefined) {
                answer["proposedRationingsAnswers"] = [];
            }
            answer["proposedRationingsAnswers"].push(justifyRationingStudentAnswer);
        }
    });

    if (this.numProposeRationingsAnswered === this.incorrectSolutions.length &&
        this.numRationingsAnswered === this.totalNumRationings) {
        finishQuestion();
    }
}

function finishThisFollowingRationing(idRationing) {
    $('#actionRationingSolution' + idRationing).prop('hidden', true);
}

function finishThisFollowingSolution(idSolution) {
    $('#actionFollowingSolution' + idSolution).prop('hidden', true);
}

function finishQuestion() {
    this.numSolutionsToReview++;
    var answerToSave = {
        "question": this.questionSelected.title,
        "student": this.userLogged.name,
        "idQuestion": this.questionSelected.id,
        "proposedSolution": this.proposedSolution,
        "answers": this.answerSolutionStudent,
        "idAnswer": this.numSolutionsToReview
    };

    this.answersSolutionStudent.push(answerToSave);
    localStorage.setItem('answersSolutionStudent', JSON.stringify(this.answersSolutionStudent));

    // TO-DO: SAVE ANSWER
    saveAnsweredToReviewByMaster(answerToSave);

    $('#finishModal').modal('open');
}

function saveAnsweredToReviewByMaster(answerToSave) {
    var answerToReview = {
        "idQuestion": answerToSave.idQuestion,
        "student": answerToSave.student,
        "proposedSolution": answerToSave.proposedSolution,
        "answers": answerToSave.answers,
        "idAnswerToReview": this.numSolutionsToReview
    };

    // TO-DO: SAVE ANSWER TO REVIEW 
    this.solutionsToReview.push(answerToReview);
    localStorage.setItem('solutionsToReview', JSON.stringify(this.solutionsToReview));
}

function backToPreviousPage() {
    window.location.href = './studentMainPage.html';
}