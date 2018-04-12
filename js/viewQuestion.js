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
        $('.collapsible').collapsible();
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
    $('#badgeNumSolutions').text(this.numSolutions ? this.numSolutions : 0);

    setSolutionsToCollapsible();
}

function setSolutionsToCollapsible() {
    if (this.numSolutions > 0) {
        this.questionSelected.solutions.map(function (sol) {
            var checked = sol.isGood ? 'checked' : '';
            var structSolution = "<li>" +
                "<div class='collapsible-header'>" +
                "<i class='material-icons'>filter_drama</i>First</div>" +
                "<div class='collapsible-body'>" +
                "<h5>Answer: " + sol.title + "</h5>" +
                "<label>" +
                "<input type='checkbox' checked disabled/>" +
                "<span>Good</span>" +
                "</label>" +
                "<div class='row buttonRationing'>" +
                "<a href='#' class=''>Add Rationing</a>" +
                "<a href='#' class=''>Show rationings</a>" +
                "</div>" +
                "</div>" +
                "</li>";
            $('#collapsibleOfSolutions').append(structSolution)
        });
    }
}

function addSolution() {
    var solutionTA = $('#questionSolutionTA').val();
    $('#questionSolutionTA').val('');

    var isGoodSolution = $('#goodSolutionCheck').prop('checked');
    $('#goodSolutionCheck').removeProp('checked');

    var numOfSolutions = this.numSolutions++;

    if (isGoodSolution) {
        //Se necesita que el usuario introduzca un racionamiento a la solucion. 
        //Si se indica que es correcto, se debe meter una justificacion.
    }

    var solutionObj = {
        "title": solutionTA,
        "id": numOfSolutions,
        "isGood": isGoodSolution
    };

    this.questionSelected.solutions.push(solutionObj);
    console.log(this.questionSelected);
    saveQuestion();
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

function showSolutions() {
    $('#solutionsContainer').toggle("slow");
}