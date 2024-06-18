import { Reason } from "@/app/constants/reason.enum";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestData = await request.formData();
  const providerId = requestData.get("providerId") as string | null;
  const account = requestData.get("account") as string | null;
  const deepLinkUrl = requestData.get("deeplink_url") as string | null;
  const reason = requestData.get("reason") as Reason | null;

  const appSecret = process.env.SECRET_ID as string;
  const appId = process.env.APP_ID as string;

  const reclaimClient = new Reclaim.ProofRequest(appId);

  if (providerId) {
    await reclaimClient.buildProofRequest(providerId);

    if (deepLinkUrl) {
      reclaimClient.setAppCallbackUrl(deepLinkUrl);
    }

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
            {message: "reason not found"},
            {status: 400}
          );
      }
      message += `${account} ${Date.now().toString()}`;
      reclaimClient.addContext(account, message);
    }

    const {requestUrl: signedUrl} =
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
