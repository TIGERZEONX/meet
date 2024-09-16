// Function to display current time in UTC
function showTime() {
    document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}
showTime();
setInterval(function () {
    showTime();
}, 1000);

// Other script functionalities (assuming your existing code for peer connection or buttons are here)
