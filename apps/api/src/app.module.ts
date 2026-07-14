import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CitizenshipsModule } from "./citizenships/citizenships.module";
import { DatabaseModule } from "./database/database.module";
import { DestinationsModule } from "./destinations/destinations.module";
import { HealthModule } from "./health/health.module";
import { RoutesModule } from "./routes/routes.module";
import { WriteModule } from "./write/write.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", "../../.env"],
      isGlobal: true,
    }),
    DatabaseModule,
    HealthModule,
    CitizenshipsModule,
    DestinationsModule,
    RoutesModule,
    WriteModule,
  ],
})
export class AppModule {}
