import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { JwtStrategy } from './jwt.strategy';
import { ROLES_KEY } from './decorators/roles.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard("jwt")', () => {
    // JwtAuthGuard extends AuthGuard('jwt'), so canActivate should exist
    expect(typeof guard.canActivate).toBe('function');
  });
});

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (user?: { role: string }): ExecutionContext => {
    const request = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext();

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access when required roles array is empty', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const context = createMockContext();

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should deny access when user is not present on request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = createMockContext(); // no user

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should deny access when user role does not match required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = createMockContext({ role: 'visitor' });

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should allow access when user role matches required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = createMockContext({ role: 'admin' });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access when user role is among multiple required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['admin', 'moderator']);
    const context = createMockContext({ role: 'moderator' });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should pass handler and class to reflector.getAllAndOverride', () => {
    const getAllAndOverrideSpy = jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['admin']);

    const handler = jest.fn();
    const classRef = jest.fn();
    const context = createMockContext({ role: 'admin' });
    (context as any).getHandler = () => handler;
    (context as any).getClass = () => classRef;

    guard.canActivate(context);

    expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
      handler,
      classRef,
    ]);
  });
});

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                JWT_SECRET: 'test-secret',
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return validated user payload', async () => {
    const payload = {
      sub: 'user-uuid-123',
      openid: 'wx-openid-test',
      role: 'visitor',
      hasProfile: true,
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-uuid-123',
      openid: 'wx-openid-test',
      role: 'visitor',
      hasProfile: true,
    });
  });

  it('should handle admin role payload', async () => {
    const payload = {
      sub: 'admin-uuid',
      openid: 'admin-default',
      role: 'admin',
      hasProfile: true,
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 'admin-uuid',
      openid: 'admin-default',
      role: 'admin',
      hasProfile: true,
    });
  });

  it('should handle visitor without profile', async () => {
    const payload = {
      sub: 'visitor-uuid',
      openid: 'wx-openid-new',
      role: 'visitor',
      hasProfile: false,
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 'visitor-uuid',
      openid: 'wx-openid-new',
      role: 'visitor',
      hasProfile: false,
    });
  });
});
