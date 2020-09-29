'use strict';
const chai = require('chai');
const assert = chai.assert;

const dbFixtures = require('dbfixtures');
const sutModule = require('../../dist/index');
const dynamodbClient = require('aws-sdk/clients/dynamodb');

describe('Entry point', function () {
  let client;
  let tableConfigs;
  let dynamodbDriver;

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
          dynamodbDriver = result;
        }),
    ]);

    dbFixtures.setDrivers(dynamodbDriver);
  });

  after(function () {
    dbFixtures.closeDrivers();
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
  });

  it('should interact with the dynamodb client correctly', async function () {
    const fixtures = {
      'users': [
        { id: { N: '1' }, email: { S: 'myemail@test.net' }, role_id: { N: '2' } },
        { id: { N: '2' }, email: { S: 'test@gmail.com' }, role_id: { N: '1' } },
        { id: { N: '3' }, email: { S: 'another@email.org' }, role_id: { N: '1' } },
      ],
      'roles': [
        { id: { N: '1' }, name: { S: 'role 1' } },
        { id: { N: '2' }, name: { S: 'role 2' } },
      ],
    };

    await Promise.all([
      client.scan({ TableName: 'roles' }).promise(),
      client.scan({ TableName: 'users' }).promise(),
    ])
    .then(function (results) {
      assert.strictEqual(results[0].Items.length, 0);
      assert.strictEqual(results[1].Items.length, 0);
    });

    await dbFixtures.insertFixtures(fixtures);

    await Promise.all([
      client.scan({ TableName: 'roles' }).promise(),
      client.scan({ TableName: 'users' }).promise(),
    ])
    .then(function (results) {
      assert.strictEqual(results[0].Items.length, 2);
      assert.strictEqual(results[1].Items.length, 3);
    });
  });
});