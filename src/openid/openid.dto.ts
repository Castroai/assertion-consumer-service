// OpenIdDTOs.ts
import { ApiProperty } from '@nestjs/swagger';
// import { IsInt, IsPositive } from 'class-validator';

export interface CheckRequest {
  username: string;
}

export interface CheckResponse {
  orgId: string | null;
}

export class CheckRequestDto implements CheckRequest {
  @ApiProperty({
    description: 'The username to check',
    example: 'john_doe@example.com',
  })
  username: string;
}
export class CheckResponseDto implements CheckResponse {
  @ApiProperty({
    description:
      'The ID of the organization if the username belongs to any, otherwise null',
  })
  orgId: string | null;
}

export class StartRequestDto {
  @ApiProperty()
  id: string;
}

export class CallbackRequestDto {
  @ApiProperty()
  id: string;
}
