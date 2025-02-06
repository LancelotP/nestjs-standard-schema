import { NestFactory } from "@nestjs/core";
import { StandardSchemaValidationPipe } from "nestjs-standard-schema";
import { AppModule } from "./app.module";

async function main() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  await app.listen(3000);
}

main();
