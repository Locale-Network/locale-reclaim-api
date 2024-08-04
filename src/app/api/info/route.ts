
import { authManager } from "@/app/utils/authManagerInstance";
import { PLAID_PRODUCTS } from "@/app/utils/plaid";
import { NextResponse } from "next/server";

let ITEM_ID: string | null = null;

export async function POST() {
  const access_token = authManager.getAccessToken();
  try {
    return NextResponse.json(
      {
        item_id: ITEM_ID,
        access_token,
        products: PLAID_PRODUCTS,
      },
      {status: 200}
    );
  } catch (error) {
    return NextResponse.json({
      status: 500,
    });
  }
}
