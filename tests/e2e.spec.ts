import { DynamicModule, Provider } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from './src/app.module';

async function createMockApplication(
  options: DynamicModule,
  extraProviders: Provider[] = [],
) {
  const module = await Test.createTestingModule({
    imports: [options],
    providers: [...extraProviders],
  }).compile();

  return module.createNestApplication().init();
}

describe('E2E tests', () => {
  it('should be defined using forRoot()', async () => {
    const app = await createMockApplication(AppModule.usingForRoot());

    expect(
      app.get(AppModule).mailerService.getTransporter('smtp'),
    ).toBeDefined();
  });

  it('should throw error if forRootAsync() is called without useExisting, useFactory and useClass', async () => {
    expect(() => AppModule.usingForRootAsyncWithoutOptions()).toThrow(Error);
  });

  it('should be defined using forRootAsync()', async () => {
    const app = await createMockApplication(AppModule.usingForRootAsync());

    expect(
      app.get(AppModule).mailerService.getTransporter('smtp'),
    ).toBeDefined();
  });

  it('should be defined using forRootAsync() with use class', async () => {
    const app = await createMockApplication(
      AppModule.usingForRootAsyncWithUseClass(),
    );

    expect(
      app.get(AppModule).mailerService.getTransporter('smtp'),
    ).toBeDefined();
  });
});
