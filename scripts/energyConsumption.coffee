ReportTab = require 'reportTab'
templates = require '../templates/templates.js'

_partials = require '../node_modules/seasketch-reporting-api/templates/templates.js'
partials = []
for key, val of _partials
  partials[key.replace('node_modules/seasketch-reporting-api/', '')] = val

class EnergyConsumptionTab extends ReportTab
  # this is the name that will be displayed in the Tab
  name: 'EnergyConsumption'
  className: 'EnergyConsumption'
  timeout: 120000
  template: templates.energyConsumption
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
      comEC = @recordSet("EnergyPlanGP2", "ComEU").toArray()
      com_pa = @getMap(comEC, "PA")
      com_dblpa = @getMap(comEC, "DblPA")
      com_nopa = @getMap(comEC, "NoPA")
      sorted_comm_results = [com_nopa, com_pa, com_dblpa]

      resEC = @recordSet("EnergyPlanGP2", "ResEU").toArray()
      res_pa = @getMap(resEC, "PA")
      res_dblpa = @getMap(resEC, "DblPA")
      res_nopa = @getMap(resEC, "NoPA")
      sorted_res_results = [res_nopa, res_pa, res_dblpa]
    catch e
      console.log("error: ", e)

    context =
      sketch: @model.forTemplate()
      sketchClass: @sketchClass.forTemplate()
      attributes: @model.getAttributes()
      anyAttributes: @model.getAttributes().length > 0
      admin: @project.isAdmin window.user

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



  getMap: (recSet, scenario) ->
    scenario_values = []
    for rec in recSet
      if rec.TYPE == scenario
        scenario_values.push(rec)

    return _.sortBy scenario_values, (row) -> row['YEAR']

  drawChart: (whichChart) =>
    view = @
    width = 360
    height = 500
    margin = {left:40, top:5, right:20, bottom: 40, inner:10}
    axispos = {xtitle:5, ytitle:30, xlabel:5, ylabel:15}
    xlim = null
    ylim = null
    nxticks = 5
    xticks = null
    nyticks = 5
    yticks = null

    rectcolor = "#dbe4ee"
    tickcolor = "#dbe4ff"


    pointsize = 1 # default = no visible points at markers
    xlab = "X"
    ylab = "Y score"
    yscale = d3.scale.linear()
    xscale = d3.scale.linear()

    legendheight = 300
    pointsSelect = null
    labelsSelect = null
    legendSelect = null
    ## the main function
    chart = (selection) ->
      selection.each (data) ->
        y = []
        x = [2012, 2015, 2020, 2025, 2030, 2035]
       
        for scen in data
          for d in scen
            y.push(d.VALUE/1000000)


        #x = data.map (d) -> parseFloat(d.YEAR)
        #y = data.map (d) -> parseFloat(d.VALUE)


        paneloffset = 10
        panelwidth = width

        panelheight = height

        xlim = [d3.min(x)-1, parseFloat(d3.max(x)+1)] if !(xlim?)

        ylim = [d3.min(y), parseFloat(d3.max(y))] if !(ylim?)


        currelem = d3.select(view.$(whichChart)[0])
        svg = d3.select(view.$(whichChart)[0]).append("svg").data([data])
        svg.append("g")

        # Update the outer dimensions.
        svg.attr("width", width+margin.left+margin.right)
           .attr("height", height+margin.top+margin.bottom+data.length*35)

        g = svg.select("g")

        # box
        g.append("rect")
         .attr("x", paneloffset+margin.left)
         .attr("y", margin.top)
         .attr("height", panelheight)
         .attr("width", panelwidth)
         .attr("fill", "white")
         .attr("stroke", "none")


        # simple scales (ignore NA business)
        xrange = [margin.left+paneloffset+margin.inner, margin.left+paneloffset+panelwidth-margin.inner]
        yrange = [margin.top+panelheight-margin.inner, margin.top+margin.inner]
        xscale.domain(xlim).range(xrange)
        yscale.domain(ylim).range(yrange)
        xs = d3.scale.linear().domain(xlim).range(xrange)
        ys = d3.scale.linear().domain(ylim).range(yrange)


        # if yticks not provided, use nyticks to choose pretty ones
        yticks = ys.ticks(nyticks) if !(yticks?)
        xticks = xs.ticks(nxticks) if !(xticks?)

        # x-axis
        xaxis = g.append("g").attr("class", "x axis")
        xaxis.selectAll("empty")
             .data(xticks)
             .enter()
             .append("line")
             .attr("x1", (d) -> xscale(d))
             .attr("x2", (d) -> xscale(d))
             .attr("y1", margin.top+height-5)
             .attr("y2", margin.top+height)
             .attr("stroke-width", 1)
             .style("pointer-events", "none")
        #the x axis year labels
        xaxis.selectAll("empty")
             .data(xticks)
             .enter()
             .append("text")
             .attr("x", (d) -> xscale(d)-14)
             .attr("y", margin.top+height+axispos.xlabel+10)
             .text((d) -> formatAxis(xticks)(d))
        #the x axis title
        xaxis.append("text").attr("class", "xaxis-title")
             .attr("x", margin.left+width/2)
             .attr("y", margin.top+height+axispos.xtitle+30)
             .text(xlab)

        #draw the legend
        for scenario, cnt in data
          line_color = getStrokeColor(scenario)
          xaxis.selectAll("empty")
             .data([scenario[0]])
             .enter()
             .append("line")

             .attr("x1", (d,i) -> return margin.left)
             .attr("x2", (d,i) -> return margin.left+10)
             .attr("y1", (d,i) -> margin.top+height+axispos.xtitle+((cnt+1)*30)+6)
             .attr("y2", (d,i) -> margin.top+height+axispos.xtitle+((cnt+1)*30)+6)
             .attr("class", "chart-line")
             .attr("stroke", (d,i) -> line_color)
             .attr("color", (d,i) -> line_color)
             .attr("stroke-width", 3)

        #and the legend text
        for scenario, cnt in data          
          xaxis.selectAll("empty")
             .data([scenario[0]])
           .enter()
           .append("text")
           .attr("class", "legend-text")
           .attr("x", (d,i) ->
              return (margin.left+17))
           .attr("y", (d,i) ->
              margin.top+height+10+axispos.xtitle+((cnt+1)*30))
           .text((d,i) -> return getScenarioName([d]))

        # y-axis
        yaxis = g.append("g").attr("class", "y axis")
        yaxis.selectAll("empty")
             .data(yticks)
             .enter()
             .append("line")
             .attr("y1", (d) -> yscale(d))
             .attr("y2", (d) -> yscale(d))
             .attr("x1", margin.left+10)
             .attr("x2", margin.left+15)
             .attr("fill", "none")
              .attr("stroke", tickcolor)
             .attr("stroke-width", 1)
             .style("pointer-events", "none")
        yaxis.selectAll("empty")
             .data(yticks)
             .enter()
             .append("text")
             .attr("y", (d) -> yscale(d)+3)
             .attr("x", margin.left+3-axispos.ylabel)
             .text((d) -> formatAxis(yticks)(d))
        yaxis.append("text").attr("class", "title")
             .attr("y", margin.top+35+height/2)
             .attr("x", margin.left+8-axispos.ytitle)
             .text(ylab)
             .attr("transform", "rotate(270,#{margin.left+8-axispos.ytitle},#{margin.top+35+height/2})")

        points = g.append("g").attr("id", "points")

        for scenario in data
          line_color = getStrokeColor(scenario)
          ###
          pointsSelect =
            points.selectAll("empty")
                  .data(scenario)
                  .enter()
                  .append("circle")
                  .attr("cx", (d,i) -> xscale(d.YEAR))
                  .attr("cy", (d,i) -> yscale(d.VALUE/1000000))
                  .attr("class", (d,i) -> "pt#{i}")
                  .attr("r", pointsize)
                  .attr("fill", (d,i) ->
                            val = i
                            col = line_color
                            return col
                            )
                  .attr("stroke", (d, i) ->
                            val = Math.floor(i/17) % 5
                            col = line_color
                            return col
                            )
                  .attr("stroke-width", "1")
                  .attr("opacity", (d,i) ->
                       return 1 if (x[i]? or xNA.handle) and (y[i]? or yNA.handle)
                       return 0)
          ###
        line = d3.svg.line(d)
            .interpolate("basis")
            .x( (d) -> xscale(parseInt(d.YEAR)))
            .y( (d) -> yscale(d.VALUE/1000000))


        points.selectAll("empty")
          .data(data)
          .enter()
          .append("path")
          .attr("d", (d) -> line d)
          .attr("stroke", (d) -> getStrokeColor(d))
          .attr("stroke-width", 3)
          .attr("fill", "none")

        # box
        g.append("rect")
               .attr("x", margin.left+paneloffset)
               .attr("y", margin.top)
               .attr("height", panelheight)
               .attr("width", panelwidth)
               .attr("fill", "none")
               .attr("stroke", "black")
               .attr("stroke-width", "none")



    ## configuration parameters


    chart.width = (value) ->
      return width if !arguments.length
      width = value
      chart

    chart.height = (value) ->
      return height if !arguments.length
      height = value
      chart

    chart.margin = (value) ->
      return margin if !arguments.length
      margin = value
      chart

    chart.axispos = (value) ->
      return axispos if !arguments.length
      axispos = value
      chart

    chart.xlim = (value) ->
      return xlim if !arguments.length
      xlim = value
      chart

    chart.nxticks = (value) ->
      return nxticks if !arguments.length
      nxticks = value
      chart

    chart.xticks = (value) ->
      return xticks if !arguments.length
      xticks = value
      chart

    chart.ylim = (value) ->
      return ylim if !arguments.length
      ylim = value
      chart

    chart.nyticks = (value) ->
      return nyticks if !arguments.length
      nyticks = value
      chart

    chart.yticks = (value) ->
      return yticks if !arguments.length
      yticks = value
      chart

    chart.rectcolor = (value) ->
      return rectcolor if !arguments.length
      rectcolor = value
      chart

    chart.pointcolor = (value) ->
      return pointcolor if !arguments.length
      pointcolor = value
      chart

    chart.pointsize = (value) ->
      return pointsize if !arguments.length
      pointsize = value
      chart

    chart.pointstroke = (value) ->
      return pointstroke if !arguments.length
      pointstroke = value
      chart

    chart.xlab = (value) ->
      return xlab if !arguments.length
      xlab = value
      chart

    chart.ylab = (value) ->
      return ylab if !arguments.length
      ylab = value
      chart

    chart.xvar = (value) ->
      return xvar if !arguments.length
      xvar = value
      chart

    chart.yvar = (value) ->
      return yvar if !arguments.length
      yvar = value
      chart

    chart.yscale = () ->
      return yscale

    chart.xscale = () ->
      return xscale

    chart.pointsSelect = () ->
      return pointsSelect

    chart.labelsSelect = () ->
      return labelsSelect

    chart.legendSelect = () ->
      return legendSelect

    # return the chart function
    chart

  getScenarioName = (scenario) ->
    for d in scenario
      if d.TYPE == "PA"
        return "PA 295"
      else if d.TYPE == "NoPA"
        return "No PA 295"
      else if d.TYPE == "DblPA"
        return "Double PA 295"
      else
        return "User Scenario"

  getStrokeColor = (scenario) ->
    pacolor = "#9aba8c"
    nopacolor = "#e5cace"
    dblpacolor = "#b3cfa7"
    for d in scenario
      if d.TYPE == "PA"
        return  pacolor
      else if d.TYPE == "NoPA"
        return nopacolor
      else if d.TYPE == "DblPA"
        return dblpacolor
      else
        return "gray"


  # function to determine rounding of axis labels
  formatAxis = (d) ->
    d = d[1] - d[0]
    ndig = Math.floor( Math.log(d % 10) / Math.log(10) )
    ndig = 0 if ndig > 0
    ndig = Math.abs(ndig)
    d3.format(".#{ndig}f")

module.exports = EnergyConsumptionTab