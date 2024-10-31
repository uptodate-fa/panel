import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { ContentsService } from './contents.service';
import { LoginUser } from '../auth/user.decorator';
import { ContentHistory, User } from '@uptodate/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller('contents')
export class ContentsController {
  constructor(
    private proxy: ProxyService,
    private contentsService: ContentsService,
    @InjectModel(ContentHistory.name)
    private contentHistoryModel: Model<ContentHistory>,
  ) {}

  @Get('history')
  history(@LoginUser() user: User) {
    return this.contentHistoryModel
      .find({ user: user.id })
      .populate('content')
      .sort({ createdAt: 'desc' })
      .limit(8)
      .exec();
  }

  @Get('presearch/:query')
  preSearch(@Param('query') query: string) {
    return this.proxy.preSearch(query);
  }

  @Get('search/:query')
  search(@Param('query') query: string, @Query('sp') sp?: string) {
    return this.proxy.search(query, sp ? Number(sp) : 0);
  }

  @Get('graphic')
  graphic(
    @Query('topicId') topicId: string,
    @Query('imageKey') imageKey: string,
  ) {
    return this.proxy.graphic(imageKey, topicId);
  }

  @Get(':id')
  getById(
    @Param('id') id: string,
    @Query('force') force: string,
    @LoginUser() user: User,
  ) {
    return this.contentsService.getContent(id, user, !!force);
  }

  @Get('outline/:id')
  getOutlineById(@Param('id') id: string) {
    return this.contentsService.getOutline(id);
  }

  @Get('translate/:id')
  async getByIdTranslated(@Param('id') id: string) {
    return this.contentsService.translate(id);
  }

  @Get('tableOfContent/:topic')
  async getTableOfContent(@Param('topic') topic: string) {
    return this.proxy.tableOfContent(topic);
  }

  @Get('tableOfContent/:topic/:sub')
  async getTableOfContentWitSub(
    @Param('topic') topic: string,
    @Param('sub') sub: string,
  ) {
    return this.proxy.tableOfContent(topic, sub);
  }
}
