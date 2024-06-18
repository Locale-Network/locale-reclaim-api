import { Reclaim } from "@reclaimprotocol/js-sdk";
import { sql } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const proof = JSON.parse(decodeURIComponent(req.body));

  const isProofVerified = await Reclaim.verifySignedProof(proof);
  if (!isProofVerified) {
    return res.status(400).send({message: "Proof verification failed"});
  }

  const context = proof.claimData.context;
  const extractedParameterValues = proof.extractedParameterValues;

  await sql`
    INSERT INTO proofs (proof, context)
    VALUES (${JSON.stringify(proof)}, ${JSON.stringify(context)})
  `;

  return NextResponse.json(
    {
      message: "Proof verified",
    },
    {status: 200}
  );
}
