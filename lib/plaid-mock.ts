import {
  AccountsGetRequest,
  AccountsGetResponse,
  Configuration,
  CountryCode,
  InstitutionsGetByIdRequest,
  InstitutionsGetByIdResponse,
  ItemPublicTokenExchangeRequest,
  ItemPublicTokenExchangeResponse,
  LinkTokenCreateRequest,
  LinkTokenCreateResponse,
  PlaidApi,
  PlaidEnvironments,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateResponse,
  Products,
  TransactionsSyncRequest,
  TransactionsSyncResponse,
} from 'plaid';

export class PlaidMockApi {
  configuration: Configuration;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }

  async accountsGet(request: AccountsGetRequest): Promise<{ data: AccountsGetResponse }> {
    return {
      data: {
        accounts: [
          {
            account_id: 'mock_account_id',
            balances: {
              available: 100,
              current: 110,
              iso_currency_code: 'USD',
              limit: null,
              unofficial_currency_code: null,
            },
            mask: '0000',
            name: 'Mock Checking',
            official_name: 'Mock Personal Checking',
            subtype: 'checking',
            type: 'depository',
          },
        ],
        item: {
          available_products: [Products.Auth, Products.Transactions],
          billed_products: [Products.Auth, Products.Transactions],
          consent_expiration_time: null,
          error: null,
          institution_id: 'ins_mock',
          item_id: 'mock_item_id',
          products: [Products.Auth, Products.Transactions],
          update_type: 'background',
          webhook: null,
        },
        request_id: 'mock_request_id',
      },
    } as any;
  }

  async institutionsGetById(request: InstitutionsGetByIdRequest): Promise<{ data: InstitutionsGetByIdResponse }> {
    return {
      data: {
        institution: {
          country_codes: [CountryCode.Us],
          institution_id: 'ins_mock',
          name: 'Mock Bank',
          products: [Products.Auth, Products.Transactions],
          routing_numbers: ['123456789'],
        },
        request_id: 'mock_request_id',
      },
    } as any;
  }

  async transactionsSync(request: TransactionsSyncRequest): Promise<{ data: TransactionsSyncResponse }> {
    return {
      data: {
        added: [
            {
                account_id: 'mock_account_id',
                amount: 10,
                date: new Date().toISOString().split('T')[0],
                iso_currency_code: 'USD',
                name: 'Mock Transaction',
                payment_channel: 'online',
                pending: false,
                transaction_id: 'mock_transaction_id',
                transaction_type: 'place',
                unofficial_currency_code: null,
                category: ['Shops', 'Supermarkets'],
                category_id: '19047000',
                location: {
                    address: null,
                    city: null,
                    region: null,
                    postal_code: null,
                    country: null,
                    lat: null,
                    lon: null,
                    store_number: null,
                },
                payment_meta: {
                    by_order_of: null,
                    payee: null,
                    payer: null,
                    payment_method: null,
                    payment_processor: null,
                    ppd_id: null,
                    reason: null,
                    reference_number: null,
                },
            }
        ],
        modified: [],
        removed: [],
        next_cursor: 'mock_next_cursor',
        has_more: false,
        request_id: 'mock_request_id',
      },
    } as any;
  }

  async linkTokenCreate(request: LinkTokenCreateRequest): Promise<{ data: LinkTokenCreateResponse }> {
    return {
      data: {
        link_token: 'mock_link_token',
        expiration: new Date(Date.now() + 3600 * 1000).toISOString(),
        request_id: 'mock_request_id',
      },
    } as any;
  }

  async itemPublicTokenExchange(request: ItemPublicTokenExchangeRequest): Promise<{ data: ItemPublicTokenExchangeResponse }> {
    return {
      data: {
        access_token: 'mock_access_token',
        item_id: 'mock_item_id',
        request_id: 'mock_request_id',
      },
    } as any;
  }

  async processorTokenCreate(request: ProcessorTokenCreateRequest): Promise<{ data: ProcessorTokenCreateResponse }> {
    return {
      data: {
        processor_token: 'mock_processor_token',
        request_id: 'mock_request_id',
      },
    } as any;
  }
}
