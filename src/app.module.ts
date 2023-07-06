import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { UsersController } from './users/users.controller';
import { ProjectsController } from './projects/projects.controller';
import { ProvidersController } from './providers/providers.controller';
import { UsersService } from './users/users.service';
import { ProjectsService } from './projects/projects.service';
import { ProvidersService } from './providers/providers.service';
import { MilestonesService } from './milestones/milestones.service';
import { MilestonesController } from './milestones/milestones.controller';


@Module({
  imports: [],
  controllers: [AppController,UsersController,ProjectsController,ProvidersController,MilestonesController],
  providers: [AppService, PrismaService,UsersService,ProjectsService,ProvidersService,MilestonesService],
})
export class AppModule {}
