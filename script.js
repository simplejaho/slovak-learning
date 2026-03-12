// script.js

// Function to load JSON data
async function loadJSON(url) {
    const response = await fetch(url);
    return await response.json();
}

// Function to render JSON structure
function renderJSON(data) {
    const container = document.getElementById('json-container');
    container.innerHTML = JSON.stringify(data, null, 2);
}

// Load and render the JSON data
loadJSON('path/to/your/json/file.json')
    .then(data => renderJSON(data))
    .catch(error => console.error('Error loading JSON:', error));