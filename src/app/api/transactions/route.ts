import { authManager } from "@/app/utils/authManagerInstance";
import { VercelClient } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { RemovedTransaction, Transaction, TransactionsSyncRequest } from "plaid";
import client from "../../utils/plaid";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(req:NextRequest, res: NextResponse) {
  try {
    let cursor = "";
    let added: Transaction[] = [];
    let modified: Transaction[] = [];
    let removed: RemovedTransaction[] = [];
    let hasMore = true;

    const access_token = authManager.getAccessToken();
    while (hasMore) {
      const requestPayload: TransactionsSyncRequest = {
        access_token,
        cursor,
      };

      const response = await client.transactionsSync(requestPayload);
      const data = response.data;

      cursor = data.next_cursor;
      if (cursor === "") {
        await sleep(2000);
        continue;
      }

      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      hasMore = data.has_more;
    }

    (async () => {
      try {
        await insertTransactions(added);
        await updateTransactions(modified);
        await markTransactionsAsDeleted(removed);
      } catch (error) {
        console.error(error);
      }
    })();

    return NextResponse.json(
      {latest_transactions: added},
      {status: 200}
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}

async function insertTransactions(transactions: Transaction[]) {
  const dbClient = new VercelClient();
  await dbClient.connect();

  try {
    await dbClient.query("BEGIN");
    const insertQuery = `
      INSERT INTO transactions (account_id, amount, currency, date, merchant, merchant_id, transaction_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (transaction_id, account_id) DO NOTHING
    `;
    for (const transaction of transactions) {
      await dbClient.query(insertQuery, [
        transaction.account_id,
        transaction.amount,
        transaction.iso_currency_code,
        transaction.datetime,
        transaction.merchant_name,
        transaction.merchant_entity_id,
        transaction.transaction_id,
      ]);
    }
    await dbClient.query("COMMIT");
  } catch (error) {
    await dbClient.query("ROLLBACK");
    throw error;
  } finally {
    await dbClient.end();
  }
}

async function updateTransactions(transactions: Transaction[]) {
  const dbClient = new VercelClient();
  await dbClient.connect();

  try {
    await dbClient.query("BEGIN");
    const updateQuery = `
      UPDATE transactions
      SET amount = $3, date = $4, currency = $5, merchant = $6
      WHERE transaction_id = $1 AND account_id = $2
    `;
    for (const transaction of transactions) {
      await dbClient.query(updateQuery, [
        transaction.transaction_id,
        transaction.account_id,
        transaction.amount,
        transaction.date,
        transaction.iso_currency_code,
        transaction.merchant_name,
      ]);
    }
    await dbClient.query("COMMIT");
  } catch (error) {
    await dbClient.query("ROLLBACK");
    throw error;
  } finally {
    await dbClient.end();
  }
}

async function markTransactionsAsDeleted(transactions: RemovedTransaction[]) {
  const dbClient = new VercelClient();
  await dbClient.connect();

  try {
    await dbClient.query("BEGIN");
    const deleteQuery = `
      UPDATE transactions
      SET is_deleted = true
      WHERE transaction_id = $1 AND account_id = $2
    `;
    for (const transaction of transactions) {
      await dbClient.query(deleteQuery, [
        transaction.transaction_id,
        transaction.account_id,
      ]);
    }
    await dbClient.query("COMMIT");
  } catch (error) {
    await dbClient.query("ROLLBACK");
    throw error;
  } finally {
    await dbClient.end();
  }
}
