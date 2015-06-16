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

        expect(money.amount).to.equal(100000);
        expect(money.currency).to.equal('EUR');
    });

        it('decimals should be consistent', function () {        
        var money = new Money(1000, Money.EUR);
        var otherMoney = new Money(1000.0, Money.EUR);
        var thirdMoney = new Money(1000.00, Money.EUR);

        expect(money.amount).to.equal(100000);
        expect(otherMoney.amount).to.equal(100000);
        expect(thirdMoney.amount).to.equal(100000);
    });
    
    it('should create a new instance from decimal', function () {
        var money = new Money(10.42, Money.EUR);

        expect(money.amount).to.equal(1042);
        expect(money.currency).to.equal('EUR');
    });
    
    it('should create a new instance from string currency', function () {
        var money = new Money(10.42, 'EUR');

        expect(money.amount).to.equal(1042);
        expect(money.currency).to.equal('EUR');
    });

    it('should create a new instance from object', function () {
        var money = new Money({amount: 11.51, currency: 'EUR'});

        expect(money.amount).to.equal(1151);
        expect(money.currency).to.equal('EUR');
    });

    it('should create a new instance with correct decimals from object', function () {
        var money = new Money({amount: 11.5, currency: 'EUR'});

        expect(money.amount).to.equal(1150);
        expect(money.currency).to.equal('EUR');
    });

    it('should create a new instance from object with currenct object', function () {
        var money = new Money({amount: 11.51, currency: Money.EUR});

        expect(money.amount).to.equal(1151);
        expect(money.currency).to.equal('EUR');
    });


    it('should detect invalid currency', function () {
        expect(function () {
            new Money(10, 'XYZ')
        }).to.throw(TypeError);
    });
    
    it('should serialize correctly', function() {
        var money = new Money(10.42, Money.EUR);
        
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

        expect(result.amount).to.equal(150000);
        expect(result.currency).to.equal('EUR');

        expect(first.amount).to.equal(100000);
        expect(second.amount).to.equal(50000);
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
    });
    
    it('should subtract same currencies correctly', function() {
        var subject = new Money(1000, Money.EUR);
        var result = subject.subtract(new Money(250, Money.EUR));
        
        expect(result.amount).to.equal(75000);
        expect(result.currency).to.equal('EUR');
    });
    
    it('should multiply correctly', function() {
        var subject = new Money(1000, Money.EUR);
        var result = subject.multiply(10.5);
        
        expect(result.amount).to.equal(1050000);
    });
    
    it('should divide correctly', function() {
        var subject = new Money(1000, Money.EUR);
        var result = subject.divide(2.234);
        
        expect(result.amount).to.equal(44763);
    });
    
    it('should allocate correctly', function() {
       var subject = new Money(1000, Money.EUR);
       var results = subject.allocate([1,1,1]);
       
       expect(results.length).to.equal(3);
       expect(results[0].amount).to.equal(33334);
       expect(results[0].currency).to.equal('EUR');
       expect(results[1].amount).to.equal(33333);
       expect(results[1].currency).to.equal('EUR');
       expect(results[2].amount).to.equal(33333);    
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
    
});
