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
      msg = @recordSet("EnergyPlan", "ResultMsg")
      console.log("......msg is ", msg)

      scenarios = ['PA 295', 'No PA 295', 'Double PA 295']
      comFC = @recordSet("EnergyPlan", "ComEC").toArray()
      resFC = @recordSet("EnergyPlan", "ResEC").toArray()

      com_pa = @getMap(comFC, "PA")
      com_dblpa = @getMap(comFC, "DblPA")
      com_nopa = @getMap(comFC, "NoPA")
      
      com_user = @getUserMap(comFC, "USER", com_nopa)
      com_user_savings = @getUserSavings(comFC, com_user, com_nopa, 2)
      sorted_comm_results = [com_nopa, com_pa, com_dblpa, com_user]

      res_pa = @getMap(resFC, "PA")
      res_dblpa = @getMap(resFC, "DblPA")
      res_nopa = @getMap(resFC, "NoPA")
      
      res_user = @getUserMap(resFC, "USER", res_nopa)
      res_user_savings = @getUserSavings(resFC, res_user, res_nopa, 2)
      sorted_res_results = [res_nopa, res_pa, res_dblpa, res_user]


      res_sum = @recordSet("EnergyPlan", "ResECSum").float('USER_SUM', 1)
      res_pa295_total_fc =     @recordSet("EnergyPlan", "ResECSum").float('PA_SUM', 1)
      res_no_pa295_total_fc =  @recordSet("EnergyPlan", "ResECSum").float('NOPA_SUM', 1)
      res_dbl_pa295_total_fc = @recordSet("EnergyPlan", "ResECSum").float('DBLPA_SUM', 1)



      res_pa295_diff = Math.round((res_pa295_total_fc - res_sum),0)
      res_pa295_perc_diff = Math.round(((Math.abs(res_pa295_diff)/res_sum)*100),0)
      res_has_savings_pa295 = res_pa295_diff > 0
      if not res_has_savings_pa295
        res_pa295_diff = Math.abs(res_pa295_diff)
      res_pa295_diff = @addCommas res_pa295_diff

      res_no_pa295_diff = Math.round((res_no_pa295_total_fc - res_sum),0)
      res_no_pa295_perc_diff = Math.round(((Math.abs(res_no_pa295_diff)/res_sum)*100),0)
      res_has_savings_no_pa295 = res_no_pa295_diff > 0
      if not res_has_savings_no_pa295
        res_no_pa295_diff = Math.abs(res_no_pa295_diff)
      res_no_pa295_diff = @addCommas res_no_pa295_diff
      
      res_dbl_pa295_diff = Math.round((res_dbl_pa295_total_fc - res_sum),0)
      res_dbl_pa295_perc_diff = Math.round(((Math.abs(res_dbl_pa295_diff)/res_sum)*100),0)
      res_has_savings_dbl_pa295 = res_dbl_pa295_diff > 0
      if not res_has_savings_dbl_pa295
        res_dbl_pa295_diff =  Math.abs(res_dbl_pa295_diff)
      res_dbl_pa295_diff = @addCommas res_dbl_pa295_diff


      comm_sum = @recordSet("EnergyPlan", "ComECSum").float('USER_SUM', 1)
      comm_pa295_total_fc =     @recordSet("EnergyPlan", "ComECSum").float('PA_SUM', 1)
      comm_no_pa295_total_fc =  @recordSet("EnergyPlan", "ComECSum").float('NOPA_SUM', 1)
      comm_dbl_pa295_total_fc = @recordSet("EnergyPlan", "ComECSum").float('DBLPA_SUM', 1)

      comm_pa295_diff = Math.round((comm_pa295_total_fc - comm_sum),0)
      comm_pa295_perc_diff = Math.round(((Math.abs(comm_pa295_diff)/comm_sum)*100),0)
      comm_has_savings_pa295 = comm_pa295_diff > 0
      if not comm_has_savings_pa295
        comm_pa295_diff=Math.abs(comm_pa295_diff)
      comm_pa295_diff = @addCommas comm_pa295_diff

      comm_no_pa295_diff = Math.round((comm_no_pa295_total_fc - comm_sum),0)
      comm_no_pa295_perc_diff = Math.round(((Math.abs(comm_no_pa295_diff)/comm_sum)*100),0)
      comm_has_savings_no_pa295 = comm_no_pa295_diff > 0
      if not comm_has_savings_no_pa295
        comm_no_pa295_diff = Math.abs(comm_no_pa295_diff)
      comm_no_pa295_diff = @addCommas comm_no_pa295_diff


      comm_dbl_pa295_diff = Math.round((comm_dbl_pa295_total_fc - comm_sum),0)
      comm_dbl_pa295_perc_diff = Math.round(((Math.abs(comm_dbl_pa295_diff)/comm_sum)*100),0)
      comm_has_savings_dbl_pa295 = comm_dbl_pa295_diff > 0
      if not comm_has_savings_dbl_pa295
        comm_dbl_pa295_diff = Math.abs(comm_dbl_pa295_diff)
      comm_dbl_pa295_diff = @addCommas comm_dbl_pa295_diff

    catch e
      console.log("error....................: ", e)

    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user

      scenarios: scenarios
      com_user_savings: com_user_savings
      res_user_savings: res_user_savings
      d3IsPresent: d3IsPresent

      res_pa295_diff: res_pa295_diff
      res_has_savings_pa295: res_has_savings_pa295
      res_pa295_dir: @getDirClass res_has_savings_pa295
      res_pa295_perc_diff: res_pa295_perc_diff

      res_no_pa295_diff: res_no_pa295_diff
      res_has_savings_no_pa295: res_has_savings_no_pa295
      res_no_pa295_dir: @getDirClass res_has_savings_no_pa295
      res_no_pa295_perc_diff: res_no_pa295_perc_diff

      res_dbl_pa295_diff: res_dbl_pa295_diff
      res_has_savings_dbl_pa295: res_has_savings_dbl_pa295
      res_dbl_pa295_dir: @getDirClass res_has_savings_dbl_pa295
      res_dbl_pa295_perc_diff: res_dbl_pa295_perc_diff

      comm_pa295_diff: comm_pa295_diff
      comm_has_savings_pa295: comm_has_savings_pa295
      comm_pa295_dir: @getDirClass comm_has_savings_pa295
      comm_pa295_perc_diff: comm_pa295_perc_diff

      comm_no_pa295_diff: comm_no_pa295_diff
      comm_has_savings_no_pa295: comm_has_savings_no_pa295
      comm_no_pa295_dir: @getDirClass comm_has_savings_no_pa295
      comm_no_pa295_perc_diff: comm_no_pa295_perc_diff

      comm_dbl_pa295_diff: comm_dbl_pa295_diff
      comm_has_savings_dbl_pa295: comm_has_savings_dbl_pa295
      comm_dbl_pa295_dir: @getDirClass comm_has_savings_dbl_pa295
      comm_dbl_pa295_perc_diff: comm_dbl_pa295_perc_diff

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

    @$('.comm-chosen-fc').chosen({disable_search_threshold: 10, width:'220px'})
    @$('.comm-chosen-fc').change () =>
      @renderDiffs('.comm-chosen-fc', 'comm', 'fc')

    @$('.res-chosen-fc').chosen({disable_search_threshold: 10, width:'220px'})
    @$('.res-chosen-fc').change () =>
      @renderDiffs('.res-chosen-fc', 'res', 'fc')

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