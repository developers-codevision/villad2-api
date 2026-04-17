import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IpvService } from './ipv.service';
import { CreateIpvDto } from './dto/create-ipv.dto';
import { UpdateIpvDto } from './dto/update-ipv.dto';

@Controller('ipv')
export class IpvController {
  constructor(private readonly ipvService: IpvService) {}

  @Post()
  create(@Body() createIpvDto: CreateIpvDto) {
    return this.ipvService.create(createIpvDto);
  }

  @Get()
  findAll() {
    return this.ipvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ipvService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIpvDto: UpdateIpvDto) {
    return this.ipvService.update(+id, updateIpvDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ipvService.remove(+id);
  }
}
