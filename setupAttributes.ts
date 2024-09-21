const sdk = require('node-appwrite');
const dotenv = require('dotenv');

dotenv.config();

const client = new sdk.Client();
const database = new sdk.Databases(client);

// Initialize the Appwrite client
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT as string)
    .setKey(process.env.NEXT_APPWRITE_KEY as string);

// Define attribute types
type Attribute = {
    key: string;
    type: 'string' | 'email' | 'float' | 'boolean' | 'integer';
    size?: number;
    required?: boolean;
};

// Define the collections and their attributes with required fields
const collections: Record<string, Attribute[]> = {
    APPWRITE_USER_COLLECTION_ID: [
        { key: 'userId', type: 'string', size: 2000, required: true },
        { key: 'firstName', type: 'string', size: 100, required: true },
        { key: 'lastName', type: 'string', size: 100, required: true },
        { key: 'dateOfBirth', type: 'string', size: 100, required: true },
        { key: 'email', type: 'email', size: 255, required: true },
        { key: 'address1', type: 'string', size: 100, required: true },
        { key: 'city', type: 'string', size: 100, required: true },
        { key: 'state', type: 'string', size: 100, required: true },
        { key: 'postalCode', type: 'string', size: 10, required: true },
        { key: 'ssn', type: 'string', size: 100, required: true },
        { key: 'dwollaCustomerUrl', type: 'string', size: 2000, required: true },
        { key: 'dwollaCustomerId', type: 'string', size: 2000, required: true },
    ],

    APPWRITE_BANK_COLLECTION_ID: [
        { key: 'bankId', type: 'string', size: 2000, required: true },
        { key: 'accountId', type: 'string', size: 2000, required: true },
        { key: 'accessToken', type: 'string', size: 2000, required: true },
        { key: 'fundingSourceUrl', type: 'string', size: 2000, required: true },
        { key: 'userId', type: 'string', size: 2000, required: true },
        { key: 'shareableId', type: 'string', size: 2000, required: true },
    ],

    APPWRITE_TRANSACTION_COLLECTION_ID: [
        { key: 'id', type: 'string', size: 2000, required: true },
        { key: 'type', type: 'string', size: 255, required: true },
        { key: 'date', type: 'string', size: 255, required: true },
        { key: 'image', type: 'string', size: 255, required: true },
        { key: 'pending', type: 'string', size: 255, required: true },
        { key: 'paymentChannel', type: 'string', size: 255, required: true },
        { key: 'accountId', type: 'string', size: 255, required: true },
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'amount', type: 'string', size: 255, required: true },
        { key: 'category', type: 'string', size: 255, required: true },
        { key: 'channel', type: 'string', size: 255, required: true },
        { key: 'senderId', type: 'string', size: 2000, required: true },
        { key: 'senderBankId', type: 'string', size: 2000, required: true },
        { key: 'receiverId', type: 'string', size: 2000, required: true },
        { key: 'receiverBankId', type: 'string', size: 2000, required: true },
        { key: 'email', type: 'string', size: 255, required: true }
    ],
};

// Function to create an attribute if it doesn't exist
async function createMissingAttributes(collectionId: string, attributes: Attribute[]) {
    try {
        // Fetch the list of existing attributes
        const collection = await database.getCollection(process.env.APPWRITE_DATABASE_ID as string, collectionId);
        const existingAttributes = collection.attributes.map((attr: { key: string }) => attr.key);

        // Loop through each attribute and create it if missing
        for (const attr of attributes) {
            if (!existingAttributes.includes(attr.key)) {
                switch (attr.type) {
                    case 'string':
                        await database.createStringAttribute(
                            process.env.APPWRITE_DATABASE_ID as string,
                            collectionId,
                            attr.key,
                            attr.size!,
                            attr.required || false
                        );
                        break;
                    case 'email':
                        await database.createEmailAttribute(
                            process.env.APPWRITE_DATABASE_ID as string,
                            collectionId,
                            attr.key,
                            attr.required || false
                        );
                        break;
                    case 'float':
                        await database.createFloatAttribute(
                            process.env.APPWRITE_DATABASE_ID as string,
                            collectionId,
                            attr.key,
                            attr.required || false
                        );
                        break;
                    case 'boolean':
                        await database.createBooleanAttribute(
                            process.env.APPWRITE_DATABASE_ID as string,
                            collectionId,
                            attr.key,
                            attr.required || false
                        );
                        break;
                    case 'integer':
                        await database.createIntegerAttribute(
                            process.env.APPWRITE_DATABASE_ID as string,
                            collectionId,
                            attr.key,
                            attr.required || false
                        );
                        break;
                    default:
                        console.log(`Unknown attribute type: ${attr.type}`);
                }
                console.log(`Created attribute: ${attr.key} in collection: ${collectionId}`);
            } else {
                console.log(`Attribute ${attr.key} already exists in collection: ${collectionId}`);
            }
        }
    } catch (error) {
        console.error(`Error while creating attributes for collection ${collectionId}:`, error);
    }
}

// Loop through collections and their attributes
async function createAttributesForAllCollections() {
    for (const [collectionId, attributes] of Object.entries(collections)) {
        await createMissingAttributes(process.env[collectionId] as string, attributes);
    }
}

// Call the function
createAttributesForAllCollections();
