import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { AuditLogService } from '../common/services/audit-log.service';
import { AuditEntityType, AuditLog } from '../common/entities/audit-log.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiVersion } from '../common/decorators/api-version.decorator';

@ApiTags('审计日志')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取审计日志列表' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: PaginatedResponseDto<AuditLog>,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @I18nLang() _lang: string,
  ): Promise<PaginatedResponseDto<AuditLog>> {
    return await this.auditLogService.findAll(paginationDto);
  }

  @Get('entity/:entityType/:entityId')
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '获取特定实体的审计日志' })
  @ApiParam({
    name: 'entityType',
    description: '实体类型',
    enum: AuditEntityType,
  })
  @ApiParam({ name: 'entityId', description: '实体ID' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: PaginatedResponseDto<AuditLog>,
  })
  async findByEntity(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Query() paginationDto: PaginationDto,
    @I18nLang() _lang: string,
  ): Promise<PaginatedResponseDto<AuditLog>> {
    return await this.auditLogService.findByEntity(
      entityType,
      entityId,
      paginationDto,
    );
  }

  @Get('user/:userId')
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取特定用户的审计日志' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: PaginatedResponseDto<AuditLog>,
  })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() paginationDto: PaginationDto,
    @I18nLang() _lang: string,
  ): Promise<PaginatedResponseDto<AuditLog>> {
    return await this.auditLogService.findByUser(userId, paginationDto);
  }

  @Get('statistics')
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取审计统计信息' })
  @ApiQuery({
    name: 'days',
    description: '统计天数',
    required: false,
    type: Number,
  })
  @ApiResponse({ status: 200, description: '统计数据' })
  async getStatistics(@Query('days') days?: number, @I18nLang() lang?: string) {
    const stats = await this.auditLogService.getStatistics(days);
    const title = await this.i18n.translate('audit.statistics', { lang });

    return {
      title,
      data: stats,
    };
  }

  @Get('cleanup')
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '清理旧的审计日志' })
  @ApiQuery({
    name: 'daysToKeep',
    description: '保留天数',
    required: false,
    type: Number,
  })
  @ApiResponse({ status: 200, description: '清理完成' })
  async cleanupOldLogs(
    @Query('daysToKeep') daysToKeep?: number,
    @I18nLang() lang?: string,
  ) {
    const deletedCount = await this.auditLogService.cleanupOldLogs(daysToKeep);
    const message = await this.i18n.translate('audit.cleanup.success', {
      lang,
      args: { count: deletedCount },
    });

    return {
      message,
      data: { deletedCount },
    };
  }
}
