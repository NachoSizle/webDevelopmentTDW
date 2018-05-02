window.onload = function () {
    init();
};

var userLogged = null;
var questionSelected = null;
var answersSolutionStudents = [];
var proposedSolutionToQuestionSelected = null;

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
        var ansSolStudent = localStorage.getItem('answersSolutionStudent');
        this.answersSolutionStudents = JSON.parse(ansSolStudent);
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
    this.proposedSolutionToQuestionSelected = this.answersSolutionStudents.filter(function (propSol) {
        return propSol.idQuestion === this.questionSelected.id;
    });

    $('.firstTitle').text('Question: ' + this.questionSelected.title);
    setAnswersToCollapsible();
}

function setAnswersToCollapsible() {
    if (this.proposedSolutionToQuestionSelected.length > 0) {
        $('#noAnswers').attr('hidden');
        this.proposedSolutionToQuestionSelected.map(function (propSolution, index) {
            var structFollowingSolutions = getAnswersFromFollowingSolutions(propSolution.answers);
            var structSolution = "<li>" +
                "<div class='collapsible-header' onclick='changeAnswerSelected(" + propSolution.idQuestion + ")'>" +
                "<i class='material-icons'>filter_drama</i>" + propSolution.student + "</div>" +
                "<div class='collapsible-body'>" +
                "<h5>Answer: " + propSolution.proposedSolution + "</h5>" +
                "<div id='answersFromStudent" + index + "'></div>" +
                "</div>" +
                "</li>";
            $('#collapsibleOfAnswers').append(structSolution);
            structFollowingSolutions.forEach(struct => {
                $('#answersFromStudent' + index).append(struct);
            });
        });
    } else {
        $('#noAnswers').removeAttr('hidden');
    }
}

function getAnswersFromFollowingSolutions(answers) {
    var numSolutions = answers.length;
    var structFollowingSolutions = [];
    answers.map(function (answerStudent) {
        var struct = null;
        var followingSolutionTitle = answerStudent.followingSolution.title;
        var stateFollowingSolution = answerStudent.followingSolution.isGood;
        var answerFollowingSolution = answerStudent.answer;
        var typeIcon = answerFollowingSolution === stateFollowingSolution ? 'check_circle' : 'cancel';
        var correctAnswer = answerFollowingSolution === stateFollowingSolution ? 'correctAnswer' : 'incorrectAnswer';

        var proposedRationing = answerStudent.proposeRationing.proposedRationing;

        struct = "<div class='containerFollowingSolution'>" +
            "<div class='followingSolution'>" +
            "<span class='right'>" +
            "<i class='material-icons " + correctAnswer + "'>" + typeIcon + "</i>" +
            "</span>" +
            "<h5 class='titleFollowingSolution'> Solution " + answerStudent.idAnswer + ": " + followingSolutionTitle + "</h5>" +
            "<p class='proposedRationingFollowingSolution'>Proposed rationing: " + proposedRationing + "</p>";
        if (answerStudent.followingSolution.rationings.length > 0) {
            var structsRationgins = getFollowingRationings(answerStudent);
            struct += structsRationgins;
        }
        struct += "</div>" +
            "</div>";
        structFollowingSolutions.push(struct);
    });
    return structFollowingSolutions;
}

function getFollowingRationings(answerStudent) {
    var struct = "<div class='containerFollowingRationings'>";
    answerStudent.followingSolution.rationings.forEach(rationing => {
        var stateRationing = rationing.justifyRationing;
        var titleRationing = rationing.title;
        var rationingStudent = answerStudent.proposedRationingsAnswers.filter(function (propRatio) {
            return propRatio.idRationing === rationing.id;
        });
        var answerRationingStudent = false;
        if (rationingStudent !== undefined && rationingStudent !== null) {
            answerRationingStudent = rationingStudent[0].answer;
        };
        var typeIcon = answerRationingStudent === stateRationing ? 'check_circle' : 'cancel';
        var correctAnswer = answerRationingStudent === stateRationing ? 'correctAnswer' : 'incorrectAnswer';

        var structRatio = "<div class='followingRationing'>" +
            "<span class='right'>" +
            "<i class='material-icons " + correctAnswer + "'>" + typeIcon + "</i>" +
            "</span>" +
            "<h5 class='titleFollowingSolution'> Rationing " + rationing.id + ": " + titleRationing + "</h5>" +
            "</div>";
        struct += structRatio;
    });

    struct += "</div>";

    return struct;
}

function changeAnswerSelected(idPropSolution) {
    /*
    this.solutionSelected = this.questionSelected.solutions.filter(function (solution) {
        return solution.id === idSolution;
    });
    */
}

function backToPreviousPage() {
    window.location.href = './masterMainPage.html';
}