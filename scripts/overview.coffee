ReportTab = require 'reportTab'
templates = require '../templates/templates.js'

_partials = require '../node_modules/seasketch-reporting-api/templates/templates.js'
partials = []
for key, val of _partials
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val

class OverviewTab extends ReportTab
  # this is the name that will be displayed in the Tab
  name: 'Overview'
  className: 'overview'
  timeout: 120000
  template: templates.overview
  dependencies: [
    'DemoReport'
  ]


  render: () ->
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false

    demos = @recordSet('DemoReport', 'OutputTable').toArray()

    attributes = @model.getAttributes()
    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user

      demos: demos
      d3IsPresent: d3IsPresent

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

module.exports = OverviewTab