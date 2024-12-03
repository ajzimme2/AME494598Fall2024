const axios = require('axios');
const cheerio = require('cheerio');

// URL of the website
const url = "https://tejaswigowda.com/quatro/";

// Function to fetch and process data
const fetchData = () => {
  axios.get(url)
    .then(response => {
      // Load the HTML into cheerio
      const $ = cheerio.load(response.data);

      // Extract the page title (optional test to verify its working)
      const pageTitle = $("title").text();
      console.log("Page Title:", pageTitle);

      // Extract the <script> tag content
      const scriptContent = $("body script").first().html(); // Adjust to target the correct script tag
      if (scriptContent) {
        // Extract specific variables using regex
        const variableRegex = /\b(wC|xC|yC|zC)\b\s*=\s*([^;]+)/g;
        let match;
        console.log("\nExtracted Variables:");
        while ((match = variableRegex.exec(scriptContent)) !== null) {
          const variableName = match[1];
          const variableValue = match[2].trim();
          console.log(`${variableName}: ${variableValue}`);
        }
      } else {
        console.log("No script content found in the selected <script> tag.");
      }
    })
    .catch(error => {
      console.error("Error fetching the URL:", error);
    });
};

// Set the function to run every second
setInterval(fetchData, 1000); // 1000 milliseconds = 1 second
