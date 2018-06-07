window.onload = function () {
    init();
};

var answersSolutionStudent = [];
var studentAnsweredAllQuestions = false;

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
    $('#hiMaster')[0].innerText = "Hola " + this.userLogged["username"];
    getQuestions();
}

function getQuestions() {
    $('#containerQuestions').empty();

    var questions = localStorage.getItem('questionsMaster');
    this.questions = JSON.parse(questions);

    var answersSolutions = localStorage.getItem('answersSolutionStudent');
    this.answersSolutionStudent = JSON.parse(answersSolutions);

    this.numQuestions = this.questions.length;

    var questionsAnswered = this.answersSolutionStudent.filter(function (answerSol) {
        return this.userLogged.name === answerSol.student;
    });

    var questionsWithAnswer = [];

    this.questions.map(function (question) {
        questionsAnswered.map(function (questionAnsweredStudent) {
            var idQuestionsAns = questionAnsweredStudent.idQuestion;

            if (question.id === idQuestionsAns) {
                questionsWithAnswer.push(question);
            }
        });
    });

    var idQuestionsAnswered = [];
    questionsAnswered.forEach(qAns => {
        idQuestionsAnswered.push(qAns.idQuestion);
    });

    var questionsWithoutAnswer = this.questions.filter(function (question) {
        return !idQuestionsAnswered.includes(question.id);
    });

    questionsWithAnswer.forEach(question => {
        var isAvailable = question.available;
        if (isAvailable) {
            var checked = isAvailable ? 'checked' : '';
            var textChecked = isAvailable ? 'Available' : 'Not available';
            var blockQuestion = "<div class='col s12 m12 hoverable' id='" + question["title"] + "'>" +
                "<div class='card blue-grey darken-1'>" +
                "<div class='card-content white-text'>" +
                "<span class='card-title'>" + question["title"] + "</span>" +
                "</div>" +
                "</div>" +
                "</div>";
            $('#containerQuestionsAnswered').append(blockQuestion);
        }
    });

    questionsWithoutAnswer.forEach(question => {
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
                "<a href='#' onclick='viewThisQuestion(" + question["id"] + ")'><i class='material-icons alignToText'>visibility</i> Answer!</a>" +
                "</div>" +
                "</div>" +
                "</div>";
            $('#containerQuestions').append(blockQuestion);
        }
    });

    var textQuestionsAnswered = questionsWithAnswer.length === 0 ? 'You have not answered any questions yet' : 'Questions answered!';
    var textQuestionsAvailable = questionsWithoutAnswer.length === 0 ? 'Congratulations! You have answered all the questions.' : 'Questions available!';
    $('#headerAvailableQuestions').text(textQuestionsAvailable);
    $('#headerAnsweredQuestions').text(textQuestionsAnswered);
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