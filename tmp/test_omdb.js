const https = require('https');

const OMDB_API_KEY = "ef626c11";
const query = "Batman";

const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log("Response:", JSON.stringify(JSON.parse(data), null, 2));
    });
}).on('error', (err) => {
    console.error("Error:", err.message);
});
