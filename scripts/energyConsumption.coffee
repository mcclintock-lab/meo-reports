ReportGraphTab = require 'reportGraphTab'
templates = require '../templates/templates.js'

_partials = require '../node_modules/seasketch-reporting-api/templates/templates.js'
partials = []
for key, val of _partials
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val

class EnergyConsumptionTab extends ReportGraphTab
  # this is the name that will be displayed in the Tab
  name: 'Energy Consumption'
  className: 'EnergyConsumption'
  timeout: 120000
  template: templates.energyConsumption
  dependencies: [
    'EnergyPlan'
  ]

  render: () ->
    if window.d3
      d3IsPresent = true
    else
      d3IsPresent = false

    try
      
      msg = @recordSet("EnergyPlan", "ResultMsg")
      console.log("msg is ", msg)

      comEC = @recordSet("EnergyPlan", "ComEU").toArray()
      resEC = @recordSet("EnergyPlan", "ResEU").toArray()


      com_pa = @getMap(comEC, "PA")
      com_dblpa = @getMap(comEC, "DblPA")
      com_nopa = @getMap(comEC, "NoPA")
      
      com_user = @getUserMap(comEC, "USER", com_nopa)

      com_user_savings = @getUserSavings(comEC, com_user, com_nopa, 1)

      sorted_comm_results = [com_nopa, com_pa, com_dblpa, com_user]

      res_pa = @getMap(resEC, "PA")
      res_dblpa = @getMap(resEC, "DblPA")
      res_nopa = @getMap(resEC, "NoPA")
      
      res_user = @getUserMap(resEC, "USER", res_nopa)
      res_user_savings = @getUserSavings(resEC, res_user, res_nopa, 1)
      sorted_res_results = [res_nopa, res_pa, res_dblpa, res_user]


      scenarios = ['','PA 295', 'No PA 295', 'Double PA 295']

      res_sum = @recordSet("EnergyPlan", "ResEUSum").float('USER_SUM', 1)
      res_pa295_total_ec =  @recordSet("EnergyPlan", "ResEUSum").float('PA_SUM', 1)
      res_no_pa295_total_ec =  @recordSet("EnergyPlan", "ResEUSum").float('NOPA_SUM', 1)
      res_dbl_pa295_total_ec = @recordSet("EnergyPlan", "ResEUSum").float('DBLPA_SUM', 1)

      res_pa295_diff = Math.round((res_pa295_total_ec - res_sum),0)

      res_has_savings_pa295 = res_pa295_diff > 0
      if not res_has_savings_pa295
        res_has_savings_pa295 = res_has_savings_pa295*-1
      res_pa295_diff = @addCommas res_pa295_diff
  
      res_no_pa295_diff = Math.round((res_no_pa295_total_ec - res_sum),0)
      res_has_savings_no_pa295 = res_no_pa295_diff > 0
      if not res_has_savings_no_pa295
        res_has_savings_no_pa295 = res_has_savings_no_pa295*-1
      res_no_pa295_diff = @addCommas res_no_pa295_diff

      res_dbl_pa295_diff =  Math.round((res_dbl_pa295_total_ec - res_sum),0)
      res_has_savings_dbl_pa295 = res_dbl_pa295_diff > 0
      if res_has_savings_dbl_pa295
        res_has_savings_dbl_pa295 = res_has_savings_dbl_pa295*-1
      res_dbl_pa295_diff = @addCommas res_dbl_pa295_diff

      comm_sum = @recordSet("EnergyPlan", "ComEUSum").float('USER_SUM', 1)
      comm_pa295_total_ec =     @recordSet("EnergyPlan", "ComEUSum").float('PA_SUM', 1)
      comm_no_pa295_total_ec =  @recordSet("EnergyPlan", "ComEUSum").float('NOPA_SUM', 1)
      comm_dbl_pa295_total_ec = @recordSet("EnergyPlan", "ComEUSum").float('DBLPA_SUM', 1)

      comm_pa295_diff = Math.round((comm_pa295_total_ec - comm_sum),0)
      
      comm_has_savings_pa295 = comm_pa295_diff > 0
      if not comm_has_savings_pa295
        comm_pa295_diff=comm_pa295_diff*-1
      comm_pa295_diff = @addCommas comm_pa295_diff

      comm_no_pa295_diff =  Math.round((comm_no_pa295_total_ec - comm_sum),0)
      comm_has_savings_no_pa295 = comm_no_pa295_diff > 0
      if not comm_has_savings_no_pa295
        comm_no_pa295_diff = comm_no_pa295_diff*-1
      comm_no_pa295_diff = @addCommas comm_no_pa295_diff

      comm_dbl_pa295_diff = Math.round((comm_dbl_pa295_total_ec - comm_sum),0)
      comm_has_savings_dbl_pa295 = comm_dbl_pa295_diff > 0
      if not comm_has_savings_dbl_pa295
        comm_dbl_pa295_diff = comm_dbl_pa295_diff*-1
      comm_dbl_pa295_diff = @addCommas comm_dbl_pa295_diff

    catch e
      console.log("error: ", e)

    attributes = @model.getAttributes()
    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user
      com_user_savings: com_user_savings
      res_user_savings: res_user_savings
      scenarios: scenarios

      res_pa295_diff: res_pa295_diff
      res_has_savings_pa295: res_has_savings_pa295

      res_no_pa295_diff: res_no_pa295_diff
      res_has_savings_no_pa295: res_has_savings_no_pa295

      res_dbl_pa295_diff: res_dbl_pa295_diff
      res_has_savings_dbl_pa295: res_has_savings_dbl_pa295

      comm_pa295_diff: comm_pa295_diff
      comm_has_savings_pa295: comm_has_savings_pa295

      comm_no_pa295_diff: comm_no_pa295_diff
      comm_has_savings_no_pa295: comm_has_savings_no_pa295

      comm_dbl_pa295_diff: comm_dbl_pa295_diff
      comm_has_savings_dbl_pa295: comm_has_savings_dbl_pa295

      res_sum: res_sum
      comm_sum: comm_sum
      d3IsPresent: d3IsPresent

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()
    @$('.comm-chosen-ec').chosen({disable_search_threshold: 10, width:'200px'})
    @$('.comm-chosen-ec').change () =>
      @renderDiffs('.comm-chosen-ec', 'comm', 'ec')

    @$('.res-chosen-ec').chosen({disable_search_threshold: 10, width:'200px'})
    @$('.res-chosen-ec').change () =>
      @renderDiffs('.res-chosen-ec', 'res', 'ec')


    if window.d3

      h = 320
      w = 380
      margin = {left:40, top:5, right:40, bottom: 40, inner:5}
      halfh = (h+margin.top+margin.bottom)
      totalh = halfh*2
      halfw = (w+margin.left+margin.right)
      totalw = halfw*2
      
      com_chart = @drawChart('.commercialEnergyConsumption').xvar(0)
                             .yvar(1)
                             .xlab("Year")
                             .ylab("Value (in millions)")
                             .height(h)
                             .width(w)
                             .margin(margin)

      ch = d3.select(@$('.commercialEnergyConsumption'))
      ch.datum(sorted_comm_results)
        .call(com_chart)

      res_chart = @drawChart('.residentialEnergyConsumption').xvar(0)
                     .yvar(1)
                     .xlab("Year")
                     .ylab("Value (in millions)")
                     .height(h)
                     .width(w)
                     .margin(margin)

      ch = d3.select(@$('.residentialEnergyConsumption'))
      ch.datum(sorted_res_results)
        .call(res_chart)
    else
      console.log("NO D3!!!!!!!")



module.exports = EnergyConsumptionTab