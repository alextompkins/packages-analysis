async function parseReports(reports) {
    const stats = {
        packages: {
            total: reports.length,
            safe: 0,
            unsafe: 0,
            errors: 0,
        },
        numDependencies: 0,
        vulnerabilities: {
            high: 0,
            medium: 0,
            low: 0,
        },
    };

    for (const report of reports) {
        if (report.error) {
            stats.packages.errors++;
        } else {
            stats.numDependencies += report.numDependencies;
            if (report.ok) {
                stats.packages.safe++;
            } else {
                stats.packages.unsafe++;
                stats.vulnerabilities.high += report.severityMap.high;
                stats.vulnerabilities.medium += report.severityMap.medium;
                stats.vulnerabilities.low += report.severityMap.low;
            }
        }
    }

    return stats;
}

function round(number, numDecimalPlaces) {
    return Math.round(number * Math.pow(10, numDecimalPlaces)) / Math.pow(10, numDecimalPlaces);
}

const reports = require('./results/npm_top_500');
parseReports(reports)
    .then(stats => {
        console.log(stats);
        console.log(`Average number of dependencies per package: ${round(stats.numDependencies / stats.packages.total, 2)}`);
        console.log(`${round(stats.packages.unsafe / stats.packages.total * 100, 2)}% of packages had vulnerable dependencies.`);

        const totalVulnerabilities = stats.vulnerabilities.high + stats.vulnerabilities.medium + stats.vulnerabilities.low;
        console.log(`Vulnerabilities:
        ${round(stats.vulnerabilities.high / totalVulnerabilities * 100, 2)}% high
        ${round(stats.vulnerabilities.medium / totalVulnerabilities * 100, 2)}% medium
        ${round(stats.vulnerabilities.low / totalVulnerabilities * 100, 2)}% low
        `);
    })
    .catch(err => {
        console.error(`ERROR: ${err.message}`);
    });
