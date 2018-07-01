window.onload = function () {
    init();
};

var userDataSignUp = null;

function init() {
    initElements();
    loadProfile();
}

function initElements() {
    $(document).ready(function () {
        $('.sidenav').sidenav();
    });
}

function loadProfile() {
    if (!supportsHTML5Storage()) {
        return false;
    }
}

function supportsHTML5Storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function validateData() {
    event.preventDefault();
    var user = localStorage.getItem('userLogged');
    this.userDataSignUp = JSON.parse(user);
    updateData();
}

function updateData() {
    var emailInput = $("#inputEmail").val();
    var isMaster = $("#chkMaster").prop('checked');
    var isAdmin = $("#chkAdmin").prop('checked');
    var isEnabled = $("#chkEnabled").prop('checked');

    var userData = {
        'email': emailInput,
        'isMaestro': isMaster,
        'isAdmin': isAdmin,
        'enabled': isEnabled
    };

    var userDataJSON = JSON.stringify(userData);
    var token = localStorage.getItem('X-Token');

    this.requestApi('PUT', 'users/' + this.userDataSignUp.id, userDataJSON, token).then((response) => {
        console.log(response);
        if (response !== null && response !== undefined) {
            var resParsered = JSON.parse(response);
            this.userDataSignUp = resParsered['usuario'];
            localStorage.setItem('userLogged', JSON.stringify(this.userDataSignUp));
            resolveTo();
        }
    }).catch((err) => {
        console.log(err);
    });
}

function resolveTo() {
    if (this.userDataSignUp.maestro) {
        window.location.href = "./masterMainPage.html";
    } else {
        window.location.href = "./studentMainPage.html";
    }

}