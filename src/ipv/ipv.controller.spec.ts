import { Test, TestingModule } from '@nestjs/testing';
import { IpvController } from './ipv.controller';
import { IpvService } from './ipv.service';

describe('IpvController', () => {
  let controller: IpvController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IpvController],
      providers: [IpvService],
    }).compile();

    controller = module.get<IpvController>(IpvController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
