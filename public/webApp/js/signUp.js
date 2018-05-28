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

function goToSignUpPage() {
    window.location.href = "./html/signUp.html";
}

function signUpUser() {

    var userInput = $("#inputUser").val();
    var passwordInput = $("#inputPassword").val();

    var userData = {
        'username': $("#inputUser").val(),
        'password': $("#inputPassword").val()
    };

    var userDataJSON = JSON.stringify(userData);

    this.requestApi('POST', 'users', userDataJSON).then((response) => {
        console.log(response);
        /*
        if (response) {
            this.userSelected = response['User'];
            localStorage.setItem('userLogged', this.userSelected);
            localStorage.setItem('X-Token', response['X-Token']);
            resolveTo();
        }
        */
    }).catch((err) => {
        console.log(err);
    });
}

function resolveTo() {
    if (this.userSelected["role"] === "master") {
        window.location.href = "./html/masterMainPage.html";
    } else {
        window.location.href = "./html/studentMainPage.html";
    }
}