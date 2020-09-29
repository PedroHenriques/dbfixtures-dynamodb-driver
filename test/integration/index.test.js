'use strict';
const chai = require('chai');
const assert = chai.assert;

const sutModule = require('../../dist/index');
const dynamodbClient = require('aws-sdk/clients/dynamodb');

describe('Entry point', function () {
  let client;
  let tableConfigs;
  let moduleValue;

  before(async function () {
    const dynamodbConfig = {
      region: 'eu-west-1',
      credentials: {
        accessKeyId: 'test key',
        secretAccessKey: 'test key',
      },
      endpoint: 'http://localhost:4566'
    };

    client = new dynamodbClient(dynamodbConfig);

    tableConfigs = {
      roles: {
        TableName: 'roles',
        AttributeDefinitions: [
          {
            AttributeName: "id",
            AttributeType: "N",
          },
        ],
        KeySchema: [
          {
            AttributeName: "id",
            KeyType: "HASH",
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5, 
          WriteCapacityUnits: 5
        },
      },
      users: {
        TableName: 'users',
        AttributeDefinitions: [
          {
            AttributeName: "id",
            AttributeType: "N",
          },
        ],
        KeySchema: [
          {
            AttributeName: "id",
            KeyType: "HASH",
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5, 
          WriteCapacityUnits: 5
        },
      },
    };

    await Promise.all([
      client.describeTable({ TableName: 'roles' }).promise()
        .then(function (tableData) {
          if (tableData.Table !== undefined) { return }
          return client.createTable(tableConfigs.roles).promise();
        }),
      client.describeTable({ TableName: 'users' }).promise()
        .then(function (tableData) {
          if (tableData.Table !== undefined) { return }
          return client.createTable(tableConfigs.users).promise();
        }),
      sutModule.create({
          clientConfiguration: dynamodbConfig,
          tableConfigs,
        })
        .then(function (result) {
          moduleValue = result;
        }),
    ]);
  });

  beforeEach(async function () {
    await Promise.all([
      client.deleteTable({ TableName: 'roles' }).promise(),
      client.deleteTable({ TableName: 'users' }).promise(),
    ]);
    await Promise.all([
      client.createTable(tableConfigs.roles).promise(),
      client.createTable(tableConfigs.users).promise(),
    ]);

    const promises = [
      client.putItem({ TableName: 'roles', Item: { id: { N: '1' }, name: { S: 'role 1' } } }).promise(),
      client.putItem({ TableName: 'roles', Item: { id: { N: '2' }, name: { S: 'role 2' } } }).promise(),
      client.putItem({ TableName: 'users', Item: { id: { N: '1' }, name: { S: 'user 1' }, email: { S: 'email 1' } } }).promise(),
      client.putItem({ TableName: 'users', Item: { id: { N: '2' }, name: { S: 'user 2' }, email: { S: 'email 2' } } }).promise(),
      client.putItem({ TableName: 'users', Item: { id: { N: '3' }, name: { S: 'user 3' }, email: { S: 'email 3' } } }).promise(),
    ];

    await Promise.all(promises);
  });

  it('should return an object with the expected properties', function () {
    assert.hasAllKeys(moduleValue, [ 'truncate', 'insertFixtures', 'close' ]);
  });

  describe('"truncate" property of the returned object', function () {
    it('should remove all documents from the selected collection', async function () {
      await Promise.all([
        client.scan({ TableName: 'roles' }).promise(),
        client.scan({ TableName: 'users' }).promise(),
      ])
      .then(function (results) {
        assert.strictEqual(results[0].Items.length, 2);
        assert.strictEqual(results[1].Items.length, 3);
      });

      await moduleValue.truncate(['users']);

      await Promise.all([
        client.scan({ TableName: 'roles' }).promise(),
        client.scan({ TableName: 'users' }).promise(),
      ])
      .then(function (results) {
        assert.strictEqual(results[0].Items.length, 2);
        assert.strictEqual(results[1].Items.length, 0);
      });
    });
  });

  describe('"insertFixtures" property of the returned object', function () {
    it('should insert the provided documents into the selected collection', async function () {
      await Promise.all([
        client.scan({ TableName: 'roles' }).promise(),
        client.scan({ TableName: 'users' }).promise(),
      ])
      .then(function (results) {
        assert.strictEqual(results[0].Items.length, 2);
        assert.strictEqual(results[1].Items.length, 3);
      });

      await moduleValue.insertFixtures('roles', [ { id: { N: '3' }, name: { S: 'role 3' } }, { id: { N: '4' }, name: { S: 'role 4' } } ]);

      await Promise.all([
        client.scan({ TableName: 'roles' }).promise(),
        client.scan({ TableName: 'users' }).promise(),
      ])
      .then(function (results) {
        assert.strictEqual(results[0].Items.length, 4);
        assert.strictEqual(results[1].Items.length, 3);
      });
    });
  });
});