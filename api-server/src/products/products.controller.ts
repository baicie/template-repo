import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import type { ProductFilterDto } from './dto/product.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Product } from './entities/product.entity';

@ApiTags('商品管理')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: '获取商品列表', description: '支持分页和过滤' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'category', required: false, description: '分类过滤' })
  @ApiQuery({ name: 'minPrice', required: false, description: '最低价格' })
  @ApiQuery({ name: 'maxPrice', required: false, description: '最高价格' })
  @ApiResponse({ status: 200, description: '返回商品列表' })
  async getProducts(@Query() filter: ProductFilterDto): Promise<{
    data: Product[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return await this.productsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '返回商品信息' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async getProductById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Product> {
    return await this.productsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建商品' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: '商品创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async createProduct(
    @Body(ValidationPipe) createProductDto: CreateProductDto,
  ): Promise<Product> {
    return await this.productsService.create(createProductDto);
  }

  @Post('upload')
  @ApiOperation({ summary: '上传商品图片' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @UseInterceptors(FileInterceptor('image'))
  uploadProductImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // 2MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): { filename: string; originalname: string; size: number; url: string } {
    return {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      url: `/uploads/${file.filename}`,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: '商品更新成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '商品删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    return await this.productsService.remove(id);
  }
}
