window.onload = function () {
    init();
};

var userLogged = null;
var questionSelected = null;
var proposedSolutions = [];
var proposedSolutionToQuestionSelected = [];
var numProposedSolutions = 0;

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
    setDataToPage();
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
        var proposeSol = localStorage.getItem('proposeSolutions');
        this.proposedSolutions = JSON.parse(proposeSol);
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
    this.proposedSolutionToQuestionSelected = this.proposedSolutions.filter(function (propSol) {
        return propSol.idQuestion === this.questionSelected.id;
    });
    this.numProposedSolutions = this.proposedSolutionToQuestionSelected.length;
    setAnswersToCollapsible();
}

function setAnswersToCollapsible() {
    if (this.numProposedSolutions > 0) {
        $('#noAnswers').attr('hidden');
        this.proposedSolutionToQuestionSelected.map(function (propSolution) {
            var structSolution = "<li>" +
                "<div class='collapsible-header' onclick='changeAnswerSelected(" + propSolution.idQuestion + ")'>" +
                "<i class='material-icons'>filter_drama</i>" + propSolution.student + "</div>" +
                "<div class='collapsible-body'>" +
                "<h5>Answer: " + propSolution.proposeSolution + "</h5>" +
                "<div class='row buttonRationing'>" +
                "<a href='#addRationing' class='modal-trigger'>Add Rationing</a>" +
                "<a href='#' onclick='showRationing(" + propSolution.idQuestion + ")'>Show rationings</a>" +
                "</div>" +
                "</div>" +
                "</li>";
            $('#collapsibleOfAnswers').append(structSolution)
        });
    } else {
        $('#noAnswers').removeAttr('hidden');
    }
}

function changeAnswerSelected(idPropSolution) {
    /*
    console.log("CHANGE!!!");
    this.solutionSelected = this.questionSelected.solutions.filter(function (solution) {
        return solution.id === idSolution;
    });
    */
}

function backToPreviousPage() {
    window.location.href = './masterMainPage.html';
}