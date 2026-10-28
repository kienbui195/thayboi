import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module.js';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { UserGuard } from './auth/user.guard.js';
import { GeoController } from './geo/geo.controller.js';
import { HealthController } from './health/health.controller.js';
import { LuanGiaiService } from './luan-giai/luan-giai.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfilesController } from './profiles/profiles.controller.js';
import { ProfilesService } from './profiles/profiles.service.js';

@Module({
  imports: [PrismaModule, AdminModule],
  controllers: [HealthController, AuthController, ProfilesController, GeoController],
  providers: [AuthService, UserGuard, ProfilesService, LuanGiaiService],
})
export class AppModule {}
