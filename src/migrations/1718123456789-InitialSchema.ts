import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1718123456789 implements MigrationInterface {
    name = 'InitialSchema1718123456789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create categories table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "categories" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "icon" varchar NOT NULL,
                "color" varchar,
                "description" varchar
            )
        `);

        // Insert default categories
        await queryRunner.query(`
            INSERT INTO "categories" ("id", "name", "icon", "color", "description") VALUES
            ('physical', 'Fysisk Helse', '💪', '#FF6B6B', 'Forbedre din fysiske form, styrke og utholdenhet'),
            ('mental', 'Mental Styrke', '🧠', '#4ECDC4', 'Utvikle mental klarhet, fokus og emosjonell balanse'),
            ('career', 'Karriere', '💼', '#45B7D1', 'Bygg ferdigheter og oppnå profesjonelle mål'),
            ('social', 'Sosiale Ferdigheter', '👥', '#96CEB4', 'Styrk relasjoner og kommunikasjonsevner'),
            ('creative', 'Kreativitet', '🎨', '#BB8FCE', 'Utforsk og utvikle dine kreative evner'),
            ('learning', 'Læring', '📚', '#85C1E2', 'Tilegn deg ny kunnskap og ferdigheter')
            ON CONFLICT DO NOTHING
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" varchar NOT NULL UNIQUE,
                "passwordHash" varchar NOT NULL,
                "name" varchar NOT NULL,
                "metadata" jsonb DEFAULT '{}',
                "createdAt" TIMESTAMP DEFAULT now(),
                "updatedAt" TIMESTAMP DEFAULT now()
            )
        `);

        // Create activities table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "activities" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                "categoryId" varchar NOT NULL REFERENCES "categories"("id"),
                "name" varchar NOT NULL,
                "description" text,
                "duration" integer,
                "points" integer NOT NULL DEFAULT 0,
                "completedAt" TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT now()
            )
        `);

        // Create user_progress table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_progress" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                "categoryId" varchar NOT NULL REFERENCES "categories"("id"),
                "totalPoints" integer NOT NULL DEFAULT 0,
                "level" integer NOT NULL DEFAULT 1,
                "stats" jsonb DEFAULT '{}',
                "updatedAt" TIMESTAMP DEFAULT now(),
                UNIQUE("userId", "categoryId")
            )
        `);

        // Create friends table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "friends" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                "friendId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                "status" varchar NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP DEFAULT now()
            )
        `);

        // Create challenges table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "challenges" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" varchar NOT NULL,
                "description" text,
                "icon" varchar,
                "categoryId" varchar NOT NULL REFERENCES "categories"("id"),
                "targetValue" integer NOT NULL,
                "targetType" varchar NOT NULL,
                "reward" integer NOT NULL DEFAULT 0,
                "startDate" TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP NOT NULL,
                "isActive" boolean DEFAULT true,
                "createdAt" TIMESTAMP DEFAULT now()
            )
        `);

        // Create challenge_participants junction table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "challenge_participants" (
                "challengeId" uuid NOT NULL REFERENCES "challenges"("id") ON DELETE CASCADE,
                "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
                PRIMARY KEY ("challengeId", "userId")
            )
        `);

        // Create indexes for performance
        await queryRunner.query(`CREATE INDEX "IDX_activities_userId" ON "activities" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_activities_categoryId" ON "activities" ("categoryId")`);
        await queryRunner.query(`CREATE INDEX "IDX_activities_completedAt" ON "activities" ("completedAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_progress_userId" ON "user_progress" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_friends_userId" ON "friends" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_friends_friendId" ON "friends" ("friendId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_friends_friendId"`);
        await queryRunner.query(`DROP INDEX "IDX_friends_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_user_progress_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_activities_completedAt"`);
        await queryRunner.query(`DROP INDEX "IDX_activities_categoryId"`);
        await queryRunner.query(`DROP INDEX "IDX_activities_userId"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "challenge_participants"`);
        await queryRunner.query(`DROP TABLE "challenges"`);
        await queryRunner.query(`DROP TABLE "friends"`);
        await queryRunner.query(`DROP TABLE "user_progress"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }
}