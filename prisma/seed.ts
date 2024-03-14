import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();

const seed = async () => {
  try {
    const data = await prisma.org.create({
      data: {
        apikey: '131313',
        domain: 'portal.example',
        authorization_endpoint:
          'https://dev-48986703.okta.com/oauth2/default/v1/authorize',
        issuer: 'https://dev-48986703.okta.com/oauth2/default',
        client_id: '0oafkuqlooFdtDDCy5d7',
        token_endpoint: 'https://dev-48986703.okta.com/oauth2/default/v1/token',
        client_secret:
          '6vMOSYbZyNE8uDx26ioXgozbn7gNhxEdPkO92MlJbQArlVa-0JNFe-aDXy4FsBjA',
        idpType: 'okta',
        userinfo_endpoint:
          'https://dev-48986703.okta.com/oauth2/default/v1/userinfo',
      },
    });
    return data;
  } catch (error) {}
};

seed();
