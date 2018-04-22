window.onload = function () {
    init();
};

var userLogged = null;
var proposeSolutions = [];
var questionSelected = null;
var numSolutions = 0;

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
        var question = localStorage.getItem('questionSelected');
        this.questionSelected = JSON.parse(question);
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
        }
    });
}

function backToPreviousPage() {
    window.location.href = './studentMainPage.html';
}