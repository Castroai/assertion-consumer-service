import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Next,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as passport from 'passport';
import { User } from '@prisma/client';
import {
  CallbackRequestDto,
  CheckRequestDto,
  CheckResponseDto,
  StartRequestDto,
} from './openid.dto';
import { OpenIdService } from './openid.service';
import { UserService } from 'src/user/user.service';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UserReponseDto } from 'src/user/user.dto';
@ApiTags('OpenID')
@Controller('/openid')
export class OpenIdController {
  constructor(
    public readonly openIdService: OpenIdService,
    public readonly userService: UserService,
  ) {}
  @ApiOperation({ summary: 'Check if username belongs to any organization' })
  @ApiBody({ type: CheckRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Username checked successfully',
    type: CheckResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found for the provided username',
  })
  @Post('check')
  public async check(
    @Body() checkRequestParamaters: CheckRequestDto,
    @Res() res: Response,
  ) {
    const { username } = checkRequestParamaters;
    const orgId = await this.openIdService.check({ username });
    res.json(orgId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'number', description: 'Organization ID' })
  @ApiOperation({ summary: 'Redirects to authentication page' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid ID provided.',
  })
  @Get('/start/:id')
  public async start(
    @Param() params: StartRequestDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const org = await this.openIdService.orgFromId(params.id);
    if (!org) {
      return res.sendStatus(404);
    }
    const strategy = this.openIdService.createStrategy(org);
    if (!strategy) {
      return res.sendStatus(404);
    }
    passport.authenticate(strategy)(req, res, next);
  }

  @Get('/callback/:id')
  public async callback(
    @Param() param: CallbackRequestDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const org = await this.openIdService.orgFromId(param.id);
    if (!org) {
      return res.sendStatus(404);
    }

    const strategy = this.openIdService.createStrategy(org);
    if (!strategy) {
      return res.sendStatus(404);
    }
    passport.authenticate(strategy, {
      successRedirect: 'http://localhost:3000/',
    })(req, res, next);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sends back user object for logged in user',
    type: UserReponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid ID provided.',
  })
  @Get('/me')
  public async me(@Req() req: Request, @Res() res: Response) {
    if (req.isUnauthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    //@ts-expect-error nowwor
    const user: User = await this.userService.findUserById(req.user['id']);
    delete user.password;
    res.json({
      user,
    });
  }
}
