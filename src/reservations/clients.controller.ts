import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { FindClientsDto } from './dto/find-clients.dto';
import { Client } from './entities/client.entity';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all clients with optional filters' })
  @ApiResponse({ status: 200, description: 'List of clients' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'idNumber',
    required: false,
    type: String,
    description: 'Filter by ID number (DNI/passport)',
  })
  @ApiQuery({
    name: 'firstName',
    required: false,
    type: String,
    description: 'Filter by first name',
  })
  @ApiQuery({
    name: 'lastName',
    required: false,
    type: String,
    description: 'Filter by last name',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Filter by email',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    type: String,
    description: 'Filter by phone',
  })
  findAll(@Query() findClientsDto: FindClientsDto) {
    return this.clientsService.findAll(findClientsDto);
  }

  @Get(':idNumber')
  @ApiOperation({ summary: 'Get a client by ID number (CI/passport)' })
  @ApiResponse({ status: 200, description: 'Client found', type: Client })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('idNumber') idNumber: string) {
    return this.clientsService.findOne(idNumber);
  }
}
