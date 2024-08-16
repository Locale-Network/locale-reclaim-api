import { Reason } from "@/constants/reason.enum";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import { NextResponse } from "next/server";

interface SignInBody {
  providerId: string;
  account: string;
  deeplink_url: string;
  reason: Reason;
}

export async function POST(request: Request) {
  const {
    providerId,
    account,
    deeplink_url: deepLinkUrl,
    reason,
  } = (await request.json()) as SignInBody;

  const appSecret = process.env.SECRET_ID;
  const appId = process.env.APP_ID;
  const callbackUrl = process.env.RECLAIM_CALLBACK_URL;
  if (!appSecret || !appId || !callbackUrl) {
    return NextResponse.json(
      { message: "missing configuration" },
      { status: 500 }
    );
  }

  const reclaimClient = new Reclaim.ProofRequest(appId);

  if (providerId) {
    await reclaimClient.buildProofRequest(providerId);

    if (deepLinkUrl) {
      reclaimClient.setAppCallbackUrl(deepLinkUrl);
    }

    reclaimClient.setAppCallbackUrl(callbackUrl);

    reclaimClient.setSignature(
      await reclaimClient.generateSignature(appSecret)
    );

    if (account) {
      let message = "";
      switch (reason) {
        case Reason.AccountVerification:
          message = "for account verification ";
          break;
        default:
          return NextResponse.json(
            { message: "reason not found" },
            { status: 400 }
          );
      }
      message += `${account} ${Date.now().toString()}`;
      reclaimClient.addContext(account, message);
    }

    const { requestUrl: signedUrl } =
      await reclaimClient.createVerificationRequest();

    return NextResponse.json({
      name: "response",
      error: false,
      data: {
        signedUrl,
      },
    });
  }
}
