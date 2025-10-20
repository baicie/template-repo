import { Module } from '@nestjs/common';
import { LanguageController } from './language.controller';

@Module({
  controllers: [LanguageController],
})
export class LanguageModule {}
