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

function init() {
    initElements();
    loadInitValues();
    setDataToPage();
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
        var question = localStorage.getItem('questionSelected');
        this.questionSelected = JSON.parse(question);
        var answerResponse = localStorage.getItem('answersSolutionStudent');
        this.answersSolutionStudent = JSON.parse(answerResponse);

        this.incorrectSolutions = this.questionSelected.solutions;
        this.totalNumRationings = calcTotalNumRationings();
        console.log(this.totalNumRationings);
    }
}

function calcTotalNumRationings() {
    var numRationings = 0;
    this.incorrectSolutions.forEach(incorrectSolutions => {
        numRationings += incorrectSolutions.rationings.length;
    });
    return numRationings;
}

function supportsHTML5Storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function setDataToPage() {
    $('#titleQuestionCard').text(this.questionSelected.title);
    $('#questionTitleAddSolution').text(this.questionSelected.title);

    this.numSolutions = this.questionSelected.solutions.length;
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
        this.incorrectSolutions.map(function (actualSolution) {
            console.log(actualSolution);
            var incorrectSolutionObj = "<div class='card horizontal' id='cardActualSolution" + actualSolution.id + "'>" +
                "<div class='card-stacked'>" +
                "<div class='card-content pad10'>" +
                "<span class='right'>" +
                "<i class='material-icons' id='resValidateAnswer" + actualSolution.id + "'></i>" +
                "</span>" +
                "<p>" + actualSolution.title + "</p>" +
                "</div>" +
                "<div class='card-action' id='actionFollowingSolution" + actualSolution.id + "'>" +
                "<label>" +
                "<input id='itsNotCorrectAnswer" + actualSolution.id + "' type='checkbox'/>" +
                "<span>It's not correct</span>" +
                "</label>" +
                "<a href='#' onclick='validateAnswer(" + actualSolution.id + ")' class='right'>Validate!</a>" +
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
    var itsNotCorrect = $('#itsNotCorrectAnswer' + idSolution).prop('checked');
    if (this.incorrectSolutions[idSolution].rationings.length > 0 && itsNotCorrect) {
        //El estudiante ha acertado y empieza el flujo de los razonamientos
        console.log("Acierto!!!!!");
        $('#resValidateAnswer' + idSolution).text('check_circle');
        if ($('#resValidateAnswer' + idSolution).hasClass('incorrectAnswer')) {
            $('#resValidateAnswer' + idSolution).removeClass('incorrectAnswer');
        }
        $('#resValidateAnswer' + idSolution).addClass('correctAnswer');
    } else {
        console.log("Fallo!!!!!");
        $('#resValidateAnswer' + idSolution).text('cancel');
        if ($('#resValidateAnswer' + idSolution).hasClass('correctAnswer')) {
            $('#resValidateAnswer' + idSolution).removeClass('correctAnswer');
        }
        $('#resValidateAnswer' + idSolution).addClass('incorrectAnswer');
    }
    var proposeSolutionStudentAnswer = {
        "answer": itsNotCorrect,
        "followingSolution": this.incorrectSolutions[idSolution],
        "idAnswer": this.incorrectSolutions[idSolution].id
    };
    this.answerSolutionStudent.push(proposeSolutionStudentAnswer);
    showContainerAnswerRationing(idSolution);
}

function showContainerAnswerRationing(idSolution) {
    //Primero tenemos que mostrar el campo de propuesta de razonamiento
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
    //El estudiante acierta el tipo de solucion y se muestra la siguiente solucion (si la hay) y se repite el ciclo
    finishThisFollowingSolution(idSolution);
}

function saveProposeRationing(idSolution) {
    var proposedRationing = $('#proposeRationing' + idSolution).val();
    $('#proposeRationing' + idSolution).prop('hidden', true);

    $('#textHeaderProposeRationing' + idSolution).text('Your proposed rationing: ');
    $('#textProposeRationing' + idSolution).text(proposedRationing);

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
    if (this.incorrectSolutions[idSolution].rationings.length > 0) {
        this.incorrectSolutions[idSolution].rationings.map(function (rationing) {
            var incorrectSolutionObj = "<div class='card horizontal checkRationing' id='cardActualRationing" + rationing.id + "'>" +
                "<div class='card-stacked'>" +
                "<div class='card-content pad10'>" +
                "<span class='right'>" +
                "<i class='material-icons' id='resValidateAnswerRationing" + rationing.id + "'></i>" +
                "</span>" +
                "<p>" + rationing.title + "</p>" +
                "</div>" +
                "<div class='card-action' id='actionRationingSolution" + rationing.id + "'>" +
                "<label>" +
                "<input id='itsNotCorrectAnswerProposedRationings" + rationing.id + "' type='checkbox'/>" +
                "<span>It's not justify</span>" +
                "</label>" +
                "<a href='#' onclick='validateRationing(" + rationing.id + ", " + idSolution + ")' class='right'>Validate!</a>" +
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
    var actualRationing = this.incorrectSolutions[idSolution].rationings[idRationing];

    if (justifyRationing === actualRationing.justifyRationing) {
        //El estudiante ha acertado y empieza el flujo de los razonamientos
        console.log("Acierto!!!!!");
        $('#resValidateAnswerRationing' + idRationing).text('check_circle');
        if ($('#resValidateAnswerRationing' + idRationing).hasClass('incorrectAnswer')) {
            $('#resValidateAnswerRationing' + idRationing).removeClass('incorrectAnswer');
        }
        $('#resValidateAnswerRationing' + idRationing).addClass('correctAnswer');
    } else {
        console.log("Fallo!!!!!");
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
    var answerToSave = {
        "question": this.questionSelected.title,
        "student": this.userLogged.name,
        "idQuestion": this.questionSelected.id,
        "proposedSolution": this.proposedSolution,
        "answers": this.answerSolutionStudent
    }

    this.answersSolutionStudent.push(answerToSave);
    localStorage.setItem('answersSolutionStudent', JSON.stringify(this.answersSolutionStudent));
    $('#finishModal').modal('open');
}

function backToPreviousPage() {
    window.location.href = './studentMainPage.html';
}