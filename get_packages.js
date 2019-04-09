const axios = require('axios');
const cliArgs = require('command-line-args');

const optionDefinitions = [
    { name: 'platform', alias: 'p', type: String },
    { name: 'number', alias: 'n', type: Number }
];
const options = cliArgs(optionDefinitions);

const API_URL = 'https://libraries.io/api';
const API_KEY = '14694f3d5c8f0b537cb848ecb0812de9';


async function searchPackages(platform, page) {
    const response = await axios.get(`${API_URL}/search`, {
        params: {
            api_key: API_KEY,
            platforms: platform,
            per_page: 100,
            page: page,
        }
    });
    return response.data;
}

async function getRepoUrls(platform, count) {
    let urls = new Set();
    let page = 1;

    while (urls.size < count) {
        const packages = await searchPackages(platform, page);
        // Map to repository url and add if not duplicate
        packages.forEach(pkg => {
            if (pkg.repository_url) {
                urls.add(pkg.repository_url);
            }
        });
        page++;
    }

    return [...urls].slice(0, count);
}

if (!options.platform) {
    console.error('ERROR: specify a platform e.g. "-p NPM"');
    process.exit(1);
}

getRepoUrls(options.platform, options.number || 20)
    .then(urls => {
        urls.forEach(url => console.log(url));
    })
    .catch(err => {
        console.error(`ERROR: ${err.message}`);
    });
