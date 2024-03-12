import { Test, TestingModule } from '@nestjs/testing';
import { ScimController } from './scim.controller';
import { ScimService } from './scim.service';

describe('ScimController', () => {
  let controller: ScimController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScimController],
      providers: [ScimService],
    }).compile();

    controller = module.get<ScimController>(ScimController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
