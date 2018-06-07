window.onload = function () {
    init();
};

var pathApi = "http://localhost:8080/api/v1/";

function init() {}

function requestApi(requestMethod, route, body, token) {
    return new Promise((resolve, reject) => {
        var req = new XMLHttpRequest();

        req.open(requestMethod, this.pathApi + route, true);
        req.setRequestHeader('accept', 'application/json');

        if (token === undefined || token === null) {
            token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1MjgwMjIxNDgsImV4cCI6MTUyODAyNTc0OCwidXNlcl9pZCI6MSwidXNlcm5hbWUiOiJhZG1pblVzZXIiLCJpc0FkbWluIjp0cnVlLCJpc01hZXN0cm8iOnRydWV9.btaYWwgZfifYfE7Q69CLPKE_r6DQU2gW6Vqso4f1Q5Sn7sOUNPDtxR6PhlwF1o8LH1oO_HnVrrub6_rHuu1H-A';
        }

        req.setRequestHeader('X-Token', token);

        localStorage.setItem('X-Token', token);

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