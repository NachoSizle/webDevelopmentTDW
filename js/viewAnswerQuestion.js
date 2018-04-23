window.onload = function () {
    init();
};

var userLogged = null;
var proposeSolutions = [];
var questionSelected = null;
var numSolutions = 0;
var actualSolution = null;

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
    checkIfHasProposeSolution();
}

function loadProfile() {
    if (supportsHTML5Storage()) {
        var user = localStorage.getItem('userLogged');
        this.userLogged = JSON.parse(user);
        var proposeSol = localStorage.getItem('proposeSolutions');
        this.proposeSolutions = JSON.parse(proposeSol);
        if (this.proposeSolutions.length === 0) {
            $('#proposedSolutionsContainer').removeClass('scale-in').addClass('scale-out');
            $('#proposedSolutionsContainer').height(0);
        }
        var question = localStorage.getItem('questionSelected');
        this.questionSelected = JSON.parse(question);

        this.incorrectSolutions = this.questionSelected.solutions;
    }
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

    var proposeSolutionObj = {
        "proposeSolution": proposeSolutionTA,
        "question": this.questionSelected.title,
        "student": this.userLogged.name,
        "idQuestion": this.questionSelected.id
    };

    this.proposeSolutions.push(proposeSolutionObj);

    saveProposeSolution();
    checkIfHasProposeSolution();
}

function saveProposeSolution() {
    localStorage.setItem('proposeSolutions', JSON.stringify(this.proposeSolutions));
}

function checkIfHasProposeSolution() {
    this.proposeSolutions.map(function (proposeSol) {
        this.hasProposeSolution = this.questionSelected.id === proposeSol.idQuestion;

        if (this.hasProposeSolution) {
            $('#porposeSolutionText').text(proposeSol.proposeSolution);
            $('#btnAddProposeSolution').addClass('disabled');
            $('#proposedSolutionsContainer').removeClass('scale-out').addClass('scale-in');
            $('#proposedSolutionsContainer').height('auto');

            checkIfQuestionHasFollowingSolutions();
        }
    });
}

function checkIfQuestionHasFollowingSolutions() {

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
        "<div class='card-action' id='actionFollowingSolution" + idSolution + "'>" +
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

    console.log(proposedRationing);

    showAllIncorrectSolutions(idSolution);
}

function showAllIncorrectSolutions(idSolution) {
    if (this.incorrectSolutions[idSolution].rationings.length > 0) {
        this.incorrectSolutions[idSolution].rationings.map(function (rationing) {
            var incorrectSolutionObj = "<div class='card horizontal checkRationing' id='cardActualRationing" + rationing.id + "'>" +
                "<div class='card-stacked'>" +
                "<div class='card-content pad10'>" +
                "<span class='right'>" +
                "<i class='material-icons' id='resValidateAnswer" + rationing.id + "'></i>" +
                "</span>" +
                "<p>" + rationing.title + "</p>" +
                "</div>" +
                "<div class='card-action' id='actionFollowingSolution" + rationing.id + "'>" +
                "<label>" +
                "<input id='itsNotCorrectAnswer" + rationing.id + "' type='checkbox'/>" +
                "<span>It's not correct</span>" +
                "</label>" +
                "<a href='#' onclick='validateRationing(" + rationing.id + ")' class='right'>Validate!</a>" +
                "</div>" +
                "</div>" +
                "</div>";

            $('#containerProposedRationing' + idSolution).after(incorrectSolutionObj);
        });
    }
}

function validateRationing(rationing) {
    console.log(rationing);
}

function finishThisFollowingSolution(idSolution) {
    $('#actionFollowingSolution' + idSolution).prop('hidden', true);
}

function backToPreviousPage() {
    window.location.href = './studentMainPage.html';
}