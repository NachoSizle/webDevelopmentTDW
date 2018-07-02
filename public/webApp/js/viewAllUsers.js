window.onload = function () {
    init();
};

var saveToken = null;
var users = [];
var rationingsToDelete = [];

function init() {
    initElements();
    loadProfile();
}

function initElements() {
    $(document).ready(function () {
        $('.sidenav').sidenav();
        $('.modal').modal();
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

function setDataToPage() {
    this.getAllUsers().then((res) => {
        this.users = res;
        this.createContainerForAllUsers();
    }).catch((err) => {
        if (err.status === 404) {
            this.users = [];
        }
    })
}

function createContainerForAllUsers() {
    this.users.forEach((user, index) => {
        var username = user.username;
        if (username !== 'adminUser' && username !== this.userLogged.username) {
            var checkedMaster = user.maestro ? 'checked' : '';
            var checkedAdmin = user.admin ? 'checked' : '';
            var checkedEnabled = user.enabled ? 'checked' : '';
            var chkStruct = "<div class='row inputCheckboxes'>" +
                "<div class='col s4'>" +
                "<label>" +
                "<input type='checkbox' disabled id='chkInitMaster' " + checkedMaster + " />" +
                "<span class='white-text'>Is Master?</span>" +
                "</label>" +
                "</div>" +
                "<div class='col s4'>" +
                "<label>" +
                "<input type='checkbox' disabled id='chkInitAdmin' " + checkedAdmin + " />" +
                "<span class='white-text'>Is Admin?</span>" +
                "</label>" +
                "</div>" +
                "<div class='col s4'>" +
                "<label>" +
                "<input type='checkbox' disabled id='chkInitEnabled' " + checkedEnabled + " />" +
                "<span class='white-text'>Is Enabled?</span>" +
                "</label>" +
                "</div>" +
                "</div>";
            var blockUser = "<div class='col s12 m12 hoverable' id='" + user.id + "'>" +
                "<div class='card blue-grey darken-1'>" +
                "<div class='card-content white-text'>" +
                "<span class='card-title'>Username: " + user.username + "</span>" +
                "<span class='card-title'>Email: " + user.email + "</span>" +
                "<div class='containerCheckboxes'>" +
                chkStruct +
                "</div>" +
                "</div>" +
                "<div class='card-action'>" +
                "<a href='#' onclick='editPerm(" + index + ")'><i class='material-icons alignToText'>border_color</i> Edit permissions!</a>" +
                "<a href='#' onclick='removeUser(" + index + ")'><i class='material-icons alignToText'>clear</i> Remove!</a>" +
                "</div>" +
                "</div>" +
                "</div>";
            $('#containerUsers').append(blockUser);
        }
    });
}

function editPerm(idUser) {
    this.userSelected = this.users[idUser];
    $('.usernameEditPerm').text('Edit permissions to user: ' + this.userSelected.username);
    $('#chkMaster').prop('checked', this.userSelected.maestro);
    $('#chkAdmin').prop('checked', this.userSelected.admin);
    $('#chkEnabled').prop('checked', this.userSelected.enabled);
    $('#editPerm').modal('open');
}

function removeUser(idUser) {
    this.userSelected = this.users[idUser];

    this.removeUserRequest().then((res) => {
        console.log(res);
    }).catch((err) => {
        console.log(err);
    });
}

function removeUserRequest() {
    return new Promise((resolve, reject) => {
        // REMOVE ALL RATIONINGS FROM THIS USER
        this.getAllRationingsFromThisUser().then((resRationings) => {
            this.removeAllAnswersFromUser().then((res) => {
                this.removeUserDef();
            }).catch((err) => {
                this.removeUserDef();
            });
        }).catch((err) => {
            if (err.status === 404) {
                this.rationingsToDelete = [];
                this.removeAllAnswersFromUser().then((res) => {
                    this.removeUserDef();
                }).catch((err) => {
                    this.removeUserDef();
                });
            }
        })
    });
}

function removeUserDef() {
    // REMOVE USER FROM usuarios
    this.requestApi('DELETE', 'users/' + this.userSelected.id, null, this.saveToken).then((res) => {
        $('#containerUsers').empty();
        this.setDataToPage();
    }).catch((err) => {
        console.log(err);
    })
}

function removeAllAnswersFromUser() {
    return new Promise((resolve, reject) => {
        this.requestApi('GET', 'solutions', null, this.saveToken).then((res) => {
            if (res !== null && res !== undefined) {
                var resParsered = JSON.parse(res);
                var solutions = resParsered.soluciones;
                solutions.map((sol) => {
                    var solution = sol.answer;
                    if (solution.student === this.userSelected.username) {
                        this.requestApi('DELETE', 'solutions/' + solution.idAnswer, null, this.saveToken).then(() => {
                            this.rationingsToDelete.map((rationing) => {
                                this.requestApi('DELETE', 'rationings/' + solution.idAnswer, null, this.saveToken).then(() => {
                                    resolve();
                                }).catch((err) => {
                                    reject(err);
                                })
                            });
                        }).catch((err) => {
                            reject(err);
                        })
                    }
                    resolve();
                })
            }
        }).catch((err) => {
            if (err.status === 404) {
                this.solutionsToRemove = [];
                reject(err);
            }
        });
    })
}

function getAllRationingsFromThisUser() {
    // REMOVE ALL ANSWERS FROM THIS USER
    return new Promise((resolve, reject) => {
        this.requestApi('GET', 'rationings', null, this.saveToken).then((res) => {
            if (res !== null && res !== undefined) {
                var resParsered = JSON.parse(res);
                var rationings = resParsered.razonamientos;
                rationings.map((rat) => {
                    var rationing = rat.rationing;
                    this.rationingsToDelete.push(rationing);
                });
                resolve();
            }
        }).catch((err) => {
            reject(err);
        })
    });
}


function validateData() {
    console.log('Edit');
    var isMaster = $("#chkMaster").prop('checked');
    var isAdmin = $("#chkAdmin").prop('checked');
    var isEnabled = $("#chkEnabled").prop('checked');

    var userData = {
        'isMaestro': isMaster,
        'isAdmin': isAdmin,
        'enabled': isEnabled
    };

    var userDataJSON = JSON.stringify(userData);
    this.updateUserData(userDataJSON).then((res) => {
        $('#editPerm').modal('close');
        $('#containerUsers').empty();
        this.setDataToPage();
    });
}

function updateUserData(user) {
    return new Promise((resolve, reject) => {
        this.requestApi('PUT', 'users/' + this.userSelected.id, user, this.saveToken).then((res) => {
            console.log(res);
            resolve(res);
        }).catch((err) => {
            reject(err);
        })
    })
}

function getAllUsers() {
    var questionsToProcess = [];
    return new Promise((resolve, reject) => {
        this.requestApi('GET', 'users', null, this.saveToken).then((response) => {
            if (response !== null && response !== undefined) {
                var usersParsered = JSON.parse(response);
                var users = usersParsered.usuarios;
                var aux = [];
                users.map((user) => {
                    aux.push(user.usuario);
                })
                resolve(aux);
            }
        }).catch((err) => {
            reject([]);
        });
    });
}

function logout() {
    localStorage.removeItem('userLogged');
    localStorage.removeItem('questionSelected');
}