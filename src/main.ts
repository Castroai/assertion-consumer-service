import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';
import { User } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
const prisma = new PrismaService();
interface IUser {
  id: number;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: '*', // Adjust this to your client's origin
  });

  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Median API description')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const port = process.env.PORT || 80;
  passport.serializeUser(async (user: IUser, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    const user: User = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    done(null, user);
  });
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: 'top secret',
      cookie: {
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 365,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(port);
}
bootstrap();
