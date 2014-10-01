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
      
      com_user = @getUserMap(comGHG, "USER", com_nopa)
      com_user_savings = @getUserSavings(comGHG, com_user,com_nopa, 1)
      sorted_comm_results = [com_nopa, com_pa, com_dblpa, com_user]

      res_pa = @getMap(resGHG, "PA")
      res_dblpa = @getMap(resGHG, "DblPA")
      res_nopa = @getMap(resGHG, "NoPA")
      
      res_user = @getUserMap(resGHG, "USER", res_nopa)
      res_user_savings = @getUserSavings(resGHG, res_user,res_nopa, 1)
      sorted_res_results = [res_nopa, res_pa, res_dblpa, res_user]

      scenarios = ['PA 295', 'No PA 295', 'Double PA 295']

      res_sum = @recordSet("EnergyPlan", "ResGHGSum").float('USER_SUM', 1)
      res_pa295_total_ghg =     @recordSet("EnergyPlan", "ResGHGSum").float('PA_SUM', 1)
      res_no_pa295_total_ghg =  @recordSet("EnergyPlan", "ResGHGSum").float('NOPA_SUM', 1)
      res_dbl_pa295_total_ghg = @recordSet("EnergyPlan", "ResGHGSum").float('DBLPA_SUM', 1)

      res_pa295_diff = Math.round((res_pa295_total_ghg - res_sum),0)
      res_has_savings_pa295 = res_pa295_diff > 0
      if not res_has_savings_pa295
        res_pa295_diff = Math.abs(res_pa295_diff)
      res_pa295_diff = @addCommas res_pa295_diff

      res_no_pa295_diff = Math.round((res_no_pa295_total_ghg - res_sum),0)
      res_has_savings_no_pa295 = res_no_pa295_diff > 0
      if not res_has_savings_no_pa295
        res_no_pa295_diff = Math.abs(res_no_pa295_diff)
      res_no_pa295_diff = @addCommas res_no_pa295_diff

      res_dbl_pa295_diff = Math.round((res_dbl_pa295_total_ghg - res_sum),0)
      res_has_savings_dbl_pa295 = res_dbl_pa295_diff > 0
      if res_has_savings_dbl_pa295
        res_dbl_pa295_diff = Math.abs(res_dbl_pa295_diff)
      res_dbl_pa295_diff = @addCommas res_dbl_pa295_diff

      comm_sum = @recordSet("EnergyPlan", "ComGHGSum").float('USER_SUM', 1)
      comm_pa295_total_ghg =     @recordSet("EnergyPlan", "ComGHGSum").float('PA_SUM', 1)
      comm_no_pa295_total_ghg =  @recordSet("EnergyPlan", "ComGHGSum").float('NOPA_SUM', 1)
      comm_dbl_pa295_total_ghg = @recordSet("EnergyPlan", "ComGHGSum").float('DBLPA_SUM', 1)

      comm_pa295_diff = Math.round((comm_pa295_total_ghg - comm_sum),0)
      comm_has_savings_pa295 = comm_pa295_diff > 0
      if not comm_has_savings_pa295
        comm_pa295_diff=Math.abs(comm_pa295_diff)
      comm_pa295_diff = @addCommas comm_pa295_diff

      comm_no_pa295_diff = Math.round((comm_no_pa295_total_ghg - comm_sum),0)
      comm_has_savings_no_pa295 = comm_no_pa295_diff > 0
      if not comm_has_savings_no_pa295
        comm_no_pa295_diff = Math.abs(comm_no_pa295_diff)
      comm_no_pa295_diff = @addCommas comm_no_pa295_diff



      comm_dbl_pa295_diff = Math.round((comm_dbl_pa295_total_ghg - comm_sum),0)
      comm_has_savings_dbl_pa295 = comm_dbl_pa295_diff > 0
      if not comm_has_savings_dbl_pa295
        comm_dbl_pa295_diff = Math.abs(comm_dbl_pa295_diff)
      comm_dbl_pa295_diff = @addCommas comm_dbl_pa295_diff

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

    @$el.html @template.render(context, partials)
    @enableLayerTogglers()

    @$('.comm-chosen-ghg').chosen({disable_search_threshold: 10, width:'200px'})
    @$('.comm-chosen-ghg').change () =>
      @renderDiffs('.comm-chosen-ghg', 'comm', 'ghg')

    @$('.res-chosen-ghg').chosen({disable_search_threshold: 10, width:'200px'})
    @$('.res-chosen-ghg').change () =>
      @renderDiffs('.res-chosen-ghg', 'res', 'ghg')

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