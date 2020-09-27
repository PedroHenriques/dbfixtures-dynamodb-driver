'use strict';
import * as dynamodbClient from 'aws-sdk/clients/dynamodb';

export default function truncateFactory(
  dynamodb: dynamodbClient,
  tableConfigs: { [key: string]: dynamodbClient.CreateTableInput }
): (tableNames: string[]) => Promise<void> {
  return (tableNames: string[]) => {
    const promises: Promise<dynamodbClient.CreateTableOutput>[] = [];

    tableNames.forEach(tableName => {
      promises.push(
        dynamodb.deleteTable({ TableName: tableName }).promise()
        .catch(error => {
          throw new Error(`Failed to delete the table "${tableName}".`);
        })
        .then(deleteResult => {
          return dynamodb.createTable(tableConfigs[tableName]).promise()
            .catch(error => {
              throw new Error(`Failed to create the table "${tableName}".`);
            });
        })
      );
    });

    return Promise.all(promises)
      .then(() => Promise.resolve());
  };
}