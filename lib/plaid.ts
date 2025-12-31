import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { PlaidMockApi } from './plaid-mock';

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    }
  }
})

export const plaidClient = process.env.MOCK_MODE === 'true'
  ? new PlaidMockApi(configuration) as unknown as PlaidApi
  : new PlaidApi(configuration);