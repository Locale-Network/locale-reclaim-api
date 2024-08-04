import { authManager } from "@/app/utils/authManagerInstance";
import client, { formatError } from "@/app/utils/plaid";
import { PrismaClient } from "@prisma/client";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const access_token = authManager.getAccessToken();
    const accountsResponse = await client.accountsGet({
      access_token,
    });

    const selectedAccount = accountsResponse.data.accounts[0];

    await sql`
      INSERT INTO accounts (account_id, name, official_name)
      VALUES (${selectedAccount.account_id}, ${selectedAccount.name}, ${selectedAccount.official_name})
    `;

    return NextResponse.json(selectedAccount, {status: 200});
  } catch (error) {
    return NextResponse.json(formatError(error?.response), {status: 500});
  }
}
