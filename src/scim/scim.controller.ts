import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Res,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import { Response, Request } from 'express'; // Import the Response object

import { ScimService } from './scim.service';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';

// To funnel users into their designated orgs
const ORG_ID = 1;

interface IUserSchema {
  schemas: string[];
  userName?: string;
  id?: string;
  name?: {
    givenName: string;
    familyName: string;
  };
  emails?: { primary: boolean; value: string; type: string }[];
  displayName?: string;
  locale?: string;
  meta?: {
    resourceType: string;
  };
  externalId?: string;
  groups?: [];
  password?: string;
  active?: boolean;
  detail?: string;
  status?: number;
}

const defaultUserSchema: IUserSchema = {
  schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
  locale: 'en-US',
  groups: [],
  meta: {
    resourceType: 'User',
  },
};

@Controller('scim/v2')
@UseGuards(AuthGuard('bearer'))
export class ScimController {
  constructor(
    private readonly scimService: ScimService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('/Users')
  async create(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    // Format to SCIM standard
    const newUser: IUserSchema = req.body;
    const { emails, password } = req.body;
    const externalId = newUser.externalId;
    const active = newUser.active;
    const givenName = newUser.name?.givenName ?? 'NAME';
    const familyName = newUser.name?.familyName ?? 'MISSING';

    const displayName = `${givenName} ${familyName}`;

    // Pull out primary email address
    const emailPrimary = emails.find((email) => email.primary === true);
    const email = emailPrimary.value;
    // Set displayName to name
    const name = displayName;

    // Check if the User exists in the database
    // externalId + orgId = user uniqueness per SCIM RFC Section 3.3
    const duplicateUser = await this.prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
      },
      where: {
        externalId,
        org: { id: ORG_ID },
      },
    });

    let userResponse: IUserSchema;
    let httpStatus = 201;

    // If there is any records returned, then we have a duplicate
    if (duplicateUser) {
      // User Found... Error
      console.log('Account Exist ID: ', duplicateUser.id);

      userResponse = {
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'User already exists in the database: ' + duplicateUser.id,
        status: 409,
      };
      httpStatus = 409;

      // res.status(200).send(userResponse);
    } else {
      // If we don't find one Create...
      // Create the User in the database
      const user = await this.prisma.user.create({
        data: {
          org: { connect: { id: ORG_ID } },
          name,
          email,
          password,
          externalId,
          active,
        },
      });

      console.log('Account Created ID: ', user.id);

      userResponse = {
        ...defaultUserSchema,
        id: `${user.id}`,
        userName: user.email,
        name: {
          givenName,
          familyName,
        },
        emails: [
          {
            primary: true,
            value: user.email,
            type: 'work',
          },
        ],
        displayName: name,
        externalId: user.externalId,
        active: user.active,
      };
    }

    res.status(httpStatus).json(userResponse);
  }

  @Get('/Users')
  async findAll(@Req() req, @Res() res: Response) {
    // RFC Notes on Pagination: https://www.rfc-editor.org/rfc/rfc7644#section-3.4.2.4
    const DEFAULT_START_INDEX = '1';
    const DEFAULT_RECORD_LIMIT = '100';
    let startIndex = parseInt(
      (req.query.startIndex as string) ?? DEFAULT_START_INDEX,
    );
    startIndex--; // Prisma starts its indexing at 0, while Okta send starting index at 1, this is to make sure we start at 0
    const recordLimit = parseInt(
      (req.query.recordLimit as string) ?? DEFAULT_RECORD_LIMIT,
    );
    let filterQuery: string | null = (req.query.filter as string) ?? null;
    let filterParams: string[] = [];
    let email = null;

    if (filterQuery) {
      // Get query string for filter that has operators eq
      // ?filter=userName%20eq%20%22bob%40tables.fake%22
      filterParams = filterQuery.split(' ');

      // RFC Notes on Filtering: https://www.rfc-editor.org/rfc/rfc7644#section-3.4.2.2
      const FILTER_EXPRESSION_LENGTH = 3;
      const FILTER_ATTRIBUTE_NAME = 0;
      const FILTER_OPERATOR = 1;
      const FILTER_VALUE = 2;

      if (
        filterParams.length !== FILTER_EXPRESSION_LENGTH ||
        filterParams[FILTER_ATTRIBUTE_NAME] !== 'userName' ||
        filterParams[FILTER_OPERATOR] !== 'eq'
      ) {
        filterParams = [];
        filterQuery = null;
      } else {
        // Email string is wrapped in "", remove the double quotes
        email = filterParams[FILTER_VALUE].replaceAll('"', '');
        console.log('Filter Detected: userName EQ ', email);
      }
    }

    let where: { org: unknown; email?: string } = {
      org: {
        id: ORG_ID,
      },
    };

    if (email) {
      where = { ...where, email };
    }

    const count = await this.prisma.user.count({ where });
    const usersResponse = {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: count,
      startIndex: 1,
      itemsPerPage: 0,
      Resources: [],
    };

    if (count > 0) {
      const users = await this.prisma.user.findMany({
        take: recordLimit,
        skip: startIndex,
        select: {
          id: true,
          email: true,
          name: true,
          externalId: true,
          active: true,
        },
        where,
      });

      usersResponse['Resources'] = users.map((user) => {
        const [givenName, familyName] = user.name.split(' ');
        return {
          ...defaultUserSchema,
          id: user.id.toString(),
          userName: user.email,
          name: {
            givenName,
            familyName,
          },
          emails: [
            {
              primary: true,
              value: user.email,
              type: 'work',
            },
          ],
          displayName: user.name,
          externalId: user.externalId,
          active: user.active,
        };
      });
    }

    usersResponse.itemsPerPage = usersResponse.Resources.length;
    res.json(usersResponse);
  }

  @Get('/Users/:userId')
  async findOne(
    @Param('userId') userId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const id = req.params.userId;
    const user = await this.prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        externalId: true,
        active: true,
      },
      where: {
        id,
        org: { id: ORG_ID },
      },
    });

    let httpStatus = 200;
    let userResponse;

    // If no response from DB, return 404
    if (user) {
      const { id, name, email } = user;
      const [givenName, familyName] = name.split(' ');

      userResponse = {
        ...defaultUserSchema,
        id: id.toString(),
        userName: email,
        name: {
          givenName,
          familyName,
        },
        emails: [
          {
            primary: true,
            value: email,
            type: 'work',
          },
        ],
        displayName: name,
        externalId: user.externalId,
        active: user.active,
      } satisfies IUserSchema;
    } else {
      httpStatus = 404;
      userResponse = `User ${id} not found`;
    }

    // Send Response
    res.status(httpStatus).json(userResponse);
  }
  @Put('/Users/:userId')
  async updateOe(
    @Param('userId') userId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const id = req.params.userId;
    const userCount = await this.prisma.user.count({
      where: {
        id,
        org: { id: ORG_ID },
      },
    });

    let userResponse;
    let httpStatus = 200;

    if (userCount === 1) {
      const updatedUserRequest: IUserSchema = req.body;
      const { name, emails } = updatedUserRequest;

      const updatedUser = await this.prisma.user.update({
        data: {
          email: emails.find((email) => email.primary).value,
          name: `${name.givenName} ${name.familyName}`,
        },
        where: {
          id,
        },
      });

      const [givenName, familyName] = updatedUser.name.split(' ');

      userResponse = {
        ...defaultUserSchema,
        id: id.toString(),
        userName: updatedUser.email,
        name: {
          givenName,
          familyName,
        },
        emails: [
          {
            primary: true,
            value: updatedUser.email,
            type: 'work',
          },
        ],
        displayName: updatedUser.name,
        externalId: updatedUser.externalId,
        active: updatedUser.active,
      } satisfies IUserSchema;
    } else if (userCount === 0) {
      httpStatus = 404;
      userResponse = `User ${id} not found`;
    } else {
      httpStatus = 500;
      userResponse = `Whoa there!`;
    }

    res.status(httpStatus).send(userResponse);
  }

  @Patch('/Users/:userId')
  async update(
    @Param('userId') userId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const id = req.params.userId;
    const active = req.body['Operations'][0]['value']['active'];
    await this.prisma.user.update({
      data: {
        active,
      },
      where: { id },
    });

    res.sendStatus(204);
  }

  @Delete('/Users/:userId')
  async remove(
    @Param('userId') userId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const id = req.params.userId;
    await this.prisma.user.delete({
      where: { id },
    });

    res.sendStatus(204);
  }
}
