import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

plt.close('all')

platform = 'pypi'

data2 = pd.read_json('../results./' + platform + '_top_500_plot.json', convert_dates=['lastCommitDate'])
print(data2)
df = pd.DataFrame(data2)

ax = df.plot(x='lastCommitDate', y='totalVulns', style='o', legend=False)
ax.set_xlabel("Last Commit Date")
ax.set_ylabel("Number of vulnerabilities")
ax.set_title(platform + " - Top 500 (" + str(len(data2)) + " vulnerable packages)")

ax2 = df.plot.scatter(x='numDependencies', y='totalVulns')
ax2.set_xlabel("Number of Dependencies")
ax2.set_ylabel("Number of Vulnerabilities")
ax2.set_title(platform + " - Top 500 (" + str(len(data2)) + " vulnerable packages)")


plt.show()
