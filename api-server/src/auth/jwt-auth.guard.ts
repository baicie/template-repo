import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 检查是否启用了认证
    const authEnabled = this.configService.get<boolean>('auth.enabled');

    if (!authEnabled) {
      // 如果认证被禁用，直接返回true，跳过JWT验证
      console.log('🔓 认证已禁用，跳过JWT验证');
      return true;
    }

    // 如果认证启用，执行正常的JWT验证
    return super.canActivate(context);
  }
}
