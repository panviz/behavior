import 'lodash'
import './events'
import './behavior'

const SpecReporter = require('jasmine-spec-reporter').SpecReporter

jasmine.getEnv().addReporter(new SpecReporter({
  spec: {
    displayStacktrace: true,
  },
}))
