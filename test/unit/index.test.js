'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const create = require('../../dist/create');

describe('Index', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyIndex;

  beforeEach(function () {
    doubles = {
      createStub: sandbox.stub(create),
    };
    proxyIndex = proxyquire('../../dist/index', {
      './create': doubles.createStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should export a "create" property', function () {
    assert.notStrictEqual(proxyIndex.create, undefined);
  });

  describe('exported "create" property', function () {
    it('should be the default export of the "create" module', function () {
      assert.strictEqual(proxyIndex.create, doubles.createStub.default);
    });
  });
});