const parseReport = (reportsList) => {
    const points = [];
    for (const reports of reportsList) {
        for (const report of reports) {
            points.push({
                path: report.path,
                vulnerabilities: report.vulnerabilities ? report.vulnerabilities.length : 0,
                num_packages: report.numDependencies ? report.numDependencies: 0
            })
            // }
        }
    }

    return points;
};

const reports = [require('./results/pypi_000_200'), require('./results/pypi_200_400'), require('./results/pypi_400_600'),
    require('./results/pypi_600_800'), require('./results/pypi_800_1000')];
const points = parseReport(reports);
for (const point of points) {
    if (point.num_packages !== 0 && point.vulnerabilities !== 0) {
        console.log(`${point.num_packages},${point.vulnerabilities},${point.path},`)
    }
}
