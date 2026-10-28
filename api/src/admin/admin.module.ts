import { Module } from '@nestjs/common';
import { ADMIN_API_TOKEN, AdminTokenGuard } from './admin-token.guard.js';
import { AdminApiController } from './admin-api.controller.js';
import { ImportExportService } from './import-export.service.js';
import { ResourcesService } from './resources.service.js';

/** Cổng quản trị cho dashboard admin.baodom.xyz (hợp đồng /admin-api phiên bản 1, xem admin-hub/AGENT.md). */
@Module({
  controllers: [AdminApiController],
  providers: [{ provide: ADMIN_API_TOKEN, useFactory: () => process.env.ADMIN_API_TOKEN }, AdminTokenGuard, ResourcesService, ImportExportService],
})
export class AdminModule {}
