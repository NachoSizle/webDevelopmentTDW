window.onload = function () {
    init();
};

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

        req.setRequestHeader('accept', 'application/json');

        if (token !== undefined && token !== null) {
            req.setRequestHeader('X-Token', token);
        }

        req.open(requestMethod, "http://localhost:8080/api/v1/" + route, true);

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