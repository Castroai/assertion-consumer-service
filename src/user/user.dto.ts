import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserReponseDto implements User {
  @ApiProperty()
  active: boolean;
  @ApiProperty()
  companyId: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  email: string;
  @ApiProperty()
  externalId: string;
  @ApiProperty()
  emailVerified: Date;
  @ApiProperty()
  id: string;
  @ApiProperty()
  image: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  onboardingComplete: boolean;
  @ApiProperty()
  orgId: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  teamId: number;
  @ApiProperty()
  updatedAt: Date;
}
