let lat = 34.0901;
let Lon = -118.4065;
let apikey = "e336eb26dd1e78b13354e79fad696c79";

const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${Lon}&appid=${apikey}`;

fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Data not found");
            } else if (response.status === 500) {
                throw new Error("Server error");
            } else {
                throw new Error("Network response was not ok");
            }
        }
        return response.json();
    })
    .then(data => {
        outputElement.textContent = JSON.stringify(data, null, 2);
    })
    .catch(error => {
        console.error("Error:", error);
    });