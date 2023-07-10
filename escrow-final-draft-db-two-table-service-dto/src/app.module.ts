import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PurchaserController } from './purchaser/purchaser.controller';
import { PurchaserService } from './purchaser/purchaser.service';


@Module({
  imports: [],
  controllers: [AppController, PurchaserController],
  providers: [AppService, PrismaService,PurchaserService],
})
export class AppModule {}
