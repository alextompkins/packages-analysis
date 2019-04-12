function parseReports(reports, currentStats) {
    const stats = currentStats
        ? currentStats
        : {
            packages: {
                total: 0,
                total_valid: 0,
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
        stats.packages.total += 1;
        if (report.error) {
            stats.packages.errors++;
        } else {
            stats.packages.total_valid += 1;
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

function parseBatchReports(reportsList) {
    let result = null;
    for (const report of reportsList) {
        result = parseReports(report, result)
    }
    return result
}

const generateReport = (reportsList) => {
    const stats = parseBatchReports(reportsList);

    const aveDepPerPackage = round(stats.numDependencies / stats.packages.total_valid, 2);
    const medDepPerPackage = getMedian(stats.numDependenciesPerPackage);
    const vulnerableDeps = round(stats.packages.unsafe / stats.packages.total_valid * 100, 2);

    const totalVulnerabilities = stats.vulnerabilities.high + stats.vulnerabilities.medium + stats.vulnerabilities.low;

    const averageDate = stats.publicationTime / stats.numVulnerabilities;
    const averageSinceInDays = (Date.now() - averageDate) / (1000 * 60 * 60 * 24);

    const medianSinceInDays = (Date.now() - getMedian(stats.publicationTimes).getTime()) / (1000 * 60 * 60 * 24);

    const report = {
        packages: stats.packages,
        numDependencies: stats.numDependencies,
        vulnerabilities: stats.vulnerabilities,
        aveDepPerPackage,
        medDepPerPackage,
        vulnerableDeps,
        totalVulnerabilities,
        averageSinceInDays,
        medianSinceInDays
    };
    printReport(report);
    return report
};

const printReport = (report) => {
    console.log(`Valid Tests: ${report.packages.total_valid}/${report.packages.total}`);
    console.log(`Safe Packages: ${report.packages.safe}`);
    console.log(`Unsafe Packages: ${report.packages.unsafe}`);
    console.log(`Unsafe/Safe ratio: ${report.vulnerableDeps}%\n`);

    console.log(`Vulnerabilities:
        ${round(report.vulnerabilities.high / report.totalVulnerabilities * 100, 2)}% high
        ${round(report.vulnerabilities.medium / report.totalVulnerabilities * 100, 2)}% medium
        ${round(report.vulnerabilities.low / report.totalVulnerabilities * 100, 2)}% low
    `);

    console.log(`Average number of dependencies per package: ${report.aveDepPerPackage}`);
    console.log(`Median number of dependencies per package: ${report.medDepPerPackage}`);

    console.log(`Average time since vulnerability publication date: ${round(report.averageSinceInDays, 0)} days`);
    console.log(`Median time since vulnerability publication date: ${round(report.medianSinceInDays, 0)} days`);
    console.log(`---------------------------------------------------\n`)
};


const mavenReport = [require('./results/maven_top_500')];
const npmReport = [require('./results/npm_top_500')];
const pypiReport = [require('./results/pypi_top_500')];


generateReport(mavenReport);
// generateReport(npmReport);
// generateReport(pypiReport);

// const totalReport = [require('./results/maven_top_500'), require('./results/npm_top_500'), require('./results/pypi_top_500')]
// generateReport(totalReport);

