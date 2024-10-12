import { PrismaClient } from "@prisma/client";
import { verifyProof } from "@reclaimprotocol/js-sdk";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const proof = await req.json();

  console.log("proof", proof);

  const isProofVerified = await verifyProof(proof);
  if (!isProofVerified) {
    return NextResponse.json(
      {
        message: "Proof verification failed",
      },
      { status: 400 }
    );
  }

  const context = proof.claimData.context;
  const extractedParameterValues = proof.extractedParameterValues;

  console.log("ctx", context);
  console.log("extractedParameterValues", extractedParameterValues);

  await prisma.proof.create({
    data: {
      address: "0x",
      proof: JSON.stringify(proof),
      context: JSON.stringify(context),
    },
  });

  await sql`
    INSERT INTO proofs (proof, context)
    VALUES (${JSON.stringify(proof)}, ${JSON.stringify(context)})
  `;

  return NextResponse.json(
    {
      message: "Proof verified",
    },
    { status: 200 }
  );
}
