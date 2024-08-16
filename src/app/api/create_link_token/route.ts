import client, {
  PLAID_ANDROID_PACKAGE_NAME,
  PLAID_COUNTRY_CODES,
  PLAID_PRODUCTS,
  PLAID_REDIRECT_URI,
} from "@/utils/plaid";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const configs: any = {
      user: {client_user_id: "user-id"},
      client_name: "Plaid Quickstart",
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: "en",
    };

    if (PLAID_REDIRECT_URI !== "") {
      configs.redirect_uri = PLAID_REDIRECT_URI;
    }

    if (PLAID_ANDROID_PACKAGE_NAME !== "") {
      configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
    }

    if (PLAID_PRODUCTS.includes("statements")) {
      const statementConfig = {
        end_date: moment().format("YYYY-MM-DD"),
        start_date: moment().subtract(30, "days").format("YYYY-MM-DD"),
      };
      configs.statements = statementConfig;
    }

    const createTokenResponse = await client.linkTokenCreate(configs);
    return NextResponse.json(createTokenResponse.data, {status: 200});
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.response,
      },
      {status: error?.response?.status}
    );
  }
}
