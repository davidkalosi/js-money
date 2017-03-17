/**
 * This file is part of the JS Money library
 *
 * Copyright (c) 2014 David Kalosi
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var Money = require('../lib/index');

describe('Money', function () {
    it('should create a new instance from integer', function () {
        var money = new Money(1000, Money.EUR);

        expect(money.amount).to.equal(1000);
        expect(money.currency).to.equal('EUR');
    });

    it('should not create a new instance from decimal', function () {
        expect(function () {
            new Money(10.42, Money.EUR);
        }).to.throw(TypeError);
    });

    it('should create a new instance from decimal using `.fromDecimal()`', function () {
        var money = Money.fromDecimal(10.01, Money.EUR);
        var money1 = Money.fromDecimal(10.1, Money.EUR);
        var money2 = Money.fromDecimal(10, Money.EUR);

        expect(money.amount).to.equal(1001);
        expect(money.currency).to.equal('EUR');
        expect(money1.amount).to.equal(1010);
        expect(money2.amount).to.equal(1000);
    });

    it('should create a new instance from decimal string using `.fromDecimal()`', function () {
        var money = Money.fromDecimal('10.01', Money.EUR);
        var money1 = Money.fromDecimal('10', Money.EUR);

        expect(money.amount).to.equal(1001);
        expect(money1.amount).to.equal(1000);
    });

    it('should not create a new instance from decimal using `.fromDecimal()` if too many decimal places', function () {
        expect(function () {
            Money.fromDecimal(10.421, Money.EUR);
        }).to.throw(Error);
    });

    it('should create a new instance from decimal using `.fromDecimal()` even if too many decimal places if rounder function provided', function () {
        var money = Money.fromDecimal(10.01, Money.EUR, 'ceil');
        var money1 = Money.fromDecimal({amount: 10.01, currency: 'EUR'}, Math.ceil);
        var money2 = Money.fromDecimal(10.0101, Money.EUR, Math.ceil);
        var money3 = Money.fromDecimal(10.0199, Money.EUR, Math.ceil);
        var money4 = Money.fromDecimal(10.0199, Money.EUR, Math.floor);
        var money5 = Money.fromDecimal(10.0199, Money.EUR, Math.round);
        var money6 = Money.fromDecimal(10.0199, Money.EUR, function (amount) {
            return Math.round(amount)
        });

        expect(money.amount).to.equal(1001);
        expect(money.currency).to.equal('EUR');
        expect(money1.amount).to.equal(1001);
        expect(money2.amount).to.equal(1002);
        expect(money3.amount).to.equal(1002);
        expect(money4.amount).to.equal(1001);
        expect(money5.amount).to.equal(1002);
        expect(money6.amount).to.equal(1002);
    });

    it('should create a new instance from string currency', function () {
        var money = new Money(1042, 'EUR');

        expect(money.amount).to.equal(1042);
        expect(money.currency).to.equal('EUR');
    });

    it('should create a new instance from integer object', function () {
        var money = Money.fromInteger({amount: 1151, currency: 'EUR'});

        expect(money.amount).to.equal(1151);
        expect(money.currency).to.equal('EUR');
    });

    it('should create a new instance from integer', function () {
        var money = Money.fromInteger(1151,Money.EUR);

        expect(money.amount).to.equal(1151);
        expect(money.currency).to.equal('EUR');
    });

    it('should create a new instance from zero integer', function () {
        var money = Money.fromInteger(0,Money.EUR);

        expect(money.amount).to.equal(0);
        expect(money.currency).to.equal('EUR');
    });

    it('should create a new instance with correct decimals from object', function () {
        var money = Money.fromDecimal({amount: 11.5, currency: 'EUR'});

        expect(money.amount).to.equal(1150);
        expect(money.currency).to.equal('EUR');
    });

    it('should create a new instance from object with currenct object', function () {
        var money = Money.fromDecimal({amount: 11.51, currency: Money.EUR});

        expect(money.amount).to.equal(1151);
        expect(money.currency).to.equal('EUR');
    });

    it('should detect invalid currency', function () {
        expect(function () {
            new Money(10, 'XYZ')
        }).to.throw(TypeError);
    });

    it('should serialize correctly', function() {
        var money = new Money(1042, Money.EUR);

        expect(money.amount).to.be.a.number;
        expect(money.currency).to.be.a.string;
    });

    it('should check for decimal precision', function() {
        expect(function() {
            new Money(10.423456, Money.EUR)
        }).to.throw(Error);
    });

    it('should add same currencies', function () {
        var first = new Money(1000, Money.EUR);
        var second = new Money(500, Money.EUR);

        var result = first.add(second);

        expect(result.amount).to.equal(1500);
        expect(result.currency).to.equal('EUR');

        expect(first.amount).to.equal(1000);
        expect(second.amount).to.equal(500);
    });

    it('should not add different currencies', function () {
        var first = new Money(1000, Money.EUR);
        var second = new Money(500, Money.USD);

        expect(first.add.bind(first, second)).to.throw(Error);
    });

    it('should check for same type', function () {
        var first = new Money(1000, Money.EUR);

        expect(first.add.bind(first, {})).to.throw(TypeError);
    });

    it('should check if equal', function () {
        var first = new Money(1000, Money.EUR);
        var second = new Money(1000, Money.EUR);
        var third = new Money(1000, Money.USD);
        var fourth = new Money(100, Money.EUR);

        expect(first.equals(second)).to.equal(true);
        expect(first.equals(third)).to.equal(false);
        expect(first.equals(fourth)).to.equal(false);
    });

    it('should compare correctly', function () {
        var subject = new Money(1000, Money.EUR);

        expect(subject.compare(new Money(1500, Money.EUR))).to.equal(-1);
        expect(subject.compare(new Money(500, Money.EUR))).to.equal(1);
        expect(subject.compare(new Money(1000, Money.EUR))).to.equal(0);

        expect(function () {
            subject.compare(new Money(1500, Money.USD));
        }).to.throw(Error, 'Different currencies');

        expect(subject.greaterThan(new Money(1500, Money.EUR))).to.equal(false);
        expect(subject.greaterThan(new Money(500, Money.EUR))).to.equal(true);
        expect(subject.greaterThan(new Money(1000, Money.EUR))).to.equal(false);

        expect(subject.greaterThanOrEqual(new Money(1500, Money.EUR))).to.equal(false);
        expect(subject.greaterThanOrEqual(new Money(500, Money.EUR))).to.equal(true);
        expect(subject.greaterThanOrEqual(new Money(1000, Money.EUR))).to.equal(true);

        expect(subject.lessThan(new Money(1500, Money.EUR))).to.equal(true);
        expect(subject.lessThan(new Money(500, Money.EUR))).to.equal(false);
        expect(subject.lessThan(new Money(1000, Money.EUR))).to.equal(false);

        expect(subject.lessThanOrEqual(new Money(1500, Money.EUR))).to.equal(true);
        expect(subject.lessThanOrEqual(new Money(500, Money.EUR))).to.equal(false);
        expect(subject.lessThanOrEqual(new Money(1000, Money.EUR))).to.equal(true);
    });

    it('should subtract same currencies correctly', function() {
        var subject = new Money(1000, Money.EUR);
        var result = subject.subtract(new Money(250, Money.EUR));

        expect(result.amount).to.equal(750);
        expect(result.currency).to.equal('EUR');
    });

    it('should multiply correctly', function() {
        var subject = new Money(1000, Money.EUR);

        expect(subject.multiply(1.2234).amount).to.equal(1223);
        expect(subject.multiply(1.2234, Math.ceil).amount).to.equal(1224);
        expect(subject.multiply(1.2234, Math.floor).amount).to.equal(1223);
    });

    it('should divide correctly', function() {
        var subject = new Money(1000, Money.EUR);

        expect(subject.divide(2.234).amount).to.equal(448);
        expect(subject.divide(2.234, Math.ceil).amount).to.equal(448);
        expect(subject.divide(2.234, Math.floor).amount).to.equal(447);
    });

    it('should allocate correctly', function() {
       var subject = new Money(1000, Money.EUR);
       var results = subject.allocate([1,1,1]);

       expect(results.length).to.equal(3);
       expect(results[0].amount).to.equal(334);
       expect(results[0].currency).to.equal('EUR');
       expect(results[1].amount).to.equal(333);
       expect(results[1].currency).to.equal('EUR');
       expect(results[2].amount).to.equal(333);
       expect(results[2].currency).to.equal('EUR');
    });

    it('zero check works correctly', function() {
        var subject = new Money(1000, 'EUR');
        var subject1 = new Money(0, 'EUR');

        expect(subject.isZero()).to.be.false;
        expect(subject1.isZero()).to.be.true;
    });

    it('positive check works correctly', function() {
        var subject = new Money(1000, 'EUR');
        var subject1 = new Money(-1000, 'EUR');

        expect(subject.isPositive()).to.be.true;
        expect(subject1.isPositive()).to.be.false;
    });

    it('negative check works correctly', function() {
        var subject = new Money(1000, 'EUR');
        var subject1 = new Money(-1000, 'EUR');

        expect(subject.isNegative()).to.be.false;
        expect(subject1.isNegative()).to.be.true;
    });

    it('should allow to extract the amount as a decimal', function () {
        var subject = new Money(1000, 'EUR');
        var subject1 = new Money(1010, 'EUR');
        var subject2 = Money.fromDecimal(10.01, 'EUR');

        expect(subject.toDecimal()).to.equal(10);
        expect(subject1.toDecimal()).to.equal(10.1);
        expect(subject2.toDecimal()).to.equal(10.01);
    });

    it('should allow to be concatenated with a string', function () {
        var subject = new Money(1000, 'EUR');

        expect('' + subject).to.equal('10.00');
    });

    it('should allow to be stringified as JSON', function () {
        var subject = new Money(1000, 'EUR');

        expect(JSON.stringify({ foo: subject })).to.equal('{"foo":{"amount":1000,"currency":"EUR"}}');
    });

    it('should return the amount/currency represented by object', function () {
        var subject = new Money(1000, 'EUR');

        expect(subject.getAmount()).to.equal(1000);
        expect(subject.getCurrency()).to.equal('EUR');
    });

    it('should convert from decimal per currency', function () {
        var euro = Money.fromDecimal(123.45, 'EUR');
        var forint = Money.fromDecimal(123.45, 'HUF');
        var yen = Money.fromDecimal(12345, 'JPY');
        var dinar = Money.fromDecimal(12.345, 'BHD');

        expect(euro.amount).to.equal(12345);
        expect(forint.amount).to.equal(12345);
        expect(yen.amount).to.equal(12345);
        expect(dinar.amount).to.equal(12345);
    });

    it('should convert to decimal per currency', function () {
        var euro = new Money(12345, 'EUR');
        var forint = new Money(12345, 'HUF');
        var yen = new Money(12345, 'JPY');
        var dinar = new Money(12345, 'BHD');

        expect(euro.toDecimal()).to.equal(123.45);
        expect(forint.toDecimal()).to.equal(123.45);
        expect(yen.toDecimal()).to.equal(12345);
        expect(dinar.toDecimal()).to.equal(12.345);
    });

    it('should convert from decimal when using less than maximum decimal digits', function () {
        var euro = Money.fromDecimal(123, 'EUR');
        var forint = Money.fromDecimal(123.4, 'HUF');
        var dinar = Money.fromDecimal(12.3, 'BHD');

        expect(euro.amount).to.equal(12300);
        expect(forint.amount).to.equal(12340);
        expect(dinar.amount).to.equal(12300);
    });
});
