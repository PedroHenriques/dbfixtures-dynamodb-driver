'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

describe('Close', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyClose;

  beforeEach(function () {
    proxyClose = proxyquire('../../dist/close', {
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    it('should be a function', function () {
      assert.typeOf(proxyClose.default, 'function');
    });

    it('should return a Promise that resolves with void', function () {
      return proxyClose.default()
        .then(function (result) {
          assert.isUndefined(result);
        });
    });
  });
});