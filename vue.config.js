const path = require('path')

module.exports = {
  configureWebpack: config => {
    config.entry.app = './test/main.js'
  }
}
