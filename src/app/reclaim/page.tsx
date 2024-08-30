import { Reason } from "@/constants/reason.enum";
import { Reclaim } from "@reclaimprotocol/js-sdk";

import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import VerificationStatus from "@/containers/VerificationStatus/VerificationStatus";
import { Skeleton } from "@/components/ui/skeleton";

interface ReclaimPageProps {
  searchParams: {
    account: string;
  };
}

const VerificationStatusComponent = async ({
  account,
}: {
  account: string;
}) => {
  const appSecret = process.env.SECRET_ID;
  const appId = process.env.APP_ID;
  const callbackUrl = process.env.RECLAIM_CALLBACK_URL;
  const providerId = process.env.RECLAIM_PROVIDER_ID;
  if (!appSecret || !appId || !callbackUrl || !providerId) {
    throw new Error("Missing configuration");
  }

  const reclaimClient = new Reclaim.ProofRequest(appId);

  await reclaimClient.buildProofRequest(providerId);

  reclaimClient.setAppCallbackUrl(callbackUrl);

  reclaimClient.setSignature(await reclaimClient.generateSignature(appSecret));

  const message = `for account verification ${account} ${Date.now().toString()}`;
  reclaimClient.addContext(account, message);

  const { requestUrl: signedUrl, statusUrl } =
    await reclaimClient.createVerificationRequest();

  return <VerificationStatus signedUrl={signedUrl} statusUrl={statusUrl} />;
};

export default async function ReclaimPage({ searchParams }: ReclaimPageProps) {
  const { account } = searchParams;

  if (!account) {
    return <div>No account provided</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Suspense
        fallback={
          <>
            <div className="mb-4">
              <Skeleton className="w-[256px] h-[256px]" />
            </div>
            <Button disabled>
              <span className="mr-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              Verifying...
            </Button>
            <div className="mt-4">
              <Skeleton className="w-[160px] h-[20px]" />
            </div>
            <div>
              <Skeleton className="w-[20px] h-[20px]" />
            </div>
          </>
        }
      >
        <VerificationStatusComponent account={account} />
      </Suspense>
    </div>
  );
}
