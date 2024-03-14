import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: process.env.ALLOWED_ORIGIN, // Adjust this to your client's origin
  });

  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Median API description')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const port = process.env.PORT || 80;

  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: 'top secret',
      cookie: {
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 365, //31536000000
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(port);
}
bootstrap();
