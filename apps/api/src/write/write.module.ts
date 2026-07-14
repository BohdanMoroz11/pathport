import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { WriteController } from "./write.controller";
import { WriteService } from "./write.service";

@Module({
  imports: [DatabaseModule],
  controllers: [WriteController],
  providers: [WriteService],
  exports: [WriteService],
})
export class WriteModule {}
