'use server';

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";

import { plaidClient } from '@/lib/plaid';
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    console.log("Fetching user info for:", userId);
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );

    console.log("User info retrieved:", user.documents[0]);
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error("Error in getUserInfo:", error);
  }
}

export const signIn = async ({ email, password }: signInProps) => {
  try {
    console.log("Signing in user:", email);
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    console.log("Session created for user:", session.userId);
    const user = await getUserInfo({ userId: session.userId });

    console.log("Signed in user info:", user);
    return parseStringify(user);
  } catch (error) {
    console.error("Error in signIn:", error);
  }
}

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  const { email, firstName, lastName } = userData;
  let newUserAccount;

  try {
    console.log("Creating new user account for:", email);
    const { account, database } = await createAdminClient();

    newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    if (!newUserAccount) throw new Error("Error creating user");
    console.log("User account created:", newUserAccount.$id);

    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type: "personal",
    });

    if (!dwollaCustomerUrl) throw new Error("Error creating Dwolla customer");
    console.log("Dwolla customer created:", dwollaCustomerUrl);

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...userData,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl,
      }
    );

    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });

    console.log("User signed up and session created:", newUser);
    return parseStringify(newUser);
  } catch (error) {
    console.error("Error in signUp:", error);
  }
}

export async function getLoggedInUser() {
  try {
    console.log("Fetching logged-in user");
    const { account } = await createSessionClient();
    const result = await account.get();

    const user = await getUserInfo({ userId: result.$id });

    console.log("Logged-in user info:", user);
    return parseStringify(user);
  } catch (error) {
    console.error("Error in getLoggedInUser:", error);
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    console.log("Logging out user");
    const { account } = await createSessionClient();

    cookies().delete("appwrite-session");

    await account.deleteSession("current");
    console.log("User logged out");
  } catch (error) {
    console.error("Error in logoutAccount:", error);
    return null;
  }
}

export const createLinkToken = async (user: User) => {
  try {
    console.log("Creating link token for user:", user.$id);
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ["auth"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);

    console.log("Link token created:", response.data.link_token);
    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.error("Error in createLinkToken:", error);
  }
}

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  shareableId,
}: createBankAccountProps) => {
  try {
    console.log("Creating bank account for user:", userId);
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        shareableId,
      }
    );

    console.log("Bank account created:", bankAccount);
    return parseStringify(bankAccount);
  } catch (error) {
    console.error("Error in createBankAccount:", error);
  }
}

export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    console.log("Exchanging public token for user:", user.$id);
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    console.log("Access token and item ID retrieved:", accessToken, itemId);

    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];
    console.log("Bank account data retrieved:", accountData);

    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

    console.log("Processor token created:", processorToken);

    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    if (!fundingSourceUrl) throw new Error("Funding source URL creation failed");

    console.log("Funding source URL created:", fundingSourceUrl);

    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      shareableId: encryptId(accountData.account_id),
    });

    revalidatePath("/");

    console.log("Public token exchange completed");
    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (error) {
    console.error("Error in exchangePublicToken:", error);
  }
}

export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    console.log("Fetching banks for user:", userId);
    const { database } = await createAdminClient();

    const banks = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    console.log("Banks retrieved:", banks.documents);
    return parseStringify(banks.documents);
  } catch (error) {
    console.error("Error in getBanks:", error);
  }
}

export const getBank = async ({ documentId }: getBankProps) => {
  try {
    console.log("Fetching bank by document ID:", documentId);
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal("$id", [documentId])]
    );

    console.log("Bank retrieved:", bank.documents[0]);
    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.error("Error in getBank:", error);
  }
}

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
  try {
    console.log("Fetching bank by account ID:", accountId);
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal("accountId", [accountId])]
    );

    if (bank.total !== 1) return null;

    console.log("Bank retrieved by account ID:", bank.documents[0]);
    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.error("Error in getBankByAccountId:", error);
  }
}

// Add these new functions to the existing file

export const createWeb3Account = async ({ userId, address }: { userId: string; address: string }) => {
  try {
    const web3Account = await database.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_WEB3_ACCOUNT_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        address,
      }
    );
    return parseStringify(web3Account);
  } catch (error) {
    console.error("An error occurred while creating Web3 account:", error);
  }
};

export const getWeb3AccountsByUserId = async ({ userId }: { userId: string }) => {
  try {
    const web3Accounts = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_WEB3_ACCOUNT_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );
    return parseStringify(web3Accounts.documents);
  } catch (error) {
    console.error("An error occurred while getting Web3 accounts:", error);
  }
};
