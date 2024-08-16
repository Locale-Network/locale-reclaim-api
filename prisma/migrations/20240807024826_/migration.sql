-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "account_id" VARCHAR(255),
    "name" VARCHAR(255),
    "official_name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "transaction_id" VARCHAR(255),
    "account_id" VARCHAR(255),
    "amount" DOUBLE PRECISION,
    "currency" VARCHAR(255),
    "merchant" VARCHAR(255),
    "merchant_id" VARCHAR(255),
    "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
