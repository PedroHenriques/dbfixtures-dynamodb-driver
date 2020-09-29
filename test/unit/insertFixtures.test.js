'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

describe('Insert Fixtures', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyInsertFixtures;

  beforeEach(function () {
    doubles = {
      dynamodbInstance: {
        batchWriteItem: sandbox.stub(),
      },
      batchWriteItemPromise: sandbox.stub(),
    };
    doubles.dynamodbInstance.batchWriteItem.returns({ promise: doubles.batchWriteItemPromise });
    doubles.batchWriteItemPromise.returns(Promise.resolve({}));

    proxyInsertFixtures = proxyquire('../../dist/insertFixtures', {
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    it('should be a function', function () {
      assert.typeOf(proxyInsertFixtures.default, 'function');
    });

    it('should return a function when called', function () {
      assert.typeOf(proxyInsertFixtures.default(), 'function');
    });

    describe('returned function', function () {
      let returnedFunction;
      beforeEach(function () {
        returnedFunction = proxyInsertFixtures.default(doubles.dynamodbInstance);
      });

      it('should call the batchWriteItem(), on the dynamodb object provided as argument to the default export, once', function () {
        return returnedFunction('', [{}])
          .then(function () {
            assert.strictEqual(doubles.dynamodbInstance.batchWriteItem.callCount, 1);
          });
      });
      
      it('should call the batchWriteItem(), on the dynamodb object provided as argument to the default export, with the correct objct as 1st argument', function () {
        const fixtures = [
          {
            k1: { S: 'test string' },
            k2: { BOOL: true },
          },
          {
            p1: 4,
          },
          {
            ll: 'hello',
          }
        ];
        return returnedFunction('my table 7', fixtures)
          .then(function () {
            assert.deepEqual(
              doubles.dynamodbInstance.batchWriteItem.args[0][0],
              {
                RequestItems: {
                  'my table 7': [
                    {
                      PutRequest: {
                        Item: fixtures[0],
                      },
                    },
                    {
                      PutRequest: {
                        Item: fixtures[1],
                      },
                    },
                    {
                      PutRequest: {
                        Item: fixtures[2],
                      },
                    },
                  ],
                }
              }
            );
          });
      });
      
      it('should call the promise(), on the result of calling batchWriteItem(), once', function () {
        return returnedFunction('', [{}])
          .then(function () {
            assert.strictEqual(doubles.batchWriteItemPromise.callCount, 1);
          });
      });

      it('should return a Promise that resolves with void', function () {
        return returnedFunction('', [])
          .then(function (result) {
            assert.isUndefined(result);
          });
      });

      describe('if the number of fixtures exceeds 25 items - 30 items as an example', function () {
        it('should call batchWriteItem(), on the dynamodb object provided as argument to the default export, 2 times', function () {
          let fixtures = new Array(30);
          fixtures = fixtures.fill({});

          return returnedFunction('', fixtures)
          .then(function () {
            assert.strictEqual(doubles.batchWriteItemPromise.callCount, 2);
          });
        });
        
        describe('1st call to batchWriteItem(), on the dynamodb object provided as argument to the default export', function () {
          it('should have the correct object as 1st argument', function () {
            const fixtures = [
              { k1: '1' },
              { k2: '2' },
              { k3: '3' },
              { k4: '4' },
              { k5: '5' },
              { k6: '6' },
              { k7: '7' },
              { k8: '8' },
              { k9: '9' },
              { k10: '10' },
              { k11: '11' },
              { k12: '12' },
              { k13: '13' },
              { k14: '14' },
              { k15: '15' },
              { k16: '16' },
              { k17: '17' },
              { k18: '18' },
              { k19: '19' },
              { k20: '20' },
              { k21: '21' },
              { k22: '22' },
              { k23: '23' },
              { k24: '24' },
              { k25: '25' },
              { k26: '26' },
              { k27: '27' },
              { k28: '28' },
              { k29: '29' },
              { k30: '30' },
            ];
            return returnedFunction('some table', fixtures)
              .then(function () {
                assert.deepEqual(
                  doubles.dynamodbInstance.batchWriteItem.args[0][0],
                  {
                    RequestItems: {
                      'some table': [
                        {
                          PutRequest: {
                            Item: fixtures[0],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[1],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[2],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[3],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[4],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[5],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[6],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[7],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[8],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[9],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[10],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[11],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[12],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[13],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[14],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[15],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[16],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[17],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[18],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[19],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[20],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[21],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[22],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[23],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[24],
                          },
                        },
                      ],
                    }
                  }
                );
              });
          });
        });

        describe('2nd call to batchWriteItem(), on the dynamodb object provided as argument to the default export', function () {
          it('should have the correct object as 1st argument', function () {
            const fixtures = [
              { k1: '1' },
              { k2: '2' },
              { k3: '3' },
              { k4: '4' },
              { k5: '5' },
              { k6: '6' },
              { k7: '7' },
              { k8: '8' },
              { k9: '9' },
              { k10: '10' },
              { k11: '11' },
              { k12: '12' },
              { k13: '13' },
              { k14: '14' },
              { k15: '15' },
              { k16: '16' },
              { k17: '17' },
              { k18: '18' },
              { k19: '19' },
              { k20: '20' },
              { k21: '21' },
              { k22: '22' },
              { k23: '23' },
              { k24: '24' },
              { k25: '25' },
              { k26: '26' },
              { k27: '27' },
              { k28: '28' },
              { k29: '29' },
              { k30: '30' },
            ];
            return returnedFunction('some table', fixtures)
              .then(function () {
                assert.deepEqual(
                  doubles.dynamodbInstance.batchWriteItem.args[1][0],
                  {
                    RequestItems: {
                      'some table': [
                        {
                          PutRequest: {
                            Item: fixtures[25],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[26],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[27],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[28],
                          },
                        },
                        {
                          PutRequest: {
                            Item: fixtures[29],
                          },
                        },
                      ],
                    }
                  }
                );
              });
          });
        });
      });

      describe('if the result of calling promise(), on the result of calling batchWriteItem(), contains the "UnprocessedItems" property', function () {
        it('should return a Promise that rejects with an Error containing a custom message', function () {
          doubles.batchWriteItemPromise.returns(Promise.resolve({ UnprocessedItems: { 'some table': [ {}, {} ] } }));

          return returnedFunction('some table', [{}])
            .then(function () {
              assert.fail();
            })
            .catch(function (error) {
              assert.strictEqual(error.message, 'Failed to insert 2 fixtures in the table "some table".');
            });
        });
      });
      
      describe('if calling promise(), on the result of calling batchWriteItem(), returns a Promise that rejects', function () {
        it('should return a Promise that rejects with an Error containing a custom message', function () {
          doubles.batchWriteItemPromise.returns(Promise.reject(new Error('test error message')));

          return returnedFunction('some table', [{}])
            .then(function () {
              assert.fail();
            })
            .catch(function (error) {
              assert.strictEqual(error.message, 'Failed to insert the fixtures in the table "some table".');
            });
        });
      });
    });
  });
});