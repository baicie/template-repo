import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { DatabaseMigrationService } from '../common/services/database-migration.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiVersion } from '../common/decorators/api-version.decorator';

@ApiTags('数据库管理')
@Controller('database')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DatabaseController {
  constructor(
    private readonly databaseService: DatabaseMigrationService,
    private readonly i18n: I18nService,
  ) {}

  @Get('status')
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取数据库状态' })
  @ApiResponse({ status: 200, description: '数据库状态信息' })
  async getStatus(@I18nLang() lang: string) {
    const status = await this.databaseService.getDatabaseStatus();
    const size = await this.databaseService.getDatabaseSize();
    const title = await this.i18n.translate('database.status', { lang });

    return {
      title,
      data: {
        ...status,
        ...size,
      },
    };
  }

  @Get('migrations')
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取数据库迁移列表' })
  @ApiResponse({ status: 200, description: '迁移列表' })
  async getMigrations(@I18nLang() lang: string) {
    const migrations = await this.databaseService.getMigrations();
    const title = await this.i18n.translate('database.migrations', { lang });

    return {
      title,
      data: migrations,
    };
  }

  @Post('migrations/run')
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '执行待执行的迁移' })
  @ApiResponse({ status: 200, description: '迁移执行结果' })
  async runMigrations(@I18nLang() lang: string) {
    const result = await this.databaseService.runMigrations();
    const message = await this.i18n.translate(
      'database.migrations.run.success',
      {
        lang,
        args: { count: result.executed.length },
      },
    );

    return {
      message,
      data: result,
    };
  }

  @Post('migrations/revert')
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '回滚最后一个迁移' })
  @ApiResponse({ status: 200, description: '迁移回滚结果' })
  async revertMigration(@I18nLang() lang: string) {
    const result = await this.databaseService.revertLastMigration();

    let message: string;
    if (result.error) {
      message = await this.i18n.translate('database.migrations.revert.error', {
        lang,
      });
    } else {
      message = await this.i18n.translate(
        'database.migrations.revert.success',
        { lang },
      );
    }

    return {
      message,
      data: result,
    };
  }

  @Post('backup')
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '创建数据库备份' })
  @ApiQuery({ name: 'name', description: '备份名称', required: false })
  @ApiResponse({ status: 200, description: '备份创建结果' })
  async createBackup(@Query('name') name?: string, @I18nLang() lang?: string) {
    const backup = await this.databaseService.createBackup(name);

    if (backup) {
      const message = await this.i18n.translate('database.backup.success', {
        lang,
      });
      return {
        message,
        data: backup,
      };
    } else {
      const message = await this.i18n.translate('database.backup.failed', {
        lang,
      });
      return {
        message,
        data: null,
      };
    }
  }
}
