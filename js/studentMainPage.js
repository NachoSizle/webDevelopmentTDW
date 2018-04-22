window.onload = function () {
    init();
};

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
        var isAvailable = question.available;
        if (isAvailable) {
            var checked = isAvailable ? 'checked' : '';
            var textChecked = isAvailable ? 'Available' : 'Not available';
            var blockQuestion = "<div class='col s12 m6 hoverable' id='" + question["title"] + "'>" +
                "<div class='card blue-grey darken-1'>" +
                "<div class='card-content white-text'>" +
                "<span class='card-title'>" + question["title"] + "</span>" +
                "</div>" +
                "<div class='card-action'>" +
                "<a href='#' onclick='viewThisQuestion(" + question["id"] + ")'><i class='material-icons'>visibility</i> View</a>" +
                "</div>" +
                "</div>" +
                "</div>";
            $('#containerQuestions').append(blockQuestion);
        }
    });
}

function viewThisQuestion(questionId) {
    setSelectedQuestion(questionId);
    window.location.href = "./viewAnswerQuestion.html";
}

function setSelectedQuestion(questionId) {
    this.questions.map(function (question) {
        if (question.id === questionId) {
            this.questionSelected = question;
        }
    });
    localStorage.setItem('questionSelected', JSON.stringify(this.questionSelected));
}

function logout() {
    localStorage.removeItem('userLogged');
    localStorage.removeItem('questionSelected');
}