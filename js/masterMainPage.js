window.onload = function () {
    init();
};

var userLogged = null;
var questions = [];
var numQuestions = 0;
var questionSelected = null;

function init() {
    initElements();
    loadProfile();
}

function initElements() {
    $(document).ready(function () {
        $('.sidenav').sidenav();
        $('.fixed-action-btn').floatingActionButton();
        $('.modal').modal();
        $('.tap-target').tapTarget();
        $('.tap-target').tapTarget('open');
        setTimeout(function () {
            $('.tap-target').tapTarget('close');
            $('.tap-target').tapTarget('destroy');
        }, 1500);

    });
}

function onCloseTapTarget() {
    console.log('close');
}

function loadProfile() {
    if (supportsHTML5Storage()) {
        var user = localStorage.getItem('userLogged');
        this.userLogged = JSON.parse(user);
        setDataToPage();
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
    $('#hiMaster')[0].innerText = "Hola " + this.userLogged["name"];

    getQuestions();
}

function getQuestions() {
    $('#containerQuestions').empty();
    var questions = localStorage.getItem('questionsMaster');
    this.questions = JSON.parse(questions);
    this.numQuestions = this.questions.length;

    this.questions.forEach(question => {
        var checked = question.available ? 'checked' : '';
        var textChecked = question.available ? 'Available' : 'Not available';
        var blockQuestion = "<div class='col s12 m6 hoverable' id='" + question["title"] + "'>" +
            "<div class='card blue-grey darken-1'>" +
            "<div class='card-content white-text'>" +
            "<span class='card-title'>" + question["title"] + "</span>" +
            "<label>" +
            "<input type='checkbox'" + checked + " disabled/>" +
            "<span>" + textChecked + "</span>" +
            "</label>" +
            "</div>" +
            "<div class='card-action'>" +
            "<a href='#' onclick='viewThisQuestion(" + question["id"] + ")'><i class='material-icons'>visibility</i> View</a>" +
            "<a href='#remModal' onclick='setQuestion(" + question["id"] + ")' class='modal-trigger'><i class='material-icons'>delete_forever</i> Remove</a>" +
            "</div>" +
            "</div>" +
            "</div>";
        $('#containerQuestions').append(blockQuestion);
    });
}

function getIsChecked(question) {
    console.log(question);
}

function viewThisQuestion(questionId) {
    setSelectedQuestion(questionId);
    window.location.href = "./viewQuestion.html";
}

function setQuestion(questionId) {
    setSelectedQuestion(questionId);
    $('#questionTitle').text(questionSelected.title);
}

function setSelectedQuestion(questionId) {
    this.questions.map(function (question) {
        if (question.id === questionId) {
            this.questionSelected = question;
        }
    });
    localStorage.setItem('questionSelected', JSON.stringify(this.questionSelected));
}

function addQuestion() {
    var taValue = $('#questionTitleTA').val();
    $('#questionTitleTA').val('');

    var numElem = this.numQuestions + 1;

    var newQuestion = {
        "title": taValue,
        "id": numElem,
        "available": false,
        "solutions": []
    };

    this.questions.push(newQuestion);
    localStorage.setItem('questionsMaster', JSON.stringify(this.questions));
    getQuestions();
}

function removeQuestion() {
    var questionParsered = JSON.parse(localStorage.getItem('questionSelected'));
    var questionId = questionParsered.id;
    this.questions = this.questions.filter(function (question) {
        return question.id !== questionId;
    });
    localStorage.setItem('questionsMaster', JSON.stringify(this.questions));
    localStorage.removeItem('questionSelected');
    getQuestions();
}

function logout() {
    localStorage.removeItem('userLogged');
    localStorage.removeItem('questionSelected');
}