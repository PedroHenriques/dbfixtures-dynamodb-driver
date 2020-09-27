'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const aws = require('aws-sdk');

describe('Truncate', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyTruncate;

  beforeEach(function () {
    doubles = {
      dynamodbClient: sandbox.stub(aws.dynamodbClient),
      dynamodbInstance: {
        deleteTable: sandbox.stub(),
        createTable: sandbox.stub(),
      },
      deleteTablePromise: sandbox.stub(),
      createTablePromise: sandbox.stub(),
    };
    doubles.dynamodbClient.returns(doubles.dynamodbInstance);
    doubles.dynamodbInstance.deleteTable.returns({ promise: doubles.deleteTablePromise });
    doubles.deleteTablePromise.returns(Promise.resolve());
    doubles.dynamodbInstance.createTable.returns({ promise: doubles.createTablePromise });
    doubles.createTablePromise.returns(Promise.resolve());

    proxyTruncate = proxyquire('../../dist/truncate', {});
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {  
    it('should be a function', function () {
      assert.typeOf(proxyTruncate.default, 'function');
    });
    
    it('should return a function', function () {
      assert.typeOf(proxyTruncate.default(), 'function');
    });

    describe('returned function', function () {
      let truncate;
      let tableConfigs;

      beforeEach(function () {
        tableConfigs = {};
        truncate = proxyTruncate.default(doubles.dynamodbInstance, tableConfigs);
      });

      describe('if the provided array has 1 element', function () {  
        it('should call the deleteTable(), on the object provided as 1st argument to the default export, once', function () {
          return(
            truncate([ 'table1' ])
            .then(function () {
              assert.strictEqual(doubles.dynamodbInstance.deleteTable.callCount, 1);
            })
          );
        });
        
        it('should call the deleteTable(), on the object provided as 1st argument to the default export, with the correct object as 1st argument', function () {
          return(
            truncate([ 'table13' ])
            .then(function () {
              assert.deepEqual(
                doubles.dynamodbInstance.deleteTable.args[0][0],
                { TableName: 'table13' }
              );
            })
          );
        });
        
        it('should call the promise() property, on the result of calling deleteTable() of the object provided as 1st argument to the default export, once', function () {
          return(
            truncate([ 'table13' ])
            .then(function () {
              assert.strictEqual(doubles.deleteTablePromise.callCount, 1);
            })
          );
        });

        it('should call createTable(), on the object provided as 1st argument to the default export, once', function () {
          return(
            truncate([ 'table13' ])
            .then(function () {
              assert.strictEqual(doubles.dynamodbInstance.createTable.callCount, 1);
            })
          );
        });
        
        it('should call createTable(), on the object provided as 1st argument to the default export, with the corresponding object from the 2nd argument received, as 1st argument', function () {
          tableConfigs.t3 = {};
          return(
            truncate([ 't3' ])
            .then(function () {
              assert.strictEqual(
                doubles.dynamodbInstance.createTable.args[0][0],
                tableConfigs.t3
              );
            })
          );
        });

        it('should call the promise() property, on the result of calling createTable() of the object provided as 1st argument to the default export, once', function () {
          return(
            truncate([ 'ty' ])
            .then(function () {
              assert.strictEqual(doubles.createTablePromise.callCount, 1);
            })
          );
        });

        describe('if the call to call the deleteTable(), on the object provided as 1st argument to the default export, returns a promise that rejects', function () {
          beforeEach(function () {
            doubles.deleteTablePromise.returns(Promise.reject(new Error('error from unit test suite')));
          });

          it('should not call createTable(), on the object provided as 1st argument to the default export', function () {
            return(
              truncate([ 'ty' ])
              .then(function () {
                assert.fail();
              })
              .catch(function () {
                assert.strictEqual(doubles.dynamodbInstance.createTable.callCount, 0);
              })
            );
          });
          
          it('should returns a Promise that rejects with an Error containing a custom message', function () {
            return(
              truncate([ 'tya' ])
              .then(function () {
                assert.fail();
              })
              .catch(function (reason) {
                assert.strictEqual(
                  reason.message,
                  'Failed to delete the table "tya".'
                );
              })
            );
          });
        });
        
        describe('if the call to call the createTable(), on the object provided as 1st argument to the default export, returns a promise that rejects', function () {
          beforeEach(function () {
            doubles.createTablePromise.returns(Promise.reject(new Error('error from unit test suite')));
          });
          
          it('should returns a Promise that rejects with an Error containing a custom message', function () {
            return(
              truncate([ 'dsfg' ])
              .then(function () {
                assert.fail();
              })
              .catch(function (reason) {
                assert.strictEqual(
                  reason.message,
                  'Failed to create the table "dsfg".'
                );
              })
            );
          });
        });
      });
      
      describe('if the provided array has 2 elements', function () {  
        let deleteTablePromise1;
        let deleteTablePromise2;
        let createTablePromise1;
        let createTablePromise2;

        beforeEach(function () {
          deleteTablePromise1 = sandbox.stub();
          deleteTablePromise2 = sandbox.stub();
          createTablePromise1 = sandbox.stub();
          createTablePromise2 = sandbox.stub();

          doubles.dynamodbInstance.deleteTable.onCall(0).returns({ promise: deleteTablePromise1 });
          doubles.dynamodbInstance.deleteTable.onCall(1).returns({ promise: deleteTablePromise2 });
          deleteTablePromise1.returns(Promise.resolve());
          deleteTablePromise2.returns(Promise.resolve());
          doubles.dynamodbInstance.createTable.onCall(0).returns({ promise: createTablePromise1 });
          doubles.dynamodbInstance.createTable.onCall(1).returns({ promise: createTablePromise2 });
          createTablePromise1.returns(Promise.resolve());
          createTablePromise2.returns(Promise.resolve());
        });

        it('should call the deleteTable(), on the object provided as 1st argument to the default export, 2 times', function () {
          return(
            truncate([ 'table1', 't2' ])
            .then(function () {
              assert.strictEqual(doubles.dynamodbInstance.deleteTable.callCount, 2);
            })
          );
        });
        
        describe('1st call to deleteTable(), on the object provided as 1st argument to the default export', function () {
          it('should call it with the correct object as 1st argument', function () {
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.deepEqual(
                  doubles.dynamodbInstance.deleteTable.args[0][0],
                  { TableName: 'table1' }
                );
              })
            );
          });
          
          it('should call the promise() property, on the result of calling it, once', function () {
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.strictEqual(deleteTablePromise1.callCount, 1);
              })
            );
          });
        });
        
        describe('2nd call to deleteTable(), on the object provided as 1st argument to the default export', function () {
          it('should call it with the correct object as 1st argument', function () {
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.deepEqual(
                  doubles.dynamodbInstance.deleteTable.args[1][0],
                  { TableName: 't2' }
                );
              })
            );
          });
          
          it('should call the promise() property, on the result of calling it, once', function () {
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.strictEqual(deleteTablePromise2.callCount, 1);
              })
            );
          });
        });

        it('should call createTable(), on the object provided as 1st argument to the default export, 2 times', function () {
          return(
            truncate([ 'table1', 't2' ])
            .then(function () {
              assert.strictEqual(doubles.dynamodbInstance.createTable.callCount, 2);
            })
          );
        });

        describe('1st call to createTable(), on the object provided as 1st argument to the default export', function () {
          it('should call it with the corresponding object from the 2nd argument received by the default export, as 1st argument', function () {
            tableConfigs.table1 = {};
            tableConfigs.t2 = {};
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.strictEqual(
                  doubles.dynamodbInstance.createTable.args[0][0],
                  tableConfigs.table1
                );
              })
            );
          });
  
          it('should call the promise() property, on the result of calling createTable() of the object provided as 1st argument to the default export, once', function () {
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.strictEqual(createTablePromise1.callCount, 1);
              })
            );
          });
        });
        
        describe('2nd call to createTable(), on the object provided as 1st argument to the default export', function () {
          it('should call it with the corresponding object from the 2nd argument received by the default export, as 1st argument', function () {
            tableConfigs.table1 = {};
            tableConfigs.t2 = {};
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.strictEqual(
                  doubles.dynamodbInstance.createTable.args[1][0],
                  tableConfigs.t2
                );
              })
            );
          });
  
          it('should call the promise() property, on the result of calling createTable() of the object provided as 1st argument to the default export, once', function () {
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.strictEqual(createTablePromise2.callCount, 1);
              })
            );
          });
        });
        
        describe('if the 1st call to deleteTable(), on the object provided as 1st argument to the default export, returns a promise that rejects', function () {
          beforeEach(function () {
            deleteTablePromise1.returns(Promise.reject(new Error('error from unit test suite for the 1st call to deleteTable()')));
          });

          it('should call createTable(), on the object provided as 1st argument to the default export, only once', function () {
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.fail();
              })
              .catch(function () {
                assert.strictEqual(doubles.dynamodbInstance.createTable.callCount, 1);
              })
            );
          });
          
          it('should returns a Promise that rejects with an Error containing a custom message', function () {
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.fail();
              })
              .catch(function (reason) {
                assert.strictEqual(
                  reason.message,
                  'Failed to delete the table "table1".'
                );
              })
            );
          });
        });
        
        describe('if the 2nd call to deleteTable(), on the object provided as 1st argument to the default export, returns a promise that rejects', function () {
          beforeEach(function () {
            deleteTablePromise2.returns(Promise.reject(new Error('error from unit test suite for the 2nd call to deleteTable()')));
          });

          it('should call createTable(), on the object provided as 1st argument to the default export, only once', function () {
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.fail();
              })
              .catch(function () {
                assert.strictEqual(doubles.dynamodbInstance.createTable.callCount, 1);
              })
            );
          });
          
          it('should returns a Promise that rejects with an Error containing a custom message', function () {
            return(
              truncate([ 'table1', 't2' ])
              .then(function () {
                assert.fail();
              })
              .catch(function (reason) {
                assert.strictEqual(
                  reason.message,
                  'Failed to delete the table "t2".'
                );
              })
            );
          });
        });
        
        describe('if the 1st call to createTable(), on the object provided as 1st argument to the default export, returns a promise that rejects', function () {
          it('should returns a Promise that rejects with an Error containing a custom message', function () {
            createTablePromise1.returns(Promise.reject(new Error('error from unit test suite')));

            return(
              truncate([ 'ab', 'cd' ])
              .then(function () {
                assert.fail();
              })
              .catch(function (reason) {
                assert.strictEqual(
                  reason.message,
                  'Failed to create the table "ab".'
                );
              })
            );
          });
        });
        
        describe('if the 2nd call to createTable(), on the object provided as 1st argument to the default export, returns a promise that rejects', function () {
          it('should returns a Promise that rejects with an Error containing a custom message', function () {
            createTablePromise2.returns(Promise.reject(new Error('error from unit test suite')));

            return(
              truncate([ 'ab', 'cd' ])
              .then(function () {
                assert.fail();
              })
              .catch(function (reason) {
                assert.strictEqual(
                  reason.message,
                  'Failed to create the table "cd".'
                );
              })
            );
          });
        });
      });
    });
  });
});