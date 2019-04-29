const baseApiUrl = "https://ismycommitmessageuseful.herokuapp.com/api/";

var rateCommits;
var currentRateCommit;

function getPrediction() {
    var button = $("#checkMessageButton");
    const message = $("#messageInput").val().trim();
    if (!message) {
        showAlert("Please enter a commit message", "warning");
        return;
    }

    button.prop("disabled", true);
    button.html("<span class=\"spinner-border spinner-border-sm mr-1\" aria-hidden=\"true\"></span>Loading...");
    showAlert(null);

    const url = new URL(baseApiUrl + "predict");
    url.searchParams.append("message", message);

    fetch(url, {
        method: "GET",
        cache: "no-cache",
        mode: "cors"
    })
        .then(function (res) {
            if (res.ok) {
                return res.json();
            }
            throw "Status code is not OK";
        })
        .then(function (prediction) {
            showAlert("Your commit message is <b>" + Math.round(prediction.usefulness) + "%</b> useful", "message");
        })
        .catch(function (reason) {
            showAlert("Something went wrong (" + reason + ")", "error");
        })
        .finally(function () {
            button.prop("disabled", false);
            button.html("Check");
        });
}

$(document).ready(function () {
    loadRateCommits();
});

$("#messageInput").on("keypress", function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == "13") {
        getPrediction();
        event.stopPropagation();
    }
});

$("#checkMessageButton").on("click", function () {
    getPrediction();
});

$("#rateCommitUsefulButton").on("click", function () {
    fetch(baseApiUrl + "commits/" + currentRateCommit.id + "/useful", {
        method: "POST",
        mode: "cors",
        cache: "no-cache"
    });

    nextRateCommit();
});

$("#rateCommitNotUsefulButton").on("click", function () {
    fetch(baseApiUrl + "commits/" + currentRateCommit.id + "/notuseful", {
        method: "POST",
        mode: "cors",
        cache: "no-cache"
    });

    nextRateCommit();
});

$("#rateCommitDontKnowButton").on("click", function () {
    fetch(baseApiUrl + "commits/" + currentRateCommit.id + "/dontknow", {
        method: "POST",
        mode: "cors",
        cache: "no-cache"
    });

    nextRateCommit();
});

function loadRateCommits() {
    $("#rateCommitMessage").text("Loading...");
    $("#rateCommitUsefulButton").prop("disabled", true);
    $("#rateCommitNotUsefulButton").prop("disabled", true);
    $("#rateCommitDontKnowButton").prop("disabled", true);

    fetch(baseApiUrl + "commits", {
        method: "GET",
        cache: "no-cache",
        mode: "cors"
    })
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
        })
        .then(function (commits) {
            rateCommits = commits;
            
            nextRateCommit();
        })
        .finally(function() {
            $("#rateCommitUsefulButton").prop("disabled", false);
            $("#rateCommitNotUsefulButton").prop("disabled", false);
            $("#rateCommitDontKnowButton").prop("disabled", false);
        });
}

function nextRateCommit() {
    var commit = rateCommits.pop();

    if (commit !== undefined) {
        currentRateCommit = commit;

        $("#rateCommitMessage").text(currentRateCommit.message);
    }
    else {
        loadRateCommits();
    }
}
