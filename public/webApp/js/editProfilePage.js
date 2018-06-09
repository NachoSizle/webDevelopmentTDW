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
    console.log('Save');
    redirectToProfile();
}

function redirectToProfile() {
    window.location.href = './../html/profilePage.html';
}

function logout() {
    localStorage.removeItem('userLogged');
    localStorage.removeItem('questionSelected');
}