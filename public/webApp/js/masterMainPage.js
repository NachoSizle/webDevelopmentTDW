window.onload = function () {
    init();
};

var userLogged = null;
var questions = [];
var numQuestions = 0;
var questionSelected = null;
var solutionsToReview = [];

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

        var solutionsReview = localStorage.getItem('solutionsToReview');
        this.solutionsToReview = JSON.parse(solutionsReview);

        var questionsMaster = localStorage.getItem('questionsMaster');
        this.questions = JSON.parse(questionsMaster);
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
    console.log('Get questions');

    //LLAMAR A LA API PARA QUE NOS TRAIGA TODAS LAS CUESTIONES
    //QUE ESTAN EN LA BASE DE DATOS PARA EL MAESTRO QUE HA HECHO LOGIN
    /*
    var questions = this.userLogged.cuestiones;
    if (questions.length > 0) {
        this.getQuestionsFromApi().then((res) => {
            console.log(res);
            this.questions = res;
            this.numQuestions = this.questions.length;

            this.questions.forEach(question => {
                var checked = question.enum_disponible ? 'checked' : '';
                var textChecked = question.enum_disponible ? 'Available' : 'Not available';
                var hasSolutionToReview = getSolutionProposedToQuestion(question.idCuestion) ? '' : 'hidden';
                var blockQuestion = "<div class='col s12 m6 hoverable' id='" + question.enum_descripcion + "'>" +
                    "<div class='card blue-grey darken-1'>" +
                    "<div class='card-content white-text noPadBottom'>" +
                    "<span class='card-title'>" + question.enum_descripcion + "</span>" +
                    "<label>" +
                    "<input type='checkbox'" + checked + " disabled/>" +
                    "<span>" + textChecked + "</span>" +
                    "</label>" +
                    "</div>" +
                    "<div class='card-action col s12 m12'>" +
                    "<a href='#' onclick='viewThisQuestion(" + question.idCuestion + ")' class='linkBtnCard'><i class='material-icons iconBtnCard'>visibility</i>View</a>" +
                    "<a href='#remModal' onclick='setQuestion(" + question.idCuestion + ")' class='modal-trigger linkBtnCard'><i class='material-icons iconBtnCard'>delete_forever</i>Remove</a>" +
                    "<a href='#' onclick='viewAnswerFromStudents(" + question.idCuestion + ")' class='linkBtnCard'><i class='material-icons iconBtnCard'>visibility</i>View Answers</a>" +
                    "<a href='#' " + hasSolutionToReview + " onclick='reviewAnswerFromStudents(" + question.idCuestion + ")' class='linkBtnCard'><i class='material-icons iconBtnCard'>sim_card_alert</i>Review answers</a>" +
                    "</div>" +
                    "</div>" +
                    "</div>";
                $('#containerQuestions').append(blockQuestion);
            });
        }).catch((err) => {
            console.log(err);
        });
        */


    this.numQuestions = this.questions.length;

    this.questions.forEach(question => {
        var checked = question.available ? 'checked' : '';
        var textChecked = question.available ? 'Available' : 'Not available';
        var hasSolutionToReview = getSolutionProposedToQuestion(question.id) ? '' : 'hidden';
        var blockQuestion = "<div class='col s12 m6 hoverable' id='" + question.title + "'>" +
            "<div class='card blue-grey darken-1'>" +
            "<div class='card-content white-text noPadBottom'>" +
            "<span class='card-title'>" + question.title + "</span>" +
            "<label>" +
            "<input type='checkbox'" + checked + " disabled/>" +
            "<span>" + textChecked + "</span>" +
            "</label>" +
            "</div>" +
            "<div class='card-action col s12 m12'>" +
            "<a href='#' onclick='viewThisQuestion(" + question.id + ")' class='linkBtnCard'><i class='material-icons iconBtnCard'>visibility</i>View</a>" +
            "<a href='#remModal' onclick='setQuestion(" + question.id + ")' class='modal-trigger linkBtnCard'><i class='material-icons iconBtnCard'>delete_forever</i>Remove</a>" +
            "<a href='#' onclick='viewAnswerFromStudents(" + question.id + ")' class='linkBtnCard'><i class='material-icons iconBtnCard'>visibility</i>View Answers</a>" +
            "<a href='#' " + hasSolutionToReview + " onclick='reviewAnswerFromStudents(" + question.id + ")' class='linkBtnCard'><i class='material-icons iconBtnCard'>sim_card_alert</i>Review answers</a>" +
            "</div>" +
            "</div>" +
            "</div>";
        $('#containerQuestions').append(blockQuestion);
    });
}

function getQuestionsFromApi() {
    var questions = this.userLogged.cuestiones;
    var questionsArrayPromise = [];

    return new Promise((resolve, reject) => {
        questions.forEach((questionId) => {
            var promise = new Promise((resolve, reject) => {
                this.requestApi('GET', 'questions/' + questionId, null).then((response) => {
                    console.log(response);
                    if (response !== null && response !== undefined) {
                        var resParsered = JSON.parse(response);
                        var resGoodData = this.parseCuestion(resParsered);
                        resolve(resGoodData);
                    }
                }).catch((err) => {
                    console.log(err);
                    reject(err);
                });
            });
            questionsArrayPromise.push(promise);
        });

        Promise.all(questionsArrayPromise).then((values) => {
            console.log(values);
            resolve(values);
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
}

function parseCuestion(questionData) {
    if (questionData !== null && questionData !== undefined) {
        questionData.cuestion.creador = this.userLogged.id;
    }
    return questionData;
}

function getSolutionProposedToQuestion(idQuestion) {
    var hasSolutionToReview = false;
    if (this.solutionsToReview.length > 0) {
        this.solutionsToReview.forEach(solution => {
            if (solution.idQuestion === idQuestion) {
                hasSolutionToReview = true;
            }
        });
    }
    return hasSolutionToReview;
}

function closeInfoModal() {
    $('#infoNoQuestionsModal').closeModal();
}

function reviewAnswerFromStudents(questionId) {
    setSelectedQuestion(questionId);
    window.location.href = "./reviewAnswerStudent.html";
}

function viewAnswerFromStudents(questionId) {
    setSelectedQuestion(questionId);
    window.location.href = "./viewAnswerStudent.html";
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