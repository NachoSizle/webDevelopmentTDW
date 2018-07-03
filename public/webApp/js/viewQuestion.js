window.onload = function () {
    init();
};

var userLogged = null;
var questionSelected = null;
var solutionSelected = null;
var answersAvailable = null;
var rationingsAvailable = null;
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

        this.saveToken = localStorage.getItem('X-Token');
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
    $('#userLogged')[0].innerText = "User logged: " + this.userLogged["username"];

    $('#titleQuestionCard').text(this.questionSelected.enum_descripcion);
    $('#questionTitleAddSolution').text(this.questionSelected.enum_descripcion);
    if (this.questionSelected.enum_disponible) {
        $('#checkboxAvailable').attr('checked', 'checked');
    }
    this.getSolutionsFromQuestion().then((res) => {
        this.answersAvailable = res;
        this.numSolutions = this.answersAvailable.length;
        $('#badgeNumSolutions').text(this.numSolutions ? this.numSolutions : 0);

        setSolutionsToCollapsible();
    }).catch((err) => {
        console.log(err);
    });
}

function getSolutionsFromQuestion() {
    var solutionToProcess = [];
    return new Promise((resolve, reject) => {
        this.requestApi('GET', 'solutions', null, this.saveToken).then((response) => {
            if (response !== null && response !== undefined) {
                var resParsered = JSON.parse(response);
                var solutionsParsered = resParsered.soluciones;
                if (solutionsParsered.length > 0) {
                    solutionsParsered.map((solution) => {
                        var answer = solution.answer;
                        var questionId = answer.idQuestion;
                        if (questionId === this.questionSelected.idCuestion) {
                            solutionToProcess.push(answer);
                        }
                    });
                }
                resolve(solutionToProcess);
            }
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
}

function setSolutionsToCollapsible() {
    if (this.numSolutions > 0) {
        $('#noSolutions').attr('hidden');
        this.answersAvailable.map(function (answer) {
            this.getIfBadAnswer(answer).then((hasRationings) => {
                var checked = !hasRationings ? 'checked' : '';
                var hidden = !hasRationings ? '' : 'hidden';
                var structSolution = "<li>" +
                    "<div class='collapsible-header' onclick='changeSolutionSelected(" + answer.idAnswer + ")'>" +
                    "<i class='material-icons'>filter_drama</i>First</div>" +
                    "<div class='collapsible-body'>" +
                    "<h5>Answer: " + answer.proposedSolution + "</h5>" +
                    "<label>" +
                    "<input type='checkbox' " + checked + " disabled/>" +
                    "<span>Good</span>" +
                    "</label>" +
                    "<div class='row buttonRationing'>" +
                    "<a href='#' onclick='showAddRationing(" + answer.idAnswer + ")' class='modal-trigger' " + hidden + ">Add Rationing</a>" +
                    "<a href='#' " + hidden + " onclick='showRationing(" + answer.idAnswer + ")'>Show rationings</a>" +
                    "<a href='#' onclick='editSolution(" + answer.idAnswer + ")' " + !hidden + ">Edit solution</a>" +
                    "</div>" +
                    "</div>" +
                    "</li>";
                $('#collapsibleOfSolutions').append(structSolution)
            });
        });
    } else {
        $('#noSolutions').removeAttr('hidden');
    }
}

function getIfBadAnswer(answer) {
    return new Promise((resolve) => {
        var answerId = answer.idAnswer;
        var rationingsToProcess = [];
        this.requestApi('GET', 'rationings', null, this.saveToken).then((res) => {
            if (res !== null && res !== undefined) {
                var resParsered = JSON.parse(res);
                var rationingsParsered = resParsered.razonamientos;
                if (rationingsParsered.length > 0) {
                    rationingsParsered.map((rationing) => {
                        var rationing = rationing.rationing;
                        var solutionId = rationing.idSolution;
                        if (solutionId === answerId) {
                            rationingsToProcess.push(rationing);
                        }
                    });
                }
                this.rationingsAvailable = rationingsToProcess;
                resolve(rationingsToProcess.length === 0);
            }
        }).catch((err) => {
            console.log(err);
        });
    });
}

function changeSolutionSelected(idAnswer) {
    this.solutionSelected = this.answersAvailable.filter(function (answer) {
        return answer.idAnswer === idAnswer;
    });
    this.numRationings = this.rationingsAvailable !== undefined ? this.rationingsAvailable.length : 0;
    if ($('#rationingsContainer').is(':visible')) {
        $('#rationingsContainer').hide();
    }
}

function confirmEditSolution() {
    var questionTA = $('#questionTitle').val();
    $('#questionTitle').val('');

    this.questionSelected.enum_descripcion = questionTA;

    var questionParsered = JSON.stringify(this.questionSelected);
    localStorage.setItem('questionSelected', questionParsered);

    $('#titleQuestionCard').text(this.questionSelected.enum_descripcion);
    $('#questionTitleAddSolution').text(this.questionSelected.enum_descripcion);
}

function editSolution(idAnswer) {
    this.editSolutionMode = true;
    this.numSolutionToEdit = idAnswer;
    $('#questionSolutionTA').val(this.solutionSelected[0].proposedSolution);
    $('#addSolution').modal('open');
}

function addSolution() {
    var solutionTA = $('#questionSolutionTA').val();
    $('#questionSolutionTA').val('');

    var isBadSolution = $('#goodSolutionCheck').prop('checked');
    $('#goodSolutionCheck').removeProp('checked');

    this.numSolution = this.editSolutionMode ? this.numSolutionToEdit : this.questionSelected.idCuestion;

    if (solutionTA !== "") {
        var solutionObj = {
            "idQuestion": this.numSolution,
            "student": this.userLogged.username,
            "questionTitle": this.questionSelected.enum_descripcion,
            "proposedSolution": solutionTA,
            "isGood": isBadSolution
        };

        var solutionParsered = JSON.stringify(solutionObj);

        this.saveSolution(solutionParsered).then((solutionSaved) => {
            var solutionSavedParsered = JSON.parse(solutionSaved);
            if (isBadSolution) {
                var solutionRationingTA = $('#questionRationingTA').val();
                $('#questionRationingTA').val('');

                var isJustify = $('#justifyRationingCheckAddSolution').prop('checked');
                $('#justifyRationingCheckAddSolution').removeProp('checked');

                var rationingObj = {
                    "idSolution": solutionSavedParsered.answer.idAnswer,
                    "justifyRationing": isJustify,
                    "title": solutionRationingTA
                };
                this.numRationings++;
                var rationingParsered = JSON.stringify(rationingObj);
                this.saveRationing(rationingParsered).then(() => {
                    this.editSolutionMode = false;
                    saveQuestion();
                });
            } else {
                this.editSolutionMode = false;
                saveQuestion();
            }
        });
    } else {
        if (isBadSolution) {
            var solutionRationingTA = $('#questionRationingTA').val();
            $('#questionRationingTA').val('');

            var isJustify = $('#justifyRationingCheckAddSolution').prop('checked');
            $('#justifyRationingCheckAddSolution').removeProp('checked');

            var rationingObj = {
                "idSolution": this.numSolution,
                "justifyRationing": isJustify,
                "title": solutionRationingTA
            };
            var rationingParsered = JSON.stringify(rationingObj);
            this.numRationings++;
            this.saveRationing(rationingParsered).then(() => {
                this.editSolutionMode = false;
                saveQuestion();
            });
        } else {
            this.editSolutionMode = false;
            saveQuestion();
        }
    }
}

function saveRationing(rationing) {
    return new Promise((resolve) => {
        this.requestApi('POST', 'rationings', rationing, this.saveToken).then((res) => {
            resolve();
        });
    })
}

function saveSolution(solution) {
    return new Promise((resolve) => {
        this.requestApi('POST', 'solutions', solution, this.saveToken).then((res) => {
            resolve(res);
        });
    })
}

function updateQuestion(question) {
    return new Promise((resolve) => {
        this.requestApi('PUT', 'questions/' + this.questionSelected.idCuestion, question, this.saveToken).then((res) => {
            resolve();
        });
    })
}

function addRationing() {
    var solutionAddRationingTA = $('#questionAddRationingTA').val();
    $('#questionAddRationingTA').val('');

    var isJustify = $('#justifyRationingCheck').prop('checked');
    $('#justifyRationingCheck').removeProp('checked');

    var rationingObj = {
        "title": solutionAddRationingTA,
        "idSolution": this.numSolution,
        "justifyRationing": isJustify
    };

    var rationingParsered = JSON.stringify(rationingObj);
    this.saveRationing(rationingParsered).then(() => {
        this.numRationings++;
        saveQuestion();
    });
}

function showAddRationing(idAnswer) {
    this.numSolution = idAnswer;
    $('#addRationing').modal('open');
}

function showRationing(idSolution) {
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
    this.rationingsAvailable.map(function (rationing) {
        var isChecked = rationing.justifyRationing ? 'checked' : '';
        var isJustify = rationing.justifyRationing ? 'Justify' : 'Not justify';
        var isJustifyColor = rationing.justifyRationing ? 'justifySwitch' : 'notJustifySwitch';
        var structSolution = "<li class='ration'>" +
            "<div class='collapsible-header'>" +
            "<i class='material-icons'>filter_drama</i>First</div>" +
            "<div class='collapsible-body'>" +
            "<h5>Ration: " + rationing.title + "</h5>" +
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

    this.questionSelected.estado = this.questionSelected.enum_disponible ? 'abierta' : 'cerrada';

    var questionToUpdate = {
        "enum_descripcion": this.questionSelected.enum_descripcion,
        "creador": this.questionSelected.creador.usuario.id,
        "enum_disponible": this.questionSelected.enum_disponible,
        "estado": this.questionSelected.estado
    };
    var questionUpdParsered = JSON.stringify(questionToUpdate);

    var questionParsered = JSON.stringify(this.questionSelected);
    localStorage.setItem('questionSelected', questionParsered);

    this.updateQuestion(questionUpdParsered).then(() => {
        if (!this.editSolutionMode) {
            this.numSolutions++;
        }
        backToPreviousPage();
    }).catch(() => {
        $('warningText').text('Question not update');
        $('#errModal').modal('open');
    });
}

function setAvailableQuestion() {
    var isChecked = $('#checkboxAvailable').prop("checked");
    this.questionSelected.enum_disponible = isChecked;
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