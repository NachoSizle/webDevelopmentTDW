window.onload = function () {
    init();
};

var userLogged = null;
var questionSelected = null;
var solutionsToReview = [];
var proposedSolutionToQuestionSelected = [];
var solutionSelected = null;
var actualPropSolIndex = null;
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
        this.numSolutions = this.questionSelected.solutions.length;

        var solutionsReview = localStorage.getItem('solutionsToReview');
        this.solutionsToReview = JSON.parse(solutionsReview);
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
    this.proposedSolutionToQuestionSelected = this.solutionsToReview.filter(function (propSol) {
        return propSol.idQuestion === this.questionSelected.id;
    });

    $('.firstTitle').text('Question: ' + this.questionSelected.title);
    setAnswersToCollapsible();
}

function setAnswersToCollapsible() {
    if (this.proposedSolutionToQuestionSelected.length > 0) {
        $('#noAnswers').attr('hidden');
        this.proposedSolutionToQuestionSelected.map(function (propSolution) {
            var textPropSolutionSelected = propSolution.proposedSolution;
            var structSolution = "<li class='solutionRow' id='solution" + propSolution.idAnswerToReview + "'>" +
                "<div class='collapsible-header' onclick='changeAnswerSelected(" + propSolution.idQuestion + ")'>" +
                "<i class='material-icons'>filter_drama</i>" + propSolution.student + "</div>" +
                "<div class='collapsible-body'>" +
                "<h5>Answer: " + textPropSolutionSelected + "</h5>" +
                "<div class='containerBtnAction'>" +
                "<a href='#askTypeQuestion' class='modal-trigger' onclick='setActualPropSol(" + propSolution.idAnswerToReview + ")'>Add to batery</a>" +
                "<a href='#' onclick='discardSolution(" + propSolution.idAnswerToReview + ")'>Remove!</a>" +
                "</div>" +
                "</div>" +
                "</li>";
            $('#collapsibleOfAnswers').append(structSolution);

        });
    } else {
        $('#noAnswers').removeAttr('hidden');
    }
}

function setActualPropSol(index) {
    this.actualPropSolIndex = index;
}

function addSolutionToBatery() {
    var isGoodSolution = $('#checkTypeSolution').prop('checked');
    $('#checkTypeSolution').prop('checked', false);

    var solutionObj = {
        "title": this.solutionSelected[0].proposedSolution,
        "id": this.numSolutions++,
        "isGood": isGoodSolution,
        "rationings": []
    };

    this.questionSelected.solutions.push(solutionObj);
    saveSolution();
}

function saveSolution() {
    localStorage.setItem('questionSelected', JSON.stringify(this.questionSelected));

    var questions = localStorage.getItem('questionsMaster');
    var questionsParsered = JSON.parse(questions);

    var newQuestions = questionsParsered.filter(function (question) {
        return question.id !== this.questionSelected.id;
    });

    newQuestions.push(this.questionSelected);
    localStorage.setItem('questionsMaster', JSON.stringify(newQuestions));
    if (!this.editSolutionMode) {
        this.numSolutions++;
    }
    discardSolution(this.actualPropSolIndex);
}

function discardSolution(idQuestion) {
    $('#solution' + idQuestion).remove();
    var numRows = $('.solutionRow');
    var newProposedSolutionToQuestionSelected = this.proposedSolutionToQuestionSelected.filter(function (propSol) {
        return propSol.idAnswerToReview !== idQuestion;
    });
    localStorage.setItem('solutionsToReview', JSON.stringify(newProposedSolutionToQuestionSelected));
    if (numRows.length === 0) {
        $('#noAnswers').prop('hidden', false);
    }
}

function changeAnswerSelected(idPropSolution) {
    this.solutionSelected = this.proposedSolutionToQuestionSelected.filter(function (solution) {
        return solution.idQuestion === idPropSolution;
    });
}

function backToPreviousPage() {
    window.location.href = './masterMainPage.html';
}