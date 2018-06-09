window.onload = function () {
    init();
};

var userSelected = null;
var userDataSignUp = null;
var usersMock = null;

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

function validateUser() {
    event.preventDefault();

    signUpUser();
}

function signUpUser() {

    var userInput = $("#inputUser").val();
    var passwordInput = $("#inputPassword").val();

    var userData = {
        'username': $("#inputUser").val(),
        'password': $("#inputPassword").val(),
        'email': ''
    };

    var userDataJSON = JSON.stringify(userData);

    this.requestApi('POST', 'users', userDataJSON).then((response) => {
        console.log(response);
        if (response !== null && response !== undefined) {
            var resParsered = JSON.parse(response);
            this.userSelected = resParsered['usuario'];
            localStorage.setItem('userLogged', JSON.stringify(this.userSelected));
            resolveTo();
        }
    }).catch((err) => {
        if (err.status === 400) {
            //Mostrar modal
        }
        console.log(err);
    });
}

function goToSignInPage() {
    window.location.href = "../index.html";
}

function resolveTo() {
    window.location.href = "./signUpProcess.html";
}