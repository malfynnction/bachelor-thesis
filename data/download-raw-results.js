const { getOrDownload } = require('./lib')

getOrDownload('participants', { forceDownload: true })
getOrDownload('ratings', { forceDownload: true })
getOrDownload('feedback', { forceDownload: true })
