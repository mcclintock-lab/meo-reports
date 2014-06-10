EnergyConsumptionTab = require './energyConsumption.coffee'
FuelCostsTab = require './fuelCosts.coffee'
GreenhouseGasesTab = require './greenhouseGases.coffee'

window.app.registerReport (report) ->
  report.tabs [EnergyConsumptionTab, FuelCostsTab, GreenhouseGasesTab]
  # path must be relative to dist/
  report.stylesheets ['./report.css']


