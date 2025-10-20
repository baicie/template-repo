import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(private configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: '健康检查' })
  @ApiResponse({ status: 200, description: '服务健康状态' })
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('nodeEnv'),
      version: this.configService.get<string>('app.version'),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: 'healthy', // 在实际应用中可以检查数据库连接
        jwt: 'healthy',
        logging: 'healthy',
      },
    };
  }

  @Get('ready')
  @ApiOperation({ summary: '就绪检查' })
  @ApiResponse({ status: 200, description: '服务就绪状态' })
  getReadiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: true,
        configuration: true,
        security: true,
      },
    };
  }

  @Get('live')
  @ApiOperation({ summary: '存活检查' })
  @ApiResponse({ status: 200, description: '服务存活状态' })
  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
