module.exports = requiredEnvVars => {
  requiredEnvVars.forEach(requiredEnvVar => {
    if (typeof process.env[requiredEnvVar] === 'undefined') {
      throw new Error(`Please set ${requiredEnvVar} in your environment.`)
    }
  })
}
