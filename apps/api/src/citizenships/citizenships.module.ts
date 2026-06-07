import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CitizenshipsController } from "./citizenships.controller";
import { CitizenshipsService } from "./citizenships.service";

@Module({
  imports: [DatabaseModule],
  controllers: [CitizenshipsController],
  providers: [CitizenshipsService],
})
export class CitizenshipsModule {}
