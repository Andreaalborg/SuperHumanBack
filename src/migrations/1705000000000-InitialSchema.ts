import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1705000000000 implements MigrationInterface {
    name = 'InitialSchema1705000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create UUID extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "name" character varying,
                "avatar" character varying,
                "totalScore" integer NOT NULL DEFAULT '0',
                "level" integer NOT NULL DEFAULT '1',
                "streak" integer NOT NULL DEFAULT '0',
                "lastActiveAt" TIMESTAMP,
                "metadata" jsonb DEFAULT '{}',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        // Create activities table
        await queryRunner.query(`
            CREATE TABLE "activities" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "categoryId" character varying NOT NULL,
                "points" integer NOT NULL DEFAULT '0',
                "duration" integer,
                "completedAt" TIMESTAMP,
                "metadata" jsonb DEFAULT '{}',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id")
            )
        `);

        // Create user_progress table
        await queryRunner.query(`
            CREATE TABLE "user_progress" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "date" date NOT NULL,
                "categoryId" character varying NOT NULL,
                "points" integer NOT NULL DEFAULT '0',
                "activitiesCount" integer NOT NULL DEFAULT '0',
                "totalDuration" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e5f2a66c06d63bed6328e6df0b8" PRIMARY KEY ("id")
            )
        `);

        // Create friends table
        await queryRunner.query(`
            CREATE TABLE "friends" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "friendId" uuid NOT NULL,
                "status" character varying NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_65e1b06a9f379ee5255054021e1" PRIMARY KEY ("id")
            )
        `);

        // Create challenges table
        await queryRunner.query(`
            CREATE TABLE "challenges" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "creatorId" uuid NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "categoryId" character varying NOT NULL,
                "targetPoints" integer NOT NULL,
                "duration" integer NOT NULL,
                "startDate" TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP NOT NULL,
                "participants" jsonb DEFAULT '[]',
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_79d38e61b4582579ad8612c8072" PRIMARY KEY ("id")
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be3" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_f6bf6baa0fd876dd17a95b0a90" ON "activities" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_7f28b20e6e771b5cf8e377171e7" ON "activities" ("categoryId")`);
        await queryRunner.query(`CREATE INDEX "IDX_b3ffaad3aa3acd24a1db2c4c741" ON "user_progress" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_fd02fd42c64253e75b6d426ce88" ON "user_progress" ("date")`);
        await queryRunner.query(`CREATE INDEX "IDX_0a8cf56e152e2ac2e2ff0b26f87" ON "friends" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_3829b29a162b02798a2a31b9ee1" ON "friends" ("friendId")`);

        // Add foreign keys
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_f6bf6baa0fd876dd17a95b0a90" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_progress" ADD CONSTRAINT "FK_b3ffaad3aa3acd24a1db2c4c741" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friends" ADD CONSTRAINT "FK_0a8cf56e152e2ac2e2ff0b26f87" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friends" ADD CONSTRAINT "FK_3829b29a162b02798a2a31b9ee1" FOREIGN KEY ("friendId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "challenges" ADD CONSTRAINT "FK_65f3ba8b72f9e6c52a6f0c0c9e8" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE "challenges" DROP CONSTRAINT "FK_65f3ba8b72f9e6c52a6f0c0c9e8"`);
        await queryRunner.query(`ALTER TABLE "friends" DROP CONSTRAINT "FK_3829b29a162b02798a2a31b9ee1"`);
        await queryRunner.query(`ALTER TABLE "friends" DROP CONSTRAINT "FK_0a8cf56e152e2ac2e2ff0b26f87"`);
        await queryRunner.query(`ALTER TABLE "user_progress" DROP CONSTRAINT "FK_b3ffaad3aa3acd24a1db2c4c741"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_f6bf6baa0fd876dd17a95b0a90"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_3829b29a162b02798a2a31b9ee1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0a8cf56e152e2ac2e2ff0b26f87"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd02fd42c64253e75b6d426ce88"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3ffaad3aa3acd24a1db2c4c741"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f28b20e6e771b5cf8e377171e7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f6bf6baa0fd876dd17a95b0a90"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be3"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "challenges"`);
        await queryRunner.query(`DROP TABLE "friends"`);
        await queryRunner.query(`DROP TABLE "user_progress"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}