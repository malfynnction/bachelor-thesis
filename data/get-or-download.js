const fs = require('fs')
const { exec } = require('child_process')

const resultsPath = './results'
const serverUrl = 'bachelor' // TODO: configurable

module.exports = async (name, options = {}) => {
  const filePath = `${resultsPath}/${name}.json`

  if (!options.forceDownload && fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath))
  }

  const command = `curl -s localhost:5984/${name}/_all_docs?include_docs=true -o ${name}.json`

  const result = await new Promise(resolve => {
    exec(
      `ssh ${serverUrl} ${command} && scp ${serverUrl}:${name}.json ${filePath} && ssh ${serverUrl} rm ${name}.json`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`)
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`)
        }
        console.log(stdout)
        resolve(JSON.parse(fs.readFileSync(filePath)))
      }
    )
  })

  const parsedResult = result.rows.map(row => row.doc)
  // write to file for easier retrieval next time
  fs.writeFileSync(filePath, JSON.stringify(parsedResult))
  return parsedResult
}
