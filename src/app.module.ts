import {
  MiddlewareConsumer,
  Module,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ThrottlerModule,
  ThrottlerGuard,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ScoresModule } from './scores/scores.module';
import { User } from './users/user.entity';
import { Score } from './scores/score.entity';
import { LoggingMiddleware } from './common/logging.middleware';
import { UsersService } from './users/users.service';
import { UserRole } from './users/user.entity';
import * as bcrypt from 'bcrypt';

@Module({
  imports: [
    // Load .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Global rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get('THROTTLE_TTL_MS') ?? 60000),
          limit: Number(config.get('THROTTLE_LIMIT') ?? 100),
        },
      ],
    }),

    // DB config from env
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT') ?? '5432', 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Score],
        synchronize: true, // dev only
      }),
    }),

    AuthModule,
    UsersModule,
    ScoresModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }

  // This runs once when the app has started
  async onApplicationBootstrap() {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    // If env not set, skip seeding (so prod can disable it easily)
    if (!adminUsername || !adminPassword) {
      console.log('[Seed] ADMIN_USERNAME or ADMIN_PASSWORD not set, skipping admin seeding');
      return;
    }

    const existing = await this.usersService.findByUsername(adminUsername);
    if (existing) {
      console.log(`[Seed] Admin user "${adminUsername}" already exists, skipping seeding`);
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await this.usersService.createUser(adminUsername, passwordHash, UserRole.ADMIN);

    console.log(`[Seed] Admin user "${adminUsername}" created`);
    
  }
}
