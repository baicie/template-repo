import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../common/dto/pagination.dto';
import {
  ApiDeprecated,
  ApiExperimental,
  ApiVersion,
} from '../common/decorators/api-version.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @ApiVersion(['v1', 'v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '创建成功', type: User })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async create(@Body() createUserDto: CreateUserDto, @I18nLang() lang: string) {
    const user = await this.usersService.create(createUserDto);
    const message = await this.i18n.translate('user.created', { lang });

    return {
      message,
      data: user,
    };
  }

  @Get()
  @ApiVersion(['v1', 'v2'])
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '获取用户列表（分页）' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: PaginatedResponseDto<User>,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @I18nLang() _lang: string,
  ): Promise<PaginatedResponseDto<User>> {
    return await this.usersService.findAll(paginationDto);
  }

  @Get('search')
  @ApiVersion(['v2'])
  @ApiExperimental('高级搜索功能正在测试中')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '高级用户搜索' })
  @ApiQuery({ name: 'q', description: '搜索关键词', required: true })
  @ApiQuery({ name: 'role', description: '用户角色过滤', required: false })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async advancedSearch(
    @Query('q') query: string,
    @Query('role') role?: UserRole,
    @Query() paginationDto?: PaginationDto,
    @I18nLang() _lang?: string,
  ) {
    return await this.usersService.advancedSearch(query, role, paginationDto);
  }

  @Get(':id')
  @ApiVersion(['v1', 'v2'])
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: User })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @I18nLang() lang: string,
  ) {
    const user = await this.usersService.findOne(id);
    const title = await this.i18n.translate('user.detail', { lang });

    return {
      title,
      data: user,
    };
  }

  @Patch(':id')
  @ApiVersion(['v1', 'v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '更新成功', type: User })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @I18nLang() lang: string,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    const message = await this.i18n.translate('user.updated', { lang });

    return {
      message,
      data: user,
    };
  }

  @Delete(':id')
  @ApiVersion(['v1'])
  @ApiDeprecated('请使用软删除API /users/:id/soft-delete')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除用户（硬删除，已废弃）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @I18nLang() lang: string,
  ) {
    await this.usersService.remove(id);
    const message = await this.i18n.translate('user.deleted', { lang });

    return { message };
  }

  @Patch(':id/soft-delete')
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '软删除用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async softDelete(
    @Param('id', ParseIntPipe) id: number,
    @I18nLang() lang: string,
  ) {
    await this.usersService.softDelete(id);
    const message = await this.i18n.translate('user.deleted', { lang });

    return { message };
  }

  @Get('statistics/overview')
  @ApiVersion(['v2'])
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '用户统计概览' })
  @ApiResponse({ status: 200, description: '统计数据' })
  async getStatistics(@I18nLang() lang: string) {
    const stats = await this.usersService.getStatistics();
    const title = await this.i18n.translate('user.statistics', { lang });

    return {
      title,
      data: stats,
    };
  }
}
