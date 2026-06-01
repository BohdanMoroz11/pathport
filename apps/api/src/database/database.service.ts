import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { getRequiredEnv } from "@pathport/config";
import type { DatabaseClient } from "@pathport/db";
import { assertDatabaseReady, createDatabaseClient, createDatabasePool } from "@pathport/db";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool = createDatabasePool(getRequiredEnv("DATABASE_URL"));

  readonly client: DatabaseClient = createDatabaseClient(this.pool);

  async assertReady() {
    await assertDatabaseReady(this.pool);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
