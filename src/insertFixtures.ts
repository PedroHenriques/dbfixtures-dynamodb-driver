'use strict';
import * as dynamodbClient from 'aws-sdk/clients/dynamodb';

export default function insertFixturesFactory(dynamodb: dynamodbClient) {
  return((tableName: string, fixtures: [{}]): Promise<void> => {
    const promises: Array<Promise<void>> = [];

    let items: {}[] = [];
    fixtures.forEach(fixture => {
      items.push({
        PutRequest: {
          Item: fixture,
        },
      });

      if (items.length === 25) {
        promises.push(writeItems(dynamodb, tableName, items));
        items = [];
      }
    });

    if (items.length > 0) {
      promises.push(writeItems(dynamodb, tableName, items));
    }

    return Promise.all(promises)
      .then(() => { return; });
  });
}

function writeItems(
  dynamodb: dynamodbClient,
  tableName: string,
  items: {}[]
): Promise<void> {
  return dynamodb.batchWriteItem({
      RequestItems: { [tableName]: [ ...items ] }
    }).promise()
    .catch(error => {
      return Promise.reject(new Error(
        `Failed to insert the fixtures in the table "${tableName}".`
      ));
    })
    .then(writeResult => {
      if (writeResult.UnprocessedItems !== undefined) {
        return Promise.reject(new Error(
          `Failed to insert ${writeResult.UnprocessedItems[tableName].length} fixtures in the table "${tableName}".`
        ));
      }
      return;
    });
}