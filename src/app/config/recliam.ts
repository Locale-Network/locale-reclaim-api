// Package import
import { Reclaim } from "@reclaimprotocol/js-sdk";

const appId = process.env.APP_ID as string;

const providerId = process.env.PROVIDER_ID as string;
const appSecret = process.env.SECRET_ID as string;

const reclaimClient = new Reclaim.ProofRequest(appId, {sessionId: undefined});

export const getVerificationReq = async (address: string) => {
  await reclaimClient.addContext(address, `address`);

  const proof = await reclaimClient.buildProofRequest(providerId);
  reclaimClient.setSignature(await reclaimClient.generateSignature(appSecret));

  const {requestUrl, statusUrl} =
    await reclaimClient.createVerificationRequest();

  return {requestUrl, statusUrl, proof};
};
