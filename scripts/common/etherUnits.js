'use strict'
const BigNumber = require('./commonRequires').bigNumber


module.exports = {
  getValueOfUnit,
  fiatToWei,
  toFiat,
  toEther,
  toGwei,
  toWei,
  unitToUnit,
}
const unitMap = {
  'wei': '1',
  'kwei': '1000',
  'ada': '1000',
  'femtoether': '1000',
  'mwei': '1000000',
  'babbage': '1000000',
  'picoether': '1000000',
  'gwei': '1000000000',
  'shannon': '1000000000',
  'nanoether': '1000000000',
  'nano': '1000000000',
  'szabo': '1000000000000',
  'microether': '1000000000000',
  'micro': '1000000000000',
  'finney': '1000000000000000',
  'milliether': '1000000000000000',
  'milli': '1000000000000000',
  'ether': '1000000000000000000',
  'kether': '1000000000000000000000',
  'grand': '1000000000000000000000',
  'einstein': '1000000000000000000000',
  'mether': '1000000000000000000000000',
  'gether': '1000000000000000000000000000',
  'tether': '1000000000000000000000000000000'
}
function getValueOfUnit (unit) {
  unit = unit ? unit.toLowerCase() : 'ether'
  var unitValue = unitMap[unit]
  if (unitValue === undefined) {
    throw new Error('This unit doesn\'t exists, please use the one of the following units ' + JSON.stringify(unitMap, null, 2))
  }
  return new BigNumber(unitValue, 10)
}
function fiatToWei(number, pricePerEther) {
  var returnValue = new BigNumber(String(number)).div(pricePerEther).times(getValueOfUnit('ether')).round(0)
  return returnValue.toString(10)
}

function toFiat(number, unit, multi) {
  var returnValue = new BigNumber(toEther(number, unit)).times(multi).round(5)
  return returnValue.toString(10)
}

function toEther(number, unit) {
  var returnValue = new BigNumber(toWei(number, unit)).div(getValueOfUnit('ether'))
  return returnValue.toString(10)
}
function toGwei(number, unit) {
  var returnValue = new BigNumber(toWei(number, unit)).div(getValueOfUnit('gwei'))
  return returnValue.toString(10)
}
function toWei(number, unit) {
  var returnValue = new BigNumber(String(number)).times(getValueOfUnit(unit))
  return returnValue.toString(10)
}

function unitToUnit(number, from, to) {
  var returnValue = new BigNumber(String(number)).times(getValueOfUnit(from)).div(getValueOfUnit(to))
  return returnValue.toString(10)
}


