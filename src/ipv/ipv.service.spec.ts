import { Test, TestingModule } from '@nestjs/testing';
import { IpvService } from './ipv.service';

describe('IpvService', () => {
  let service: IpvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IpvService],
    }).compile();

    service = module.get<IpvService>(IpvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
