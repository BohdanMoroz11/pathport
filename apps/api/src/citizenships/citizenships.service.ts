import { Inject, Injectable } from "@nestjs/common";
import type { Citizenship } from "@pathport/contracts";
import { citizenships } from "@pathport/db";
import { asc } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class CitizenshipsService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  /** Every citizenship the explorer can start from, alphabetical by name. */
  async list(): Promise<Citizenship[]> {
    return this.database.client
      .select({ code: citizenships.code, name: citizenships.name, flag: citizenships.flag })
      .from(citizenships)
      .orderBy(asc(citizenships.name));
  }
}
