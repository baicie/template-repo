import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('用户认证')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '登录成功，返回用户信息和token' })
  @ApiResponse({ status: 401, description: '邮箱或密码错误' })
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.authService.login(loginDto);
    const message = await this.i18n.translate('auth.login.success', { lang });

    return {
      message,
      ...result,
    };
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: '注册成功，返回用户信息和token' })
  @ApiResponse({ status: 409, description: '邮箱已被注册' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.authService.register(registerDto);
    const message = await this.i18n.translate('auth.register.success', {
      lang,
    });

    return {
      message,
      ...result,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '返回当前用户信息' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@Request() req: any, @I18nLang() lang: string) {
    const title = await this.i18n.translate('auth.profile.title', { lang });

    return {
      title,
      user: req.user,
    };
  }
}
