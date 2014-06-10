ReportTab = require 'reportTab'
templates = require '../templates/templates.js'

_partials = require '../node_modules/seasketch-reporting-api/templates/templates.js'
partials = []
for key, val of _partials
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val

class GreenhouseGasesTab extends ReportTab
  # this is the name that will be displayed in the Tab
  name: 'Greenhouse Gases'
  className: 'greenhouseGases'
  timeout: 120000
  template: templates.greenhouseGases
  dependencies: [
    'EnergyPlanMeo'
    'EnergyPlanGP2'
  ]

  render: () ->
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false

    attributes = @model.getAttributes()

    try

      comGHG = @getMap(@recordSet("EnergyPlanGP2", "ComGHG").toArray())

      resGHG = @getMap(@recordSet("EnergyPlanGP2", "ResGHG").toArray())
    catch e
      console.log("error: ", e)

    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user

      comGHG: comGHG
      resGHG: resGHG
      d3IsPresent: d3IsPresent

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

  getMap: (recSet) ->
    vals = {PA: 0.0, NoPA: 0.0, DblPA: 0.0}
    for rec in recSet
      vals[rec.TYPE] = rec.VALUE.toFixed(1)
    return vals

module.exports = GreenhouseGasesTab