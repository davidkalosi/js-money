/**
 * This file is part of the JS Money library
 *
 * Copyright (c) 2014 David Kalosi
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var _ = require('lodash');
var currencies = require('./currency');

/**
 * Creates a new Money instance.
 * The created Money instances is a value object thus it is immutable.
 * 
 * @param {Number} amount
 * @param {Object/String} currency
 * @returns {Money}
 * @constructor
 */
function Money(amount, currency) {
    var multipliers = [0, 10, 100, 1000];
    
    if (_.isString(currency)) 
        currency = currencies[currency];
   
    if (!_.isPlainObject(currency))
        throw new TypeError('Invalid currency');
    
    var decimals = decimalPlaces(amount);

    if (decimals > currency.decimal_digits)
        throw new Error("The currency " + currency.code + " supports only " 
            + currency.decimal_digits + " decimal digits");
    
    this.amount = decimals > 0 ? amount * multipliers[decimals] : amount;    
    this.currency = currency.code;
    Object.freeze(this);
};

var decimalPlaces = function(num) {
    var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    
    if (!match) 
        return 0;
    
    return Math.max(0, 
        (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
};

var assertSameCurrency = function(left, right) {
    if (left.currency !== right.currency)
        throw new Error('Different currencies');
};

var assertType = function(other) {
    if (!(other instanceof Money))
        throw new TypeError('Instance of Money required');
};

var assertOperand = function(operand) {
    if (isNaN(parseFloat(operand)) && !isFinite(operand))
        throw new TypeError('Operand must be a number');
};

/**
 * Returns true if the two instances of Money are equal, false otherwise.
 * 
 * @param {Money} other
 * @returns {Boolean}
 */
Money.prototype.equals = function(other) {
    var self = this;
    assertType(other);

    return self.amount === other.amount &&
            self.currency === other.currency;
};

/**
 * Adds the two objects together creating a new Money instance that holds the result of the operation.
 * 
 * @param {Money} other
 * @returns {Money}
 */
Money.prototype.add = function(other) {
    var self = this;
    assertType(other);
    assertSameCurrency(self, other);

    return new Money(self.amount + other.amount, self.currency);
};

/**
 * Subtracts the two objects creating a new Money instance that holds the result of the operation.
 * 
 * @param {Money} other
 * @returns {Money}
 */
Money.prototype.subtract = function(other) {
    var self = this;
    assertType(other);
    assertSameCurrency(self, other);

    return new Money(self.amount - other.amount, self.currency);
};

/**
 * Multiplies the object by the multiplier returning a new Money instance that holds the result of the operation.
 * 
 * @param {Number} multiplier
 * @returns {Money}
 */
Money.prototype.multiply = function(multiplier) {
    assertOperand(multiplier);
    var amount = Math.round(this.amount * multiplier);

    return new Money(amount, this.currency);
};

/**
 * Divides the object by the multiplier returning a new Money instance that holds the result of the operation.
 * 
 * @param {Number} divisor
 * @returns {Money}
 */
Money.prototype.divide = function(divisor) {
    assertOperand(divisor);
    var amount = Math.round(this.amount / divisor);

    return new Money(amount, this.currency);
};

/**
 * Allocates fund bases on the ratios provided returing an array of objects as a product of the allocation.
 * 
 * @param {Array} other
 * @returns {Array.Money}
 */
Money.prototype.allocate = function(ratios) {
    var self = this;
    var remainder = self.amount;
    var results = [];
    var total = 0;

    ratios.forEach(function(ratio) {
        total += ratio;
    });

    ratios.forEach(function(ratio) {
        var share = Math.floor(self.amount * ratio / total)
        results.push(new Money(share, self.currency));
        remainder -= share;
    });

    for (var i = 0; remainder > 0; i++) {
        results[i] = new Money(results[i].amount + 1, results[i].currency);
        remainder--;
    }

    return results;
};

/**
 * Compares two instances of Money. 
 * 
 * @param {Money} other
 * @returns {Number}
 */
Money.prototype.compare = function(other) {
    var self = this;

    assertType(other);
    assertSameCurrency(self, other);

    if (self.amount === other.amount)
        return 0;

    return self.amount > other.amount ? 1 : -1;
};

/**
 * Returns true if the amount is zero.
 *
 * @returns {boolean}
 */
Money.prototype.isZero = function() {
    return this.amount === 0;
};

/**
 * Returns true if the amount is positive.
 *
 * @returns {boolean}
 */
Money.prototype.isPositive = function() {
    return this.amount > 0;
};

/**
 * Returns true if the amount is negative.
 *
 * @returns {boolean}
 */
Money.prototype.isNegative = function() {
    return this.amount < 0;
};

module.exports = Money;
module.exports = _.extend(module.exports, currencies);