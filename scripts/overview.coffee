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
    'EnergyPlanMeo'
    'EnergyPlanGP2'
  ]
  render: () ->
    attributes = @model.getAttributes()

    try
      comEC = @getMap(@recordSet("EnergyPlanGP2", "ComEC").toArray())
      comEU = @getMap(@recordSet("EnergyPlanGP2", "ComEU").toArray())
      comGHG = @getMap(@recordSet("EnergyPlanGP2", "ComGHG").toArray())
      resEC = @getMap(@recordSet("EnergyPlanGP2", "ResEC").toArray())
      resEU = @getMap(@recordSet("EnergyPlanGP2", "ResEU").toArray())
      resGHG = @getMap(@recordSet("EnergyPlanGP2", "ResGHG").toArray())
    catch e
      console.log("error: ", e)

    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user
      comEC: comEC
      comEU: comEU
      comGHG: comGHG
      resEC: resEC
      resEU: resEU
      resGHG: resGHG

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

  getMap: (recSet) ->
    vals = {PA: 0.0, NoPA: 0.0, DblPA: 0.0}
    for rec in recSet
      vals[rec.TYPE] = rec.VALUE.toFixed(1)
    return vals

module.exports = OverviewTab