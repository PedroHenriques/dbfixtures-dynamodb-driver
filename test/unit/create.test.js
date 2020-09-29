'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const aws = require('aws-sdk');
const truncate = require('../../dist/truncate');
const insertFixtures = require('../../dist/insertFixtures');
const close = require('../../dist/close');

describe('Create', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyCreate;

  beforeEach(function () {
    doubles = {
      dynamodbClient: sandbox.stub(aws, 'DynamoDB'),
      dynamodbInstance: {},
      truncateStub: sandbox.stub(truncate),
      insertFixturesStub: sandbox.stub(insertFixtures),
      closeStub: sandbox.stub(close),
    };
    doubles.dynamodbClient.returns(doubles.dynamodbInstance);

    proxyCreate = proxyquire('../../dist/create', {
      'aws-sdk/clients/dynamodb': doubles.dynamodbClient,
      './truncate': doubles.truncateStub,
      './insertFixtures': doubles.insertFixturesStub,
      './close': doubles.closeStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    it('should be a function', function () {
      assert.typeOf(proxyCreate.default, 'function');
    });

    it('should return an object', function () {
      return(
        proxyCreate.default({})
        .then(function (create) {
          assert.typeOf(create, 'object');
        })
      );
    });

    it('should call the DynamoDb client constructor once', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.dynamodbClient.callCount, 1);
        })
      );
    });
    
    it('should call the DynamoDb client constructor with the value of the "clientConfiguration" property, from the object received as 1st argument, as 1st argument', function () {
      const clientConfiguration = {};
      return(
        proxyCreate.default({ clientConfiguration })
        .then(function () {
          assert.strictEqual(doubles.dynamodbClient.args[0][0], clientConfiguration);
        })
      );
    });

    it('should call the default export of the "truncate" module once', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.truncateStub.default.callCount, 1);
        })
      );
    });
    
    it('should call the default export of the "truncate" module with 2 argument', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.truncateStub.default.args[0].length, 2);
        })
      );
    });

    describe('1st argument passed to the call for the default export of the "truncate" module', function () {
      it('should be the dynamodb instance returned by the DynamoDb constructor', function () {
        return(
          proxyCreate.default({})
          .then(function () {
            assert.strictEqual(doubles.truncateStub.default.args[0][0], doubles.dynamodbInstance);
          })
        );
      });
    });
    
    describe('2nd argument passed to the call for the default export of the "truncate" module', function () {
      it('should be the value of the "tableConfigs" property, from the object received as 1st argument', function () {
        const tableConfigs = {};
        return(
          proxyCreate.default({ tableConfigs })
          .then(function () {
            assert.strictEqual(doubles.truncateStub.default.args[0][1], tableConfigs);
          })
        );
      });
    });

    it('should call the default export of the "insertFixtures" module once', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.insertFixturesStub.default.callCount, 1);
        })
      );
    });
    
    it('should call the default export of the "insertFixtures" module with 1 argument', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.insertFixturesStub.default.args[0].length, 1);
        })
      );
    });
    
    it('should call the default export of the "insertFixtures" module with the dynamodb instance as 1st argument', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.insertFixturesStub.default.args[0][0], doubles.dynamodbInstance);
        })
      );
    });

    describe('returned object', function () {
      it('should have the properties expected by the core package', function () {
        return(
          proxyCreate.default({})
          .then(function (create) {
            assert.hasAllKeys(create, [ 'truncate', 'insertFixtures', 'close' ]);
          })
        );
      });

      describe('"truncate" property', function () {
        it('should have the return value of the call to the default export of the "truncate" module', function () {
          const truncate = sandbox.stub();
          doubles.truncateStub.default.returns(truncate);
          return(
            proxyCreate.default({})
            .then(function (create) {
              assert.strictEqual(create.truncate, truncate);
            })
          );
        });
      });
      
      describe('"insertFixtures" property', function () {
        it('should have the return value of the call to the default export of the "insertFixtures" module', function () {
          const insertFixtures = sandbox.stub();
          doubles.insertFixturesStub.default.returns(insertFixtures);
          return(
            proxyCreate.default({})
            .then(function (create) {
              assert.strictEqual(create.insertFixtures, insertFixtures);
            })
          );
        });
      });
      
      describe('"close" property', function () {
        it('should be a function', function () {
          return(
            proxyCreate.default({})
            .then(function (create) {
              assert.isFunction(create.close);
            })
          );
        });

        describe('executing the function', function () {
          it('should call the default export of the "close" module once', function () {
            return(
              proxyCreate.default({})
              .then(function (create) {
                create.close();
                assert.strictEqual(doubles.closeStub.default.callCount, 1);
              })
            );
          });
          
          it('should call the default export of the "close" module with no argument', function () {
            return(
              proxyCreate.default({})
              .then(function (create) {
                create.close();
                assert.strictEqual(doubles.closeStub.default.args[0].length, 0);
              })
            );
          });
        });
      });
    });
  });
});