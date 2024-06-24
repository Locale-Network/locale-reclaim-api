-- CreateTable
CREATE TABLE "proofs" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proof" JSONB NOT NULL,
    "context" JSONB NOT NULL,

    CONSTRAINT "proofs_pkey" PRIMARY KEY ("id")
);
