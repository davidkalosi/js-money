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

var isInt = function (n) {
    return Number(n) === n && n % 1 === 0;
};

var decimalPlaces = function (num) {
    var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

    if (!match)
        return 0;

    return Math.max(0,
        (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
};

var assertSameCurrency = function (left, right) {
    if (left.currency !== right.currency)
        throw new Error('Different currencies');
};

var assertType = function (other) {
    if (!(other instanceof Money))
        throw new TypeError('Instance of Money required');
};

var assertOperand = function (operand) {
    if (isNaN(parseFloat(operand)) && !isFinite(operand))
        throw new TypeError('Operand must be a number');
};

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
    if (_.isString(currency))
        currency = currencies[currency];

    if (!_.isPlainObject(currency))
        throw new TypeError('Invalid currency');

    if (!isInt(amount))
        throw new TypeError('Amount must be an integer');

    this.amount = amount;
    this.currency = currency.code;
    Object.freeze(this);
}

Money.fromInteger = function (amount, currency) {
    if (_.isObject(amount)) {
        if (amount.amount === undefined || amount.currency === undefined)
            throw new TypeError('Missing required parameters amount,currency');

        currency = amount.currency;
        amount = amount.amount;
    }

    if (!isInt(amount))
        throw new TypeError('Amount must be an integer value');

    return new Money(amount, currency);
};

Money.fromDecimal = function (amount, currency) {
    var multipliers = [1, 10, 100, 1000];

    if (_.isObject(amount)) {
        if (amount.amount === undefined || amount.currency === undefined)
            throw new TypeError('Missing required parameters amount,currency');

        currency = amount.currency;
        amount = amount.amount;
    }

    if (_.isString(currency))
        currency = currencies[currency];

    if (!_.isPlainObject(currency))
        throw new TypeError('Invalid currency');

    var decimals = decimalPlaces(amount);

    if (decimals > currency.decimal_digits)
        throw new Error("The currency " + currency.code + " supports only "
            + currency.decimal_digits + " decimal digits");

    var integerAmount = amount * multipliers[currency.decimal_digits];
    return new Money(Math.round(integerAmount), currency);
};

/**
 * Returns true if the two instances of Money are equal, false otherwise.
 *
 * @param {Money} other
 * @returns {Boolean}
 */
Money.prototype.equals = function (other) {
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
Money.prototype.add = function (other) {
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
Money.prototype.subtract = function (other) {
    var self = this;
    assertType(other);
    assertSameCurrency(self, other);

    return new Money(self.amount - other.amount, self.currency);
};

/**
 * Multiplies the object by the multiplier returning a new Money instance that holds the result of the operation.
 *
 * @param {Number} multiplier
 * @param {Function} [fn=Math.round]
 * @returns {Money}
 */
Money.prototype.multiply = function (multiplier, fn) {
    if (!_.isFunction(fn))
        fn = Math.round;

    assertOperand(multiplier);
    var amount = fn(this.amount * multiplier);

    return new Money(amount, this.currency);
};

/**
 * Divides the object by the multiplier returning a new Money instance that holds the result of the operation.
 *
 * @param {Number} divisor
 * @param {Function} [fn=Math.round]
 * @returns {Money}
 */
Money.prototype.divide = function (divisor, fn) {
    if (!_.isFunction(fn))
        fn = Math.round;

    assertOperand(divisor);
    var amount = fn(this.amount / divisor);

    return new Money(amount, this.currency);
};

/**
 * Allocates fund bases on the ratios provided returing an array of objects as a product of the allocation.
 *
 * @param {Array} other
 * @returns {Array.Money}
 */
Money.prototype.allocate = function (ratios) {
    var self = this;
    var remainder = self.amount;
    var results = [];
    var total = 0;

    ratios.forEach(function (ratio) {
        total += ratio;
    });

    ratios.forEach(function (ratio) {
        var share = Math.floor(self.amount * ratio / total)
        results.push(new Money(share, self.currency));
        remainder -= share;
    });

    for (var i = 0; remainder > 0; i++) {
        var idx = i % results.length;
        if (results[idx].isZero()) continue;
        results[idx] = new Money(results[idx].amount + 1, results[idx].currency);
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
Money.prototype.compare = function (other) {
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
Money.prototype.isZero = function () {
    return this.amount === 0;
};

/**
 * Returns true if the amount is positive.
 *
 * @returns {boolean}
 */
Money.prototype.isPositive = function () {
    return this.amount > 0;
};

/**
 * Returns true if the amount is negative.
 *
 * @returns {boolean}
 */
Money.prototype.isNegative = function () {
    return this.amount < 0;
};

/**
 * Returns the decimal value as a float.
 *
 * @returns {number}
 */
Money.prototype.toDecimal = function () {
    return Number(this.toString());
};

/**
 * Returns the decimal value as a string.
 *
 * @returns {string}
 */
Money.prototype.toString = function () {
    var currency = currencies[this.currency];
    return (this.amount / Math.pow(10, currency.decimal_digits)).toFixed(currency.decimal_digits);
};

/**
 * Returns a serialised version of the instance.
 *
 * @returns {{amount: number, currency: string}}
 */
Money.prototype.toJSON = function () {
    return {
        amount: this.amount,
        currency: this.currency
    };
};

module.exports = _.extend(Money, currencies);
