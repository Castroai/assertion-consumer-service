import { Test, TestingModule } from '@nestjs/testing';
import { ScimService } from './scim.service';

describe('ScimService', () => {
  let service: ScimService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScimService],
    }).compile();

    service = module.get<ScimService>(ScimService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
