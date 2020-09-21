const { extractUsableResults, extractScammingResults } = require('./lib')
const summarize = require('./summarize')
const exportRatings = require('./export-ratings')

Promise.all([extractUsableResults(), extractScammingResults()]).then(
  ([{ participants, ratings }, scammedRatings]) => {
    // export all the results as JSON
    summarize.demographic(participants)
    summarize.ratings(ratings)
    summarize.meta(participants, ratings, scammedRatings)
    summarize.feedback()

    // export some of the results to Excel Sheet
    exportRatings()
  }
)
