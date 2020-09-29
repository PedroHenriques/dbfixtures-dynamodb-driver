[![Build Status](https://travis-ci.org/PedroHenriques/dbfixtures-dynamodb-driver.svg?branch=master)](https://travis-ci.org/PedroHenriques/dbfixtures-dynamodb-driver)

# Fixtures Manager DynamoDb Driver

An abstraction layer for the [dynamodb client of the AWS SDK](https://www.npmjs.com/package/aws-sdk) to facilitate handling database fixtures for testing purposes, in a DynamoDb database.
This package is ment to be used in conjunction with the [dbfixtures package](https://www.npmjs.com/package/dbfixtures), but can also be used by itself.

## Installation

```sh
npm install dbfixtures-dynamodb-driver
```

## Usage

This package exposes the `create({ clientConfiguration: dynamodbClient.ClientConfiguration, tableConfigs: { [key: string]: dynamodbClient.CreateTableInput } }): Promise<IDriver>` function that returns a Promise that resolves with an instance of the driver.  

**Note1:** For detailed information about the `ClientConfiguration` argument, please consult the [AWS JS SDK DynamoDb constructor documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property).  
**Note2:** For detailed information about the `CreateTableInput` argument, please consult the [AWS JS SDK DynamoDb createTable documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property).

An instance of the driver exposes the following interface

```js
// truncates the tables with the supplied names
truncate: (tableNames: string[]) => Promise<void>

// inserts the supplied items into the specified table
insertFixtures: (tableName: string, fixtures: [{}]) => Promise<void>

// does any necessary cleanup
close: () => Promise<void>
```

### Example

This example uses [Mocha](https://mochajs.org/) as the potential test runner.

```js
const dbfixtures = require('dbfixtures');
const fixturesDynamodbDriver = require('dbfixtures-dynamodb-driver');

const dynamodbConfig = {
  region: 'eu-west-1',
  credentials: {
    accessKeyId: 'test key',
    secretAccessKey: 'test key',
  },
  endpoint: 'http://localhost:4566'
};

const tableConfigs = {
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
const fixtures = {
  'roles': [
    { id: { N: '1' }, name: { S: 'role 1' } },
    { id: { N: '2' }, name: { S: 'role 2' } },
  ],
  'users': [
    { id: { N: '1' }, email: { S: 'myemail@test.net' }, role_id: { N: '2' } },
    { id: { N: '2' }, email: { S: 'test@gmail.com' }, role_id: { N: '1' } },
    { id: { N: '3' }, email: { S: 'another@email.org' }, role_id: { N: '1' } },
  ],
};

describe('fixtures example', function () {
  before(async function () {
    const dynamodbDriver = await fixturesDynamodbDriver.create(dynamodbConfig, tableConfigs);
    dbfixtures.setDrivers(dynamodbDriver);
  });

  after(async function () {
    await dbfixtures.closeDrivers();
  });

  beforeEach(async function () {
    await dbfixtures.insertFixtures(fixtures);
  });

  it('should have the database seeded with the fixtures', function () {
    // ...
  });
});
```

## Testing This Package

* `cd` into the package's directory
* run `npm install`
* run `npm run build`

* for unit tests run `npm test -- test\unit\`

* for integration tests run `npm test -- test\integration\`  
**NOTE:** requires an active DynamoDb server available at `localhost:4566`

* for end-to-end tests run `npm test -- test\e2e\`  
**NOTE:** requires an active DynamoDb server available at `localhost:4566`

### Suggestion to setting up a DynamoDb server on your local machine

If you are using `Docker`, you can run the CLI command `docker run --name testlocalstack -it -p 4566:4566 -e SERVICES=dynamodb localstack/localstack` to raise a container with the Localstack image and make an instance of DynamoDb available through `localhost:4566`.