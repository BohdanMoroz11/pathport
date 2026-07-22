import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { WriteModule } from "../write/write.module";
import { IngestionController } from "./ingestion.controller";
import { IngestionService } from "./ingestion.service";

@Module({
  imports: [DatabaseModule, WriteModule],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}
