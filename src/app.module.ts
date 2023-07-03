import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PurchaserController } from './purchaser/purchaser.controller';


@Module({
  imports: [],
  controllers: [AppController, PurchaserController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
