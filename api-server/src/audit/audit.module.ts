import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogService } from '../common/services/audit-log.service';
import { AuditLog } from '../common/entities/audit-log.entity';
import { PaginationService } from '../common/services/pagination.service';
import { AuditController } from './audit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditLogService, PaginationService],
  exports: [AuditLogService],
})
export class AuditModule {}
