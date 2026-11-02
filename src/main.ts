import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow requests from the React frontend
  app.enableCors({
    origin: "http://localhost:5173",
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
