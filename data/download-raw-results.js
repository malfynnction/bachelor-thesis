const getOrDownload = require('./get-or-download')

getOrDownload('participants', { forceDownload: true })
getOrDownload('ratings', { forceDownload: true })
getOrDownload('feedback', { forceDownload: true })
