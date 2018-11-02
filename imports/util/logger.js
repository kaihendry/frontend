// https://github.com/baryon/tracer/issues/43
export const logger = require('tracer')
  .console(
    {
      format: "{timestamp: '{{timestamp}}', title: '{{title}}', file: '{{file}}', line:'{{line}}', method: '{{method}}', message: '{{message}}' }"
    })
