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
        if (this.userLogged.maestro) {
            $('.linkStudentPage').hide();
        } else {
            $('.linkMasterPage').hide();
        }
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
    $('#userLogged')[0].innerText = "User logged: " + this.userLogged["username"];
    $('#userName').text(this.userLogged.username + " " + this.userLogged.lastname);
    $('#userEmail').append(this.userLogged.email + "<span class='right-align' id='userPhone'>" + this.userLogged.phone + "</span>");

    let classMaster = this.userLogged.maestro ? 'isActive' : 'isNotActive';
    let iconMaster = this.userLogged.maestro ? 'check' : 'clear';
    let classAdmin = this.userLogged.admin ? 'isActive' : 'isNotActive';
    let iconAdmin = this.userLogged.admin ? 'check' : 'clear';
    let classEnable = this.userLogged.enabled ? 'isActive' : 'isNotActive';
    let iconEnable = this.userLogged.enabled ? 'check' : 'clear';

    $('#iconMaster').addClass(classMaster);
    $('#iconMaster i').text(iconMaster);
    $('#iconAdmin').addClass(classAdmin);
    $('#iconAdmin i').text(iconAdmin);
    $('#iconEnable').addClass(classEnable);
    $('#iconEnable i').text(iconEnable);
}

function selectThisOption(context) {
    disabledAllOptions();
    $(context).addClass('selected');
}

function disabledAllOptions() {
    let options = $('.profileOption');
    options.map((opt) => {
        if ($(options[opt]).hasClass('selected')) {
            $(options[opt]).removeClass('selected');
        }
    });
}

function goToEditProfile() {
    window.location.href = './../html/editProfilePage.html';
}

function logout() {
    localStorage.removeItem('userLogged');
    localStorage.removeItem('questionSelected');
}