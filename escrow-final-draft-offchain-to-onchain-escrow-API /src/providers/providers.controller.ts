import { Controller, Post, Body, Param } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from '../dto/create-provider.dto';
import { Provider } from '@prisma/client';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  createProvider(@Body() createProviderDto: CreateProviderDto): Promise<Provider> {
    return this.providersService.createProvider(createProviderDto);
  }
}
