window.onload = function () {
    init();
};

var userLogged = null;
var questionSelected = null;
var solutionSelected = null;
var numSolutions = 0;
var numRationings = 0;
var numSolutionToEdit = 0;
var editSolutionMode = false;

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
        $('#noSolutions').attr('hidden');
        this.questionSelected.solutions.map(function (sol) {
            var checked = sol.isGood ? '' : 'checked';
            var hidden = sol.isGood ? '' : 'hidden';
            var structSolution = "<li>" +
                "<div class='collapsible-header' onclick='changeSolutionSelected(" + sol.id + ")'>" +
                "<i class='material-icons'>filter_drama</i>First</div>" +
                "<div class='collapsible-body'>" +
                "<h5>Answer: " + sol.title + "</h5>" +
                "<label>" +
                "<input type='checkbox' " + checked + " disabled/>" +
                "<span>Good</span>" +
                "</label>" +
                "<div class='row buttonRationing'>" +
                "<a href='#addRationing' class='modal-trigger' " + hidden + ">Add Rationing</a>" +
                "<a href='#' " + hidden + " onclick='showRationing(" + sol.id + ")'>Show rationings</a>" +
                "<a href='#' onclick='editSolution(" + sol.id + ")' " + !hidden + ">Edit solution</a>" +
                "</div>" +
                "</div>" +
                "</li>";
            $('#collapsibleOfSolutions').append(structSolution)
        });
    } else {
        $('#noSolutions').removeAttr('hidden');
    }
}

function changeSolutionSelected(idSolution) {
    console.log("CHANGE!!!");
    this.solutionSelected = this.questionSelected.solutions.filter(function (solution) {
        return solution.id === idSolution;
    });
    this.numRationings = this.solutionSelected[0].rationings !== undefined ? this.solutionSelected[0].rationings.length : 0;
    if ($('#rationingsContainer').is(':visible')) {
        $('#rationingsContainer').hide();
    }
}

function editSolution(idSolution) {
    this.editSolutionMode = true;
    this.numSolutionToEdit = idSolution;
    $('#questionSolutionTA').val(this.solutionSelected[0].title);
    this.questionSelected.solutions.splice(this.numSolutionToEdit, 1);
    $('#addSolution').modal('open');
}

function addSolution() {
    var solutionTA = $('#questionSolutionTA').val();
    $('#questionSolutionTA').val('');

    var isBadSolution = $('#goodSolutionCheck').prop('checked');
    $('#goodSolutionCheck').removeProp('checked');

    this.numSolution = this.editSolutionMode ? this.numSolutionToEdit : this.numSolutions;

    var solutionObj = {
        "title": solutionTA,
        "id": this.numSolution,
        "isGood": isBadSolution,
        "rationings": []
    };

    if (isBadSolution) {
        //Se necesita que el usuario introduzca un racionamiento a la solucion. 
        //Si se indica que es correcto, se debe meter una justificacion.
        console.log("Is bad solution");
        var solutionRationingTA = $('#questionRationingTA').val();
        $('#questionRationingTA').val('');

        var isJustify = $('#justifyRationingCheckAddSolution').prop('checked');
        $('#justifyRationingCheckAddSolution').removeProp('checked');
        var solutionObj = {
            "title": solutionTA,
            "id": this.numSolution,
            "isGood": isBadSolution,
            "rationings": [{
                "title": solutionRationingTA,
                "id": this.numRationings,
                "justifyRationing": isJustify
            }]
        };
        this.numRationings++;
    }

    this.questionSelected.solutions.push(solutionObj);
    this.editSolutionMode = false;

    console.log(this.questionSelected);
    saveQuestion();
}

function addRationing() {
    console.log("Set rationing");
    //Añadimos el razonamiento a los razonamientos que tenemos en solucionSelected[0]
    console.log(this.solutionSelected[0]);

    var solutionAddRationingTA = $('#questionAddRationingTA').val();
    $('#questionAddRationingTA').val('');

    var isJustify = $('#justifyRationingCheck').prop('checked');
    $('#justifyRationingCheck').removeProp('checked');

    var rationingObj = {
        "title": solutionAddRationingTA,
        "id": this.numRationings,
        "justifyRationing": isJustify
    };

    this.solutionSelected[0].rationings.push(rationingObj);
    saveQuestion();
}

function showRationing(idSolution) {
    console.log("Show rationings");
    $('#rationingsContainer').toggle("slow");
    if (this.numRationings > 0) {
        $('.ration').remove();
        $('#noRationings').attr('hidden');
        setRationingsToCollapsible(idSolution);
    } else {
        $('#noRationings').removeAttr('hidden');
    }
}

function setRationingsToCollapsible(idSolution) {
    $('#noRationings').attr('hidden');
    this.solutionSelected[0].rationings.map(function (sol) {
        var isChecked = sol.justifyRationing ? 'checked' : '';
        var isJustify = sol.justifyRationing ? 'Justify' : 'Not justify';
        var isJustifyColor = sol.justifyRationing ? 'justifySwitch' : 'notJustifySwitch';
        var structSolution = "<li class='ration'>" +
            "<div class='collapsible-header'>" +
            "<i class='material-icons'>filter_drama</i>First</div>" +
            "<div class='collapsible-body'>" +
            "<h5>Ration: " + sol.title + "</h5>" +
            "<div class='switch'>" +
            "<label class='lblAvailable " + isJustifyColor + "'>" +
            "<input type='checkbox' " + isChecked + " disabled>" +
            "<span class='lever'></span>" + isJustify + "</label>" +
            "</div>" +
            "</div>" +
            "</li>";
        $('#collapsibleOfRationings').append(structSolution);
    });
}

function saveQuestion() {
    setAvailableQuestion();
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
    backToPreviousPage();
}

function setAvailableQuestion() {
    var isChecked = $('#checkboxAvailable').prop("checked");
    this.questionSelected.available = isChecked;
}

function backToPreviousPage() {
    window.location.href = './masterMainPage.html';
}

function showSolutions() {
    $('#solutionsContainer').toggle("slow");
    if ($('#rationingsContainer').is(':visible')) {
        $('#rationingsContainer').hide();
    }
}