const axios = require('axios');
const config = require('./config/config');
const token = config.githubApiToken;

if (token === 'YOUR TOKEN HERE' || !token) {
    console.error('ERROR: No github token supplied, see config/config.example.js')
}

function getGithubApiLink(repoLink) {
    if (repoLink.startsWith("https://github.com/")) {
        var out = repoLink.substr(19).replace(".git", "")
        return "https://api.github.com/repos/" + out + "/branches/master"
    }
    return null
}

async function parseReports(reports) {
    const out = [];
    for (const report of reports) {
        if (report.error) continue;
        if (report.vulnerabilities.length === 0) continue;

        const url = getGithubApiLink(report.path);
        if (url) {
            console.log("Processing", report.path)
            const options = {
                method: 'GET',
                headers: { 'Authorization': 'token ' + token },
                url,
            };
            try {
                const res = await axios(options);
                // Example:
                // {
                //     "path": "https://github.com/facebook/relay",
                //     "highVulns": 0,
                //     "mediumVulns": 1,
                //     "lowVulns": 2,
                //     "totalVulns": 3,
                //     "lastCommitDate": "2019-04-09T18:25:37.000Z",
                //     "numDependencies": 1005
                // }
                out.push({
                    path: report.path,
                    highVulns: report.severityMap.high,
                    mediumVulns: report.severityMap.medium,
                    lowVulns: report.severityMap.low,
                    totalVulns: report.severityMap.high + report.severityMap.medium + report.severityMap.low,
                    lastCommitDate: res.data.commit.commit.author.date,
                    numDependencies: report.numDependencies
                });
            } catch (e) {
                console.warn(e)
            }


        }
    }
    return out;
}

const reports = require('./results/pypi_top_500');
parseReports(reports).then( res => {
    console.log(JSON.stringify(res));
});

