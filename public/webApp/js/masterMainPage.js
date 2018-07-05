window.onload = function () {
    init();
};

var saveToken = null;
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

        this.saveToken = localStorage.getItem('X-Token');

        var user = localStorage.getItem('userLogged');
        this.userLogged = JSON.parse(user);

        var solutionsReview = localStorage.getItem('solutionsToReview');
        this.solutionsToReview = JSON.parse(solutionsReview) ? JSON.parse(solutionsReview) : [];
        this.numSolutionsToReview = this.solutionsToReview.length;
        if (this.solutionsToReview.length > 0) {
            var answerReviewed = localStorage.getItem('answerReviewed');
            var answerReviewedParsered = JSON.parse(answerReviewed) ? JSON.parse(answerReviewed) : null;
            if (answerReviewedParsered !== null && answerReviewedParsered !== undefined) {
                var arrAux = [];
                this.solutionsToReview.map((sol) => {
                    if (sol.answer.idAnswer !== answerReviewedParsered.answer.idAnswer) {
                        arrAux.push(sol);
                    }
                });
                localStorage.setItem('solutionsToReview', JSON.stringify(arrAux));
                this.solutionsToReview = arrAux;
            }
            this.setQuestionsToReview();
        } else {
            $('.answerStudentsTitle').text('No hay nada que corregir! Descansa!');
        }

        $('#containerQuestionsToReview').removeAttr('hidden');

        setDataToPage();
    }
}

function setQuestionsToReview() {
    this.solutionsToReview.forEach((solutionFromStudent, index) => {
        var question = solutionFromStudent.question;
        var answer = solutionFromStudent.answer;
        var blockQuestion = "<div class='col s12 m6 hoverable' id='" + question.enum_descripcion + "'>" +
            "<div class='card blue-grey darken-1'>" +
            "<div class='card-content white-text noPadBottom'>" +
            "<span class='card-title'>Question: " + question.enum_descripcion + "</span>" +
            "<span>Student: " + answer.student + "</span>" +
            "</div>" +
            "<div class='card-action col s12 m12'>" +
            "<a href='#' onclick='reviewAnswerFromStudents(" + index + ")' class='linkBtnCard'><i class='material-icons iconBtnCard'>sim_card_alert</i>Review answers</a>" +
            "</div>" +
            "</div>" +
            "</div>";
        $('#containerQuestionsToReview').append(blockQuestion);
    });
}

function getQuestionsFromMaster() {
    var idMaster = this.userLogged.id;
    var questionsToProcess = [];
    return new Promise((resolve, reject) => {
        this.requestApi('GET', 'questions', null, this.saveToken).then((response) => {
            if (response !== null && response !== undefined) {
                var resParsered = JSON.parse(response);
                var questionsParsered = resParsered.cuestions;
                if (questionsParsered.length > 0) {
                    questionsParsered.map((question) => {
                        var q = question.question.cuestion;
                        var creator = q.creador.usuario.id;
                        if (creator === idMaster) {
                            var obj = {
                                'cuestion': q,
                                'numSolution': question.numSolutions
                            };
                            questionsToProcess.push(obj);
                        }
                    });
                }
                resolve(questionsToProcess);
            }
        }).catch((err) => {
            console.log(err);
            if (err.status === 404) {
                resolve([]);
            }
            reject(err);
        });
    });
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
    $('#userLogged')[0].innerText = "User logged: " + this.userLogged["username"];

    getQuestions();
}

function getQuestions() {
    $('#containerQuestions').empty();
    console.log('Get questions');

    //LLAMAR A LA API PARA QUE NOS TRAIGA TODAS LAS CUESTIONES
    //QUE ESTAN EN LA BASE DE DATOS PARA EL MAESTRO QUE HA HECHO LOGIN

    this.getQuestionsFromMaster().then((res) => {
        if (res.length > 0) {
            $('.secondMainTitle').show();
            $('.noQuestionsYet').hide();
            $('.btnNewQuestion').hide();
            $('.noQuestionsYet').hide();
            this.questions = res;
            this.numQuestions = this.questions.length;

            this.questions.forEach(question => {
                var cuestionRes = question.cuestion;
                var checked = cuestionRes.enum_disponible ? 'checked' : '';
                var textChecked = cuestionRes.enum_disponible ? 'Available' : 'Not available';
                var hasSolutionToReview = getSolutionProposedToQuestion(cuestionRes.idCuestion) ? '' : 'hidden';
                var blockQuestion = "<div class='col s12 m6 hoverable' id='" + cuestionRes.enum_descripcion + "'>" +
                    "<div class='card blue-grey darken-1'>" +
                    "<div class='card-content white-text noPadBottom'>" +
                    "<span class='card-title'>" + cuestionRes.enum_descripcion + "</span>" +
                    "<label>" +
                    "<input type='checkbox'" + checked + " disabled/>" +
                    "<span>" + textChecked + "</span>" +
                    "</label>" +
                    "</div>" +
                    "<div class='card-action col s12 m12'>" +
                    "<a href='#' onclick='viewThisQuestion(" + cuestionRes.idCuestion + ")' class='linkBtnCard'><i class='material-icons iconBtnCard'>visibility</i>View</a>" +
                    "<a href='#remModal' onclick='setQuestion(" + cuestionRes.idCuestion + ")' class='modal-trigger linkBtnCard'><i class='material-icons iconBtnCard'>delete_forever</i>Remove</a>" +
                    "<a href='#' onclick='viewAnswerFromStudents(" + cuestionRes.idCuestion + ")' class='linkBtnCard'><i class='material-icons iconBtnCard'>visibility</i>View Answers</a>" +
                    "<span class='linkBtnCard'>Solutions: " + question.numSolution + "</span>" +
                    "</div>" +
                    "</div>" +
                    "</div>";
                $('#containerQuestions').append(blockQuestion);
            });
        } else {
            $('.noQuestionsYet').show();
            $('.secondMainTitle').hide();
            $('.btnNewQuestion').show();
            $('.noQuestionsYet').show();
            $('#infoNoQuestionsModal').modal('open');
        }
    }).catch((err) => {
        console.log(err);
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

function reviewAnswerFromStudents(index) {
    var answerSelected = this.solutionsToReview[index];
    localStorage.setItem('answerToReview', JSON.stringify(answerSelected));
    localStorage.setItem('review', true);
    window.location.href = "./viewAnswerStudent.html";
}

function viewAnswerFromStudents(questionId) {
    setSelectedQuestion(questionId);
    localStorage.setItem('onlyUserLogged', false);
    localStorage.setItem('answerToReview', null);
    localStorage.setItem('review', false);
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
        if (question.idCuestion === questionId) {
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
        "enum_descripcion": taValue,
        "creador": this.userLogged.id,
        "enum_disponible": false
    };

    var newQuestionParsered = JSON.stringify(newQuestion);

    this.requestApi('POST', 'questions', newQuestionParsered, this.saveToken).then((res) => {
        if (res !== null && res !== undefined) {
            getQuestions();
        }
    }).catch((err) => {
        $('#warningText').text('You not a Admin user');
        $('#warningModal').modal('open');
    });
}

function removeQuestion() {
    var questionParsered = JSON.parse(localStorage.getItem('questionSelected'));
    var questionId = questionParsered.idCuestion;

    this.requestApi('DELETE', 'questions/' + questionId, null, this.saveToken).then(() => {
        getQuestions();
    });
}

function logout() {
    localStorage.removeItem('userLogged');
    localStorage.removeItem('questionSelected');
}