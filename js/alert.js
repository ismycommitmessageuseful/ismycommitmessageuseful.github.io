function showAlert(message, type) {
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