window.onload = function () {
    init();
};

var userLogged = null;
var questionSelected = null;
var numSolutions = 0;

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
        $('.fixed-action-btn').floatingActionButton();
    });
}

function loadInitValues() {
    loadProfile();
    loadQuestionToView();
}

function loadProfile() {
    if (supportsHTML5Storage()) {
        var user = localStorage.getItem('userLogged');
        this.userLogged = JSON.parse(user);
    }
}

function supportsHTML5Storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function loadQuestionToView() {
    var question = localStorage.getItem('questionSelected');
    this.questionSelected = JSON.parse(question);
}

function setDataToPage() {
    $('#titleQuestionCard').text(this.questionSelected.title);
    $('#questionTitleAddSolution').text(this.questionSelected.title);
    if (this.questionSelected.available) {
        $('#checkboxAvailable').attr('checked', 'checked');
    }
    this.numSolutions = this.questionSelected.solutions.length;
    $('#badgeNumSolutions').text(this.numSolutions);
}

function addSolution() {

}

function saveQuestion() {
    var isChecked = $('#checkboxAvailable').prop("checked");
    this.questionSelected.available = isChecked;
    localStorage.setItem('questionSelected', JSON.stringify(this.questionSelected));

    var questions = localStorage.getItem('questionsMaster');
    var questionsParsered = JSON.parse(questions);

    var newQuestions = questionsParsered.filter(function (question) {
        return question.id !== this.questionSelected.id;
    });

    newQuestions.push(this.questionSelected);
    localStorage.setItem('questionsMaster', JSON.stringify(newQuestions));

    backToPreviousPage();
}

function backToPreviousPage() {
    window.location.href = './masterMainPage.html';
}