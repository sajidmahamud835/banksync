# BankSync

BankSync is a financial technology application that allows users to link their bank accounts, view transactions, and manage their finances. It leverages Plaid for bank data synchronization and Appwrite for backend services.

## Tech Stack

*   **Frontend/Backend Framework:** Next.js (Node.js)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Database & Auth:** Appwrite
*   **Bank Integration:** Plaid API
*   **Payments:** Dwolla API

## Security & Secrets

**WARNING:** Never commit your `.env` file to version control. This application handles sensitive financial data.

The application uses the following environment variables:

*   **Appwrite:** Endpoint, Project ID, Database ID, Collection IDs, API Key.
*   **Plaid:** Client ID, Secret, Environment (sandbox/production).
*   **Dwolla:** Key, Secret, Base URL, Environment.
*   **Sentry:** DSN, Auth Token (for monitoring).

## Setup Instructions

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:**
    *   Copy `.env.example` to `.env`.
    *   Fill in the required values.
    *   For **Plaid**, get your keys from the Plaid Dashboard.
    *   For **Appwrite**, set up a project and update the IDs. You can use the provided `setupAttributes.ts` script to initialize collections (ensure you have the Appwrite CLI or credentials set up).
4.  **Run the application:**
    ```bash
    npm run dev
    ```

## Mock Mode

For development and testing without real banking credentials, you can run the application in **Mock Mode**. This bypasses the actual Plaid API calls and returns dummy data.

To enable Mock Mode, set the `MOCK_MODE` environment variable to `true`.

```bash
MOCK_MODE=true npm run dev
```

In Mock Mode:
*   Link Token creation returns a mock token.
*   Public Token exchange returns a mock access token.
*   Account fetching returns a dummy "Mock Checking" account.
*   Transaction syncing returns dummy transactions.

This allows you to test the UI flows and application logic without connecting to a real bank.

## Project Structure

*   `app/`: Next.js App Router pages and layouts.
*   `components/`: Reusable UI components.
*   `lib/`: Utility functions, Appwrite client, Plaid client, and Server Actions.
    *   `lib/actions/`: Server Actions for User, Bank, and Transaction logic.
*   `public/`: Static assets.
*   `types/`: TypeScript type definitions.

## License

MIT
