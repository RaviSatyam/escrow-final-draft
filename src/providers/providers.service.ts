import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from '../dto/create-provider.dto';
import { Provider } from '@prisma/client';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async createProvider(createProviderDto: CreateProviderDto): Promise<Provider> {
    return this.prisma.provider.create({ data: createProviderDto });
  }
}



