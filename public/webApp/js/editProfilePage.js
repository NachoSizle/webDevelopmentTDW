window.onload = function () {
    init();
};

var userLogged = null;

function init() {
    initElements();
    loadProfile();
}

function initElements() {
    $(document).ready(function () {
        $('.sidenav').sidenav();
        $('.materialboxed').materialbox();
    });
}

function loadProfile() {
    if (supportsHTML5Storage()) {
        var user = localStorage.getItem('userLogged');
        this.userLogged = JSON.parse(user);

        this.saveToken = localStorage.getItem('X-Token');
        setInitData();
    }
}

function supportsHTML5Storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function setInitData() {
    $('#userName').val(this.userLogged.username);
    $('#userEmail').val(this.userLogged.email);

    setAllLabels();

    let classMaster = this.userLogged.maestro;
    let classAdmin = this.userLogged.admin;
    let classEnable = this.userLogged.enabled;

    $('#chkMaster').prop('checked', classMaster);
    $('#chkAdmin').prop('checked', classAdmin);
    $('#chkEnabled').prop('checked', classEnable);
}

function setAllLabels() {
    let options = $('.lblInput');
    options.map((opt) => {
        if (!$(options[opt]).hasClass('active')) {
            $(options[opt]).addClass('active');
        }
    });
}

function saveData() {
    var userInput = $("#userName").val();
    var emailInput = $("#userEmail").val();
    var chkMaster = $('#chkMaster').prop('checked');
    var chkAdmin = $('#chkAdmin').prop('checked');
    var chkEnabled = $('#chkEnabled').prop('checked');

    var userData = {};

    if (userInput !== this.userLogged.username) {
        userData['username'] = userInput;
    }

    if (emailInput !== this.userLogged.email) {
        userData['email'] = emailInput;
    }

    if (chkMaster !== this.userLogged.maestro) {
        userData['isMaestro'] = chkMaster;
    }

    if (chkAdmin !== this.userLogged.admin) {
        userData['isAdmin'] = chkAdmin;
    }

    if (chkEnabled !== this.userLogged.enabled) {
        userData['enabled'] = chkEnabled;
    }

    var userDataJSON = JSON.stringify(userData);

    if (userDataJSON !== {}) {
        saveUserData(userDataJSON);
    } else {
        redirectToProfile();
    }
}

function saveUserData(userDataParsered) {
    this.requestApi('PUT', 'users/' + this.userLogged.id, userDataParsered, this.saveToken).then((response) => {
        if (response !== null && response !== undefined) {
            var resParsered = JSON.parse(response);
            this.userSelected = resParsered['usuario'];
            localStorage.setItem('userLogged', JSON.stringify(this.userSelected));
            redirectToProfile();
        }
    }).catch((err) => {
        if (err.status === 400) {
            //Mostrar modal
        }
        console.log(err);
    });
}

function redirectToProfile() {
    window.location.href = './../html/profilePage.html';
}

function logout() {
    localStorage.removeItem('userLogged');
    localStorage.removeItem('questionSelected');
}