ReportGraphTab = require 'reportGraphTab'
templates = require '../templates/templates.js'

_partials = require '../node_modules/seasketch-reporting-api/templates/templates.js'
partials = []
for key, val of _partials
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val


class GreenhouseGasesTab extends ReportGraphTab
  # this is the name that will be displayed in the Tab
  name: 'Greenhouse Gases'
  className: 'greenhouseGases'
  timeout: 120000
  template: templates.greenhouseGases
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
      comGHG = @recordSet("EnergyPlan", "ComGHG").toArray()
      resGHG = @recordSet("EnergyPlan", "ResGHG").toArray()

      com_pa = @getMap(comGHG, "PA")
      com_dblpa = @getMap(comGHG, "DblPA")
      com_nopa = @getMap(comGHG, "NoPA")
      com_user_savings = @getUserSavings(comGHG, "USER", 1)
      com_user = @getUserMap(comGHG, "USER", com_nopa)
      sorted_comm_results = [com_nopa, com_pa, com_dblpa]

      res_pa = @getMap(resGHG, "PA")
      res_dblpa = @getMap(resGHG, "DblPA")
      res_nopa = @getMap(resGHG, "NoPA")
      res_user_savings = @getUserSavings(resGHG, "USER", 1)
      res_user = @getUserMap(resGHG, "USER", res_nopa)
      sorted_res_results = [res_nopa, res_pa, res_dblpa, res_user]

    catch e
      console.log("error: ", e)

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
      

      com_chart = @drawChart('.commercialGreenhouseGases').xvar(0)
                             .yvar(1)
                             .xlab("Year")
                             .ylab("Value")
                             .height(h)
                             .width(w)
                             .margin(margin)

      ch = d3.select(@$('.commercialGreenhouseGases'))
      ch.datum(sorted_comm_results)
        .call(com_chart)

      res_chart = @drawChart('.residentialGreenhouseGases').xvar(0)
                     .yvar(1)
                     .xlab("Year")
                     .ylab("Value")
                     .height(h)
                     .width(w)
                     .margin(margin)

      ch = d3.select(@$('.residentialGreenhouseGases'))
      ch.datum(sorted_res_results)
        .call(res_chart)

module.exports = GreenhouseGasesTab