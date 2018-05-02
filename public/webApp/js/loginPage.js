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
    });
}

function saveDataToLS() {

    var usersMock = [{
            "name": "Nacho",
            "user": "nacho",
            "idUser": 010,
            "password": "qwerty",
            "role": "student"
        },
        {
            "name": "Adrian",
            "user": "adrian",
            "idUser": 123,
            "password": "qwerty",
            "role": "student"
        },
        {
            "name": "Borja",
            "user": "borja",
            "idUser": 245,
            "password": "qwerty",
            "role": "student"
        },
        {
            "name": "Luis",
            "user": "luis",
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

function getUser(userValue, passValue) {
    var userFound = false;
    var userInput = $("#inputUser").val();
    var passwordInput = $("#inputPassword").val();

    this.usersMock.forEach(user => {
        if (userInput === user["user"] &&
            passwordInput === user["password"] &&
            !userFound) {
            userFound = true;
            this.userSelected = user;
            localStorage.setItem('userLogged', JSON.stringify(user));
            resolveTo();
        }
    });
}

function resolveTo() {
    if (this.userSelected["role"] === "master") {
        window.location.href = "./html/masterMainPage.html";
    } else {
        window.location.href = "./html/studentMainPage.html";
    }
}