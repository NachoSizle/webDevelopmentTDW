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
        $('.modal').modal();
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
    var phoneInput = $("#inputPhone").val();
    var lastnameInput = $("#inputLastname").val();

    var userData = {
        'email': emailInput,
        'phone': phoneInput,
        'lastname': lastnameInput,
        'isMaestro': false,
        'isAdmin': false,
        'enabled': false
    };

    var userDataJSON = JSON.stringify(userData);
    var token = localStorage.getItem('X-Token');

    this.requestApi('PUT', 'users/' + this.userDataSignUp.id, userDataJSON, token).then((response) => {
        console.log(response);
        if (response !== null && response !== undefined) {
            //TO-DO: SHOW MODAL THE USER IS NOT ENABLED
            $('#notEnabledModal').modal('open');
        }
    }).catch((err) => {
        console.log(err);
    });
}

function resolveTo() {
    window.location.href = "./../index.html";
}