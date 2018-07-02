window.onload = function () {
    init();
};

var saveToken = null;
var answersSolutionStudent = [];
var questionsWithoutAnswer = [];
var questionsSolutionStudent = [];

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
        this.saveToken = localStorage.getItem('X-Token');
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

function getAllQuestions() {
    var questionsToProcess = [];
    return new Promise((resolve, reject) => {
        this.requestApi('GET', 'questions', null, this.saveToken).then((response) => {
            if (response !== null && response !== undefined) {
                var resParsered = JSON.parse(response);
                var questionsParsered = resParsered.cuestions;
                if (questionsParsered.length > 0) {
                    questionsParsered.map((question) => {
                        var q = question.cuestion;
                        if (q.enum_disponible) {
                            questionsToProcess.push(q);
                        }
                    });
                }
                resolve(questionsToProcess);
            }
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
}

function setDataToPage() {
    $('#hiMaster')[0].innerText = "Hola " + this.userLogged["username"];
    getQuestions();
}

function getQuestionsAnsweredByUser() {
    var questionsAnswered = [];
    return new Promise((resolve, reject) => {
        this.requestApi('GET', 'solutions', null, this.saveToken).then((response) => {
            if (response !== null && response !== undefined) {
                var resParsered = JSON.parse(response);
                var solutionsParsered = resParsered.soluciones;
                if (solutionsParsered.length > 0) {
                    solutionsParsered.map((solution) => {
                        var sol = solution.answer;
                        if (sol.student === this.userLogged.username) {
                            questionsAnswered.push(sol);
                        }
                    });
                }
                resolve(questionsAnswered);
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

function getQuestions() {
    $('#containerQuestions').empty();

    // TODAS LAS CUESTIONES QUE ESTAN EN BBDD Y QUE ESTAN DISPONIBLES
    this.getAllQuestions().then((res) => {
        console.log(res);
        if (res !== null && res !== undefined) {
            this.questionsAvailable = res;
            this.numQuestions = this.questionsAvailable.length;
            // TODAS LAS CUESTIONES QUE EL USUARIO HA RESPONDIDO
            this.getQuestionsAnsweredByUser().then((questionsAnswered) => {
                console.log(questionsAnswered);
                if (questionsAnswered !== null && questionsAnswered !== undefined) {
                    this.answersSolutionStudent = questionsAnswered;
                }

                // HAY QUE SACAR LAS CUESTIONES QUE EL USUARIO NO HA RESPONDIDO
                if (this.answersSolutionStudent.length > 0) {
                    this.answersSolutionStudent.map((answer) => {
                        var idQuestion = answer.idQuestion;
                        this.questionsAvailable.map((question) => {
                            if (question.idCuestion !== idQuestion) {
                                this.questionsWithoutAnswer.push(question);
                            } else {
                                this.questionsSolutionStudent.push(question);
                            }
                        })
                    });
                } else {
                    this.questionsWithoutAnswer = this.questionsAvailable;
                }

                // ELIMINAMOS LAS PREGUNTAS QUE EL USUARIO HA CONTESTADO DE questionsWithoutStudent
                var aux = [];
                this.questionsSolutionStudent.forEach((q) => {
                    this.questionsWithoutAnswer.map((question, index) => {
                        if (question.idCuestion === q.idCuestion) {
                            aux.push(index);
                        }
                    });
                });

                aux.forEach((i) => {
                    this.questionsWithoutAnswer.splice(i, 1);;
                });

                this.makeStructToQuestionsWithAnswer();
                this.makeStructToQuestionsWithoutAnswer();

                var textQuestionsAnswered = this.answersSolutionStudent.length === 0 ? 'You have not answered any questions yet' : 'Questions answered!';
                var textQuestionsAvailable = this.questionsWithoutAnswer.length === 0 ? 'Congratulations! You have answered all the questions.' : 'Questions available!';
                $('#headerAvailableQuestions').text(textQuestionsAvailable);
                $('#headerAnsweredQuestions').text(textQuestionsAnswered);
            }).catch((err) => {
                if (err.status === 404) {
                    this.answersSolutionStudent = [];
                    this.questionsWithoutAnswer = this.questionsAvailable;
                    this.makeStructToQuestionsWithAnswer();
                    this.makeStructToQuestionsWithoutAnswer();

                    var textQuestionsAnswered = this.answersSolutionStudent.length === 0 ? 'You have not answered any questions yet' : 'Questions answered!';
                    var textQuestionsAvailable = this.questionsWithoutAnswer.length === 0 ? 'Congratulations! You have answered all the questions.' : 'Questions available!';
                    $('#headerAvailableQuestions').text(textQuestionsAvailable);
                    $('#headerAnsweredQuestions').text(textQuestionsAnswered);
                }
            })
        }
    });
}

function makeStructToQuestionsWithoutAnswer() {
    this.questionsWithoutAnswer.forEach(question => {
        var isAvailable = question.enum_disponible;
        if (isAvailable) {
            var checked = isAvailable ? 'checked' : '';
            var textChecked = isAvailable ? 'Available' : 'Not available';
            var blockQuestion = "<div class='col s6 m6 hoverable' id='" + question.enum_descripcion + "'>" +
                "<div class='card blue-grey darken-1'>" +
                "<div class='card-content white-text'>" +
                "<span class='card-title'>" + question.enum_descripcion + "</span>" +
                "</div>" +
                "<div class='card-action'>" +
                "<a href='#' onclick='viewThisQuestion(" + question.idCuestion + ")'><i class='material-icons alignToText'>visibility</i> Answer!</a>" +
                "</div>" +
                "</div>" +
                "</div>";
            $('#containerQuestions').append(blockQuestion);
        }
    });
}

function makeStructToQuestionsWithAnswer() {
    this.questionsSolutionStudent.forEach(question => {
        var isAvailable = question.enum_disponible;
        if (isAvailable) {
            var blockQuestion = "<div class='col s6 m6 hoverable' id='" + question.enum_descripcion + "'>" +
                "<div class='card blue-grey darken-1'>" +
                "<div class='card-content white-text'>" +
                "<span class='card-title'>" + question.enum_descripcion + "</span>" +
                "</div>" +
                "</div>" +
                "</div>";
            $('#containerQuestionsAnswered').append(blockQuestion);
        }
    });
}

function viewThisQuestion(questionId) {
    setSelectedQuestion(questionId);
    window.location.href = "./viewAnswerQuestion.html";
}

function setSelectedQuestion(questionId) {
    this.questionsAvailable.map(function (question) {
        if (question.idCuestion === questionId) {
            this.questionSelected = question;
        }
    });
    localStorage.setItem('questionSelected', JSON.stringify(this.questionSelected));
}

function logout() {
    localStorage.removeItem('userLogged');
    localStorage.removeItem('questionSelected');
}