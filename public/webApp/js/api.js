window.onload = function () {
    init();
};

var pathApi = "http://localhost:8080/api/v1/";

function init() {
    initElements();
}

function initElements() {
    $(document).ready(function () {
        $('.sidenav').sidenav();
    });
}

function requestApi(requestMethod, route, body, token) {
    return new Promise((resolve, reject) => {
        var req = new XMLHttpRequest();

        req.open(requestMethod, this.pathApi + route, true);
        req.withCredentials = false;
        req.setRequestHeader('Access-Control-Allow-Headers', 'X-Token');
        req.setRequestHeader('content', 'application/json');

        if (token !== undefined && token !== null) {
            req.setRequestHeader('X-Token', token);
        } else {
            req.setRequestHeader('X-Token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1Mjc1MzIyMjUsImV4cCI6MTUyNzUzNTgyNSwidXNlcl9pZCI6MSwidXNlcm5hbWUiOiJhZG1pblVzZXIiLCJpc0FkbWluIjp0cnVlLCJpc01hZXN0cm8iOnRydWV9.HPWvDk9JuCvLPUBg_msEIDz1e7sg-WCP3Eeh83cfEElRf8tg3o_VglSxM1cgtl-IQq3jNu6NpFq9d8kaFl2Jkg');
        }

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

        req.send(body);
    });
}