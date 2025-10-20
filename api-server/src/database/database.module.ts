import { Module } from '@nestjs/common';
import { DatabaseMigrationService } from '../common/services/database-migration.service';
import { DatabaseController } from './database.controller';

@Module({
  controllers: [DatabaseController],
  providers: [DatabaseMigrationService],
  exports: [DatabaseMigrationService],
})
export class DatabaseModule {}
