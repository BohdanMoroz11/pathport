import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { DestinationRoutesController, RoutesController } from "./routes.controller";
import { RoutesService } from "./routes.service";

@Module({
  imports: [DatabaseModule],
  controllers: [DestinationRoutesController, RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
