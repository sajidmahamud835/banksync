import { plaidClient } from '../lib/plaid';
import { Products, CountryCode } from 'plaid';

async function testMockMode() {
  console.log('Testing Mock Mode...');

  if (process.env.MOCK_MODE !== 'true') {
    console.error('Error: MOCK_MODE is not set to true.');
    process.exit(1);
  }

  try {
    // Test linkTokenCreate
    console.log('Testing linkTokenCreate...');
    const linkTokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'test_user' },
      client_name: 'Test App',
      products: [Products.Auth],
      language: 'en',
      country_codes: [CountryCode.Us],
    });
    if (linkTokenResponse.data.link_token === 'mock_link_token') {
      console.log('PASS: linkTokenCreate returned mock token.');
    } else {
      console.error('FAIL: linkTokenCreate did not return mock token.');
    }

    // Test accountsGet
    console.log('Testing accountsGet...');
    const accountsResponse = await plaidClient.accountsGet({
        access_token: 'mock_access_token'
    });
    if (accountsResponse.data.accounts[0].account_id === 'mock_account_id') {
        console.log('PASS: accountsGet returned mock account.');
    } else {
        console.error('FAIL: accountsGet did not return mock account.');
    }

    // Test itemPublicTokenExchange
    console.log('Testing itemPublicTokenExchange...');
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
        public_token: 'mock_public_token'
    });
    if (exchangeResponse.data.access_token === 'mock_access_token') {
        console.log('PASS: itemPublicTokenExchange returned mock access token.');
    } else {
        console.error('FAIL: itemPublicTokenExchange did not return mock access token.');
    }

  } catch (error) {
    console.error('An error occurred during mock test:', error);
    process.exit(1);
  }
}

testMockMode();
