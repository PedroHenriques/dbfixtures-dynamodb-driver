'use strict';
import * as dynamodbClient from 'aws-sdk/clients/dynamodb';
import truncateFactory from './truncate';
import insertFixturesFactory from './insertFixtures';
import closeFactory from './close';
import { IDriver } from './interfaces';

export default async function create(
  args: {
    clientConfiguration: dynamodbClient.ClientConfiguration,
    tableConfigs: { [key: string]: dynamodbClient.CreateTableInput }
  }
): Promise<IDriver> {
  const client = new dynamodbClient(args.clientConfiguration);

  return({
    truncate: truncateFactory(client, args.tableConfigs),
    insertFixtures: insertFixturesFactory(client),
    close: () => closeFactory(),
  });
}