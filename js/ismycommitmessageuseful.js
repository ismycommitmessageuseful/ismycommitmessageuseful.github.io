const baseApiUrl = "https://ismycommitmessageuseful.herokuapp.com/api/";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var rateCommits;
var currentRateCommit;

$(document).ready(function () {
    loadRateCommits();
});

$("#checkMessageButton").on("click", async function () {

    var message = $("#messageInput").val().trim();
    if (!message)
        return;

    $(this).prop("disabled", true);
    $(this).html("<span class=\"spinner-border spinner-border-sm mr-1\" aria-hidden=\"true\"></span>Loading...");

    // TODO: GET cannot have a body, change API method to accept message parameters from URL
    // fetch(baseApiUrl + "predict", {
    //     method: "GET",
    //     cache: "no-cache",
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     body: {
    //         message: $("#messageInput").text()
    //     }
    // })

    await sleep(2000);

    $(this).prop("disabled", false);
    $(this).html("Check");
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
