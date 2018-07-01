window.onload = function () {
    init();
};

var pathApi = "http://localhost:8080/api/v1/";

function init() {}

function signInAdminUser() {
    return new Promise((resolve, reject) => {
        var bodyLogin = {
            username: 'adminUser',
            password: '*adminUser*'
        };
        var bodyParsered = JSON.stringify(bodyLogin);
        var reqLogin = new XMLHttpRequest();

        reqLogin.open('POST', 'http://localhost:8080/api/v1/login', true);
        reqLogin.setRequestHeader('content-type', 'application/json');

        reqLogin.addEventListener("load", function () {
            if (reqLogin.status >= 200 && reqLogin.status < 400) {
                var token = JSON.parse(reqLogin.responseText)['X-Token'];
                localStorage.setItem('X-Token', token);
                resolve(token);
            } else {
                console.error(reqLogin.status + " " + reqLogin.statusText);
            }
        });
        reqLogin.addEventListener("error", function () {
            console.log(reqLogin);
        });

        if (bodyParsered !== null && bodyParsered !== undefined) {
            reqLogin.send(bodyParsered);
        } else {
            reqLogin.send();
        }
    });
}

function requestApi(requestMethod, route, body, token) {
    return new Promise((resolve, reject) => {
        var req = new XMLHttpRequest();

        req.open(requestMethod, this.pathApi + route, true);
        req.setRequestHeader('accept', 'application/json');

        req.setRequestHeader('X-Token', token);

        req.addEventListener("load", function () {
            if (req.status >= 200 && req.status < 400) {
                resolve(req.responseText);
            } else {
                console.error(req.status + " " + req.statusText);
                reject(req);
            }
        });
        req.addEventListener("error", function () {
            reject(req);
        });

        if (body !== null && body !== undefined) {
            req.send(body);
        } else {
            req.send();
        }

    });
}