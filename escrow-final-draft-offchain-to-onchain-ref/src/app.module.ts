import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { BlockerController } from './blocker/blocker.controller';

@Module({
  imports: [],
  controllers: [AppController, BlockerController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
