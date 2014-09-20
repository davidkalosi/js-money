/**
 * This file is part of the JS Money library
 *
 * Copyright (c) 2014 David Kalosi
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var money = require('./money');
var currency = require('./currency');
var _ = require('lodash');

module.exports = money;
module.exports = _.extend(module.exports, currency);
