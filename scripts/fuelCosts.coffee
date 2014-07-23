ReportGraphTab = require 'reportGraphTab'
templates = require '../templates/templates.js'

_partials = require '../node_modules/seasketch-reporting-api/templates/templates.js'
partials = []
for key, val of _partials
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val

class FuelCostsTab extends ReportGraphTab
  # this is the name that will be displayed in the Tab
  name: 'Fuel Costs'
  className: 'fuelCosts'
  timeout: 120000
  template: templates.fuelCosts
  dependencies: [
    'EnergyPlan'
  ]

  render: () ->
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false

    attributes = @model.getAttributes()

    try
      comFC = @recordSet("EnergyPlan", "ComEC").toArray()
      resFC = @recordSet("EnergyPlan", "ResEC").toArray()

      com_pa = @getMap(comFC, "PA")
      com_dblpa = @getMap(comFC, "DblPA")
      com_nopa = @getMap(comFC, "NoPA")
      com_user_savings = @getUserSavings(comFC, "USER")
      com_user = @getUserMap(comFC, "USER", com_nopa)
      sorted_comm_results = [com_nopa, com_pa, com_dblpa]
      console.log("fuel cost sorted comm results", sorted_comm_results)

      res_pa = @getMap(resFC, "PA")
      res_dblpa = @getMap(resFC, "DblPA")
      res_nopa = @getMap(resFC, "NoPA")
      res_user_savings = @getUserSavings(resFC, "USER")
      res_user = @getUserMap(resFC, "USER", res_nopa)
      sorted_res_results = [res_nopa, res_pa, res_dblpa, res_user]
      console.log("fuel cost sorted res results", sorted_comm_results)
    catch e
      console.log("error....................: ", e)

    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user
      com_user_savings: com_user_savings
      res_user_savings: res_user_savings
      d3IsPresent: d3IsPresent

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()
    if window.d3
      h = 320
      w = 380
      margin = {left:40, top:5, right:40, bottom: 40, inner:5}
      halfh = (h+margin.top+margin.bottom)
      totalh = halfh*2
      halfw = (w+margin.left+margin.right)
      totalw = halfw*2
      
      com_chart = @drawChart('.commercialFuelCosts').xvar(0)
                             .yvar(1)
                             .xlab("Year")
                             .ylab("Value (in million $)")
                             .height(h)
                             .width(w)
                             .margin(margin)

      ch = d3.select(@$('.commercialFuelCosts'))
      ch.datum(sorted_comm_results)
        .call(com_chart)

      res_chart = @drawChart('.residentialFuelCosts').xvar(0)
                     .yvar(1)
                     .xlab("Year")
                     .ylab("Value (in million $)")
                     .height(h)
                     .width(w)
                     .margin(margin)

      ch = d3.select(@$('.residentialFuelCosts'))
      ch.datum(sorted_res_results)
        .call(res_chart)


module.exports = FuelCostsTab