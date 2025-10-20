import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

export interface MigrationInfo {
  name: string;
  timestamp: number;
  executed: boolean;
  executedAt?: Date;
}

export interface BackupInfo {
  name: string;
  path: string;
  size: number;
  createdAt: Date;
}

@Injectable()
export class DatabaseMigrationService {
  private readonly logger = new Logger(DatabaseMigrationService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * 获取迁移列表
   */
  async getMigrations(): Promise<MigrationInfo[]> {
    try {
      const migrations = this.dataSource.migrations;
      let executedMigrations: any[] = [];

      try {
        executedMigrations = await this.dataSource.query(
          `SELECT * FROM migrations ORDER BY timestamp ASC`,
        );
      } catch {
        // 如果 migrations 表不存在，返回空数组
        executedMigrations = [];
      }

      const executedMap = new Map(
        executedMigrations.map((m: any) => [m.name, m]),
      );

      return migrations.map((migration: any) => ({
        name: migration.name || migration.constructor.name,
        timestamp: migration.timestamp || Date.now(),
        executed: executedMap.has(migration.name || migration.constructor.name),
        executedAt: executedMap.get(
          migration.name || migration.constructor.name,
        )?.executedAt,
      }));
    } catch (error) {
      this.logger.error('获取迁移列表失败:', error);
      return [];
    }
  }

  /**
   * 执行待执行的迁移
   */
  async runMigrations(): Promise<{ executed: string[]; errors: any[] }> {
    const executed: string[] = [];
    const errors: any[] = [];

    try {
      const executedMigrations = await this.dataSource.runMigrations();

      executedMigrations.forEach((migration) => {
        executed.push(migration.name);
        this.logger.log(`迁移已执行: ${migration.name}`);
      });

      return { executed, errors };
    } catch (error) {
      this.logger.error('执行迁移失败:', error);
      errors.push(error);
      return { executed, errors };
    }
  }

  /**
   * 回滚最后一个迁移
   */
  async revertLastMigration(): Promise<{ reverted?: string; error?: any }> {
    try {
      // TypeORM 的 undoLastMigration 方法返回 void，我们需要手动检查
      await this.dataSource.undoLastMigration();

      this.logger.log('迁移回滚完成');
      return { reverted: '最后一个迁移已回滚' };
    } catch (error) {
      if (error.message?.includes('No migrations found')) {
        return { error: '没有可回滚的迁移' };
      }

      this.logger.error('回滚迁移失败:', error);
      return { error: error.message || '回滚失败' };
    }
  }

  /**
   * 创建数据库备份（仅适用于支持的数据库）
   */
  async createBackup(backupName?: string): Promise<BackupInfo | null> {
    const name = backupName || `backup_${Date.now()}`;

    try {
      // 对于SQL.js，我们可以导出数据库内容
      if (this.dataSource.options.type === 'sqljs') {
        return await this.createSqlJsBackup(name);
      }

      // 其他数据库类型需要特定的备份逻辑
      this.logger.warn('当前数据库类型不支持自动备份');
      return null;
    } catch (error) {
      this.logger.error('创建备份失败:', error);
      return null;
    }
  }

  /**
   * 为SQL.js创建备份
   */
  private async createSqlJsBackup(name: string): Promise<BackupInfo> {
    const fs = require('node:fs');
    const path = require('node:path');

    const backupDir = './backups';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, `${name}.db`);
    const currentDbPath = this.dataSource.options.database || 'database.sqljs';

    // 复制当前数据库文件
    if (typeof currentDbPath === 'string' && fs.existsSync(currentDbPath)) {
      fs.copyFileSync(currentDbPath, backupPath);
    } else {
      // 如果是内存数据库，导出数据
      const entities = this.dataSource.entityMetadatas;
      const backupData: any = {};

      for (const entity of entities) {
        const repository = this.dataSource.getRepository(entity.target);
        backupData[entity.tableName] = await repository.find();
      }

      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    }

    const stats = fs.statSync(backupPath);

    return {
      name,
      path: backupPath,
      size: stats.size,
      createdAt: new Date(),
    };
  }

  /**
   * 获取数据库状态
   */
  async getDatabaseStatus(): Promise<{
    connected: boolean;
    type: string;
    tablesCount: number;
    migrationsCount: number;
    pendingMigrationsCount: number;
  }> {
    try {
      const connected = this.dataSource.isInitialized;
      const type = this.dataSource.options.type;

      let tablesCount = 0;
      let migrationsCount = 0;
      let pendingMigrationsCount = 0;

      if (connected) {
        // 获取表数量
        const tables = await this.dataSource.query(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        );
        tablesCount = tables.length;

        // 获取迁移信息
        const migrations = await this.getMigrations();
        migrationsCount = migrations.length;
        pendingMigrationsCount = migrations.filter((m) => !m.executed).length;
      }

      return {
        connected,
        type,
        tablesCount,
        migrationsCount,
        pendingMigrationsCount,
      };
    } catch (error) {
      this.logger.error('获取数据库状态失败:', error);
      return {
        connected: false,
        type: 'unknown',
        tablesCount: 0,
        migrationsCount: 0,
        pendingMigrationsCount: 0,
      };
    }
  }

  /**
   * 获取数据库大小
   */
  async getDatabaseSize(): Promise<{
    sizeInBytes: number;
    sizeFormatted: string;
  }> {
    try {
      if (this.dataSource.options.type === 'sqljs') {
        const dbPath = this.dataSource.options.database;
        if (typeof dbPath === 'string') {
          const fs = require('node:fs');
          if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            return {
              sizeInBytes: stats.size,
              sizeFormatted: this.formatBytes(stats.size),
            };
          }
        }
      }

      // 对于其他数据库类型，可以查询系统表
      const result = await this.dataSource.query(
        'PRAGMA page_count; PRAGMA page_size;',
      );
      const pageCount = result[0]?.page_count || 0;
      const pageSize = result[1]?.page_size || 0;
      const sizeInBytes = pageCount * pageSize;

      return {
        sizeInBytes,
        sizeFormatted: this.formatBytes(sizeInBytes),
      };
    } catch (error) {
      this.logger.error('获取数据库大小失败:', error);
      return { sizeInBytes: 0, sizeFormatted: '0 B' };
    }
  }

  /**
   * 格式化字节大小
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
