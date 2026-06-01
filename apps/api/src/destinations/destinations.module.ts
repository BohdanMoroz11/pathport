import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { DestinationsController } from "./destinations.controller";
import { DestinationsService } from "./destinations.service";

@Module({
  imports: [DatabaseModule],
  controllers: [DestinationsController],
  providers: [DestinationsService],
})
export class DestinationsModule {}
