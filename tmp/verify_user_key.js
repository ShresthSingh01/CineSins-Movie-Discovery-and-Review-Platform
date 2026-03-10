const https = require('https');

const OMDB_API_KEY = "400f1b83";
const query = "Inception";

const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const parsed = JSON.parse(data);
        console.log("OMDb Test Result:", parsed.Response === "True" ? "SUCCESS" : "FAILED: " + parsed.Error);
    });
}).on('error', (err) => {
    console.error("Error:", err.message);
});
