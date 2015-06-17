/**
 * This file is part of the JS Money library
 *
 * Copyright (c) 2014 David Kalosi
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var Money = require('..');

describe('js-money', function() {

    it('should export constructor directly from package', function() {
        expect(Money).to.be.a('function');
    });

    it('should export currencies', function() {
        expect(Money.EUR).to.be.a('object');
    });

    it('should export factory methods', function() {
        expect(Money.fromDecimal).to.be.a('function');
    });
});