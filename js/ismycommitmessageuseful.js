const baseApiUrl = "https://ismycommitmessageuseful.herokuapp.com/api/";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function show_alert(message, type) {
    const alert_placeholder = $("#alert-placeholder");

    if(message === null) {
        alert_placeholder.html("");
    }
    else {
        if(type === "message") {
            alert_placeholder.html("<div class=\"alert alert-primary\" role=\"alert\">" + message + "</div>");
        }
        if(type === "warning") {
            alert_placeholder.html("<div class=\"alert alert-warning\" role=\"alert\">" + message + "</div>");
        }
        else if(type === "error") {
            alert_placeholder.html("<div class=\"alert alert-danger\" role=\"alert\">" + message + "</div>");
        }       
    }
}

var rateCommits;
var currentRateCommit;

$(document).ready(function () {
    loadRateCommits();
});

$("#checkMessageButton").on("click", function () {
    var button = $("#checkMessageButton");
    const message = $("#messageInput").val().trim();
    if (!message) {
        show_alert("Please enter a commit message", "warning");
        return;
    }
        
    button.prop("disabled", true);
    button.html("<span class=\"spinner-border spinner-border-sm mr-1\" aria-hidden=\"true\"></span>Loading...");
    show_alert(null);

    const url = new URL(baseApiUrl + "predict");
    url.searchParams.append("message", message);

    fetch(url, {
        method: "GET",
        cache: "no-cache",
        mode: "cors"
    })
    .then(function(res) {
        if(res.ok) {
            return res.json();
        }
        throw "Status code is not OK";
    })
    .then(function(prediction) {
        show_alert("Your commit message is <b>" + Math.round(prediction.usefulness) + "%</b> useful", "message");
    })
    .catch(function(reason) {
        show_alert("Something went wrong (" + reason + ")", "error");
    })
    .finally(function() {
        button.prop("disabled", false);
        button.html("Check");
    });
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

            console.log("rate commits loaded");
            rateCommits = commits;

            $("#rateCommitUsefulButton").prop("disabled", false);
            $("#rateCommitNotUsefulButton").prop("disabled", false);
            $("#rateCommitDontKnowButton").prop("disabled", false);

            nextRateCommit();
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
