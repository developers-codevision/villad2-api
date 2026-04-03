import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { FindClientsDto } from './dto/find-clients.dto';
import { Client } from './entities/client.entity';

@ApiTags('Reservas - Clientes')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los clientes con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiQuery({ name: 'idNumber', required: false, type: String, description: 'Filtrar por número de identificación' })
  @ApiQuery({ name: 'firstName', required: false, type: String, description: 'Filtrar por nombre' })
  @ApiQuery({ name: 'lastName', required: false, type: String, description: 'Filtrar por apellido' })
  @ApiQuery({ name: 'email', required: false, type: String, description: 'Filtrar por correo electrónico' })
  @ApiQuery({ name: 'phone', required: false, type: String, description: 'Filtrar por teléfono' })
  findAll(@Query() findClientsDto: FindClientsDto) {
    return this.clientsService.findAll(findClientsDto);
  }

  @Get(':idNumber')
  @ApiOperation({ summary: 'Obtener cliente por número de identificación' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado', type: Client })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findOne(@Param('idNumber') idNumber: string) {
    return this.clientsService.findOne(idNumber);
  }
}
