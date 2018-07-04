window.onload = function () {
    init();
};

var userSelected = null;
var usersMock = null;

function init() {
    initElements();
    saveDataToLS();
    loadProfile();
}

function initElements() {
    $(document).ready(function () {
        $('.sidenav').sidenav();
        $('.modal').modal();
    });
}

function saveDataToLS() {

    var usersMock = [{
            "name": "a",
            "user": "a",
            "idUser": 010,
            "password": "qwerty",
            "role": "student"
        },
        {
            "name": "b",
            "user": "b",
            "idUser": 123,
            "password": "qwerty",
            "role": "student"
        },
        {
            "name": "c",
            "user": "c",
            "idUser": 245,
            "password": "qwerty",
            "role": "student"
        },
        {
            "name": "m",
            "user": "m",
            "idUser": 367,
            "password": "qwerty",
            "role": "master"
        }
    ];

    localStorage.setItem('usersMock', JSON.stringify(usersMock));

    var questionsMasterMock = [{
            "title": "¿Que es el software?",
            "id": 0,
            "available": true,
            "solutions": []
        },
        {
            "title": "¿Que es un lenguaje tipado?",
            "id": 1,
            "available": true,
            "solutions": []
        },
        {
            "title": "¿Que es la recursividad?",
            "id": 2,
            "available": true,
            "solutions": []
        }
    ];
    var questionsMasterLS = localStorage.getItem('questionsMaster');
    if (questionsMasterLS === null || questionsMasterLS.length === 0) {
        localStorage.setItem('questionsMaster', JSON.stringify(questionsMasterMock));
    }

    var proposeSolutions = [];
    var proposeSolutionsLS = localStorage.getItem('answersSolutionStudent');
    if (proposeSolutionsLS === null || proposeSolutionsLS.length === 0) {
        localStorage.setItem('answersSolutionStudent', JSON.stringify(proposeSolutions));
    }

    var solutionsToReview = [];
    var solutionsToReviewLS = localStorage.getItem('solutionsToReview');
    if (solutionsToReviewLS === null || solutionsToReviewLS.length === 0) {
        localStorage.setItem('solutionsToReview', JSON.stringify(solutionsToReview));
    }
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

    var users = localStorage.getItem('usersMock');
    this.usersMock = JSON.parse(users);

    getUser();
}

function goToSignUpPage() {
    window.location.href = "./html/signUp.html";
}

function getUser() {
    var userInput = $("#inputUser").val();
    var passwordInput = $("#inputPassword").val();

    var userData = {
        'username': $("#inputUser").val(),
        'password': $("#inputPassword").val()
    };

    var userDataJSON = JSON.stringify(userData);

    this.requestApi('POST', 'login', userDataJSON).then((response) => {
        if (response) {
            var resParsered = JSON.parse(response);
            this.userSelected = resParsered['User']['usuario'];
            localStorage.setItem('X-Token', resParsered['X-Token']);
            if (this.userSelected.enabled) {
                localStorage.setItem('userLogged', JSON.stringify(this.userSelected));
                resolveTo();
            } else {
                $('#notEnabledModal').modal('open');
            }
        }
    }).catch((err) => {
        console.log(err);
    });
}

function resolveTo() {
    if (this.userSelected["maestro"]) {
        window.location.href = "./html/masterMainPage.html";
    } else {
        window.location.href = "./html/studentMainPage.html";
    }
}