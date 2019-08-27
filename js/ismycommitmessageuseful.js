const baseApiUrl = "https://ismycommitmessageuseful.herokuapp.com/api/";

var rateCommits;
var currentRateCommit;

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
    rateCommit("useful");
    });

$("#rateCommitNotUsefulButton").on("click", function () {
    rateCommit("notuseful");
});

$("#rateCommitDontKnowButton").on("click", function () {
    rateCommit("dontknow")
    });

async function getPrediction() {
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

    try {
        const response = await fetch(url, {
            method: "GET",
            cache: "no-cache",
            mode: "cors"
});
        if (response.ok) {
            const prediction = await response.json();
            showAlert("Your commit message is <b>" + Math.round(prediction.usefulness) + "%</b> useful", "message");
        } else if (response.status === 429) {
            const rateLimit = await response.json();
            showAlert("Please wait " + rateLimit.retryAfter + " second(s) more", "warning");
        } else {
            throw "Unexpected status code";
        }
    } catch (error) {
        showAlert("Something went wrong (" + error + ")", "error");
    }
    finally {
        button.prop("disabled", false);
        button.html("Check");
    }
}

function loadRateCommits() {
    const timer = setTimeout(function () {
        $("#rateCommitMessage").text("Please wait until the backend has booted...");
    }, 1500);

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
            clearTimeout(timer);
            if (response.ok) {
                return response.json();
            }
        })
        .then(function (commits) {
            rateCommits = commits;

            nextRateCommit();
        })
        .finally(function () {
            $("#rateCommitUsefulButton").prop("disabled", false);
            $("#rateCommitNotUsefulButton").prop("disabled", false);
            $("#rateCommitDontKnowButton").prop("disabled", false);
        });
}

async function rateCommit(endpoint) {
    $("#rateCommitUsefulButton").prop("disabled", true);
    $("#rateCommitNotUsefulButton").prop("disabled", true);
    $("#rateCommitDontKnowButton").prop("disabled", true);
    $("#rateAlertPlaceholder").html("");

    try {
        const response = await fetch(baseApiUrl + "commits/" + currentRateCommit.id + "/" + endpoint, {
            method: "POST",
            mode: "cors",
            cache: "no-cache"
        });
        if (response.ok) {
            nextRateCommit();
        }
        else if (response.status === 429) {
            var rateLimit = await response.json();
            $("#rateAlertPlaceholder").html("<div class=\"alert alert-warning\" role=\"alert\">Please wait " + rateLimit.retryAfter + " second(s) more</div>")
        }
    }
    catch (error) {
        console.log("Failed to rate commit: " + error);
    }
    finally {
        $("#rateCommitUsefulButton").prop("disabled", false);
        $("#rateCommitNotUsefulButton").prop("disabled", false);
        $("#rateCommitDontKnowButton").prop("disabled", false);
    }
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
