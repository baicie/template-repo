import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18nLang, I18nService } from 'nestjs-i18n';

class SwitchLanguageDto {
  language: 'zh' | 'en';
}

@ApiTags('语言管理')
@Controller('language')
export class LanguageController {
  constructor(private readonly i18n: I18nService) {}

  @Get('current')
  @ApiOperation({ summary: '获取当前语言' })
  @ApiResponse({ status: 200, description: '返回当前语言信息' })
  getCurrentLanguage(@I18nLang() lang: string) {
    return {
      current: lang,
      available: ['zh', 'en'],
      name:
        {
          zh: '中文',
          en: 'English',
        }[lang] || 'Unknown',
    };
  }

  @Get('list')
  @ApiOperation({ summary: '获取支持的语言列表' })
  @ApiResponse({ status: 200, description: '返回支持的语言列表' })
  getLanguageList() {
    return {
      languages: [
        {
          code: 'zh',
          name: '中文',
          nativeName: '中文',
        },
        {
          code: 'en',
          name: 'English',
          nativeName: 'English',
        },
      ],
      default: 'zh',
    };
  }

  @Post('switch')
  @ApiOperation({ summary: '切换语言' })
  @ApiBody({ type: SwitchLanguageDto })
  @ApiResponse({ status: 200, description: '语言切换成功' })
  @ApiResponse({ status: 400, description: '不支持的语言' })
  async switchLanguage(
    @Body() switchLanguageDto: SwitchLanguageDto,
    @I18nLang() currentLang: string,
  ) {
    const { language } = switchLanguageDto;
    const supportedLanguages = ['zh', 'en'];

    if (!supportedLanguages.includes(language)) {
      const message = await this.i18n.translate('common.language.unsupported', {
        lang: currentLang,
      });
      throw new Error(message);
    }

    const successMessage = await this.i18n.translate(
      'common.language.switchSuccess',
      {
        lang: language,
      },
    );

    return {
      message: successMessage,
      language,
      previousLanguage: currentLang,
    };
  }

  @Get('welcome')
  @ApiOperation({ summary: '获取欢迎信息' })
  @ApiResponse({ status: 200, description: '返回多语言欢迎信息' })
  async getWelcomeMessage(@I18nLang() lang: string) {
    const message = await this.i18n.translate('common.welcome', {
      lang: lang,
    });

    return {
      message,
      language: lang,
    };
  }
}
