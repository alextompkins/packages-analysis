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
        numVulnerabilities: 0,
        publicationTime: 0,
        numDependenciesPerPackage: [],
        publicationTimes: [],
    };

    for (const report of reports) {
        if (report.error) {
            stats.packages.errors++;
        } else {
            stats.numDependencies += report.numDependencies;
            stats.numDependenciesPerPackage.push(report.numDependencies);
            if (report.ok) {
                stats.packages.safe++;
            } else {
                stats.packages.unsafe++;
                stats.vulnerabilities.high += report.severityMap.high;
                stats.vulnerabilities.medium += report.severityMap.medium;
                stats.vulnerabilities.low += report.severityMap.low;

                for (const vulnerability of report.vulnerabilities) {
                    stats.numVulnerabilities++;
                    stats.publicationTime += new Date(vulnerability.publicationTime).getTime();
                    stats.publicationTimes.push(new Date(vulnerability.publicationTime));
                }
            }
        }
    }

    return stats;
}

function round(number, numDecimalPlaces) {
    return Math.round(number * Math.pow(10, numDecimalPlaces)) / Math.pow(10, numDecimalPlaces);
}

function getMedian(numList) {
    const sortedList = [...numList];
    sortedList.sort((n1, n2) => n1 - n2);
    return sortedList[Math.round(sortedList.length / 2)];
}

const reports = require('./results/npm_top_500');
parseReports(reports)
    .then(stats => {
        console.log({
            packages: stats.packages,
            numDependencies: stats.numDependencies,
            vulnerabilities: stats.vulnerabilities,
        });

        console.log(`Average number of dependencies per package: ${round(stats.numDependencies / stats.packages.total, 2)}`);
        console.log(`Median number of dependencies per package: ${getMedian(stats.numDependenciesPerPackage)}`);

        console.log(`${round(stats.packages.unsafe / stats.packages.total * 100, 2)}% of packages had vulnerable dependencies.`);

        const totalVulnerabilities = stats.vulnerabilities.high + stats.vulnerabilities.medium + stats.vulnerabilities.low;
        console.log(`Vulnerabilities:
        ${round(stats.vulnerabilities.high / totalVulnerabilities * 100, 2)}% high
        ${round(stats.vulnerabilities.medium / totalVulnerabilities * 100, 2)}% medium
        ${round(stats.vulnerabilities.low / totalVulnerabilities * 100, 2)}% low
        `);

        const averageDate = stats.publicationTime / stats.numVulnerabilities;
        const averageSinceInDays = (Date.now() - averageDate) / (1000 * 60 * 60 * 24);
        console.log(`Average time since vulnerability publication date: ${round(averageSinceInDays, 0)} days`);
        const medianSinceInDays = (Date.now() - getMedian(stats.publicationTimes).getTime()) / (1000 * 60 * 60 * 24);
        console.log(`Median time since vulnerability publication date: ${round(medianSinceInDays, 0)} days`);
    })
    .catch(err => {
        console.error(`ERROR: ${err.message}`);
    });
