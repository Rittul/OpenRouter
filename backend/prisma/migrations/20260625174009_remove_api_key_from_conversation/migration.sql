/*
  Warnings:

  - You are about to drop the column `api_key_id` on the `Conversation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_api_key_id_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "api_key_id";
