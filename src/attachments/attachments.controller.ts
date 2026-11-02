import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import type { Request, Response } from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import {
  AttachmentUploadInterceptor,
  UPLOAD_DIRECTORY,
} from './interceptors/attachment-upload.interceptor';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('tasks/:taskId/attachments')
  @UseInterceptors(AttachmentUploadInterceptor)
  async upload(
    @Param('taskId', ParseIntPipe) taskId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { sub: number } },
  ) {
    if (!file) {
      throw new BadRequestException('Please select a file');
    }

    return this.attachmentsService.upload(taskId, req.user.sub, file);
  }

  @Get('tasks/:taskId/attachments')
  getByTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.attachmentsService.getByTask(taskId);
  }

  @Get('attachments/:id/download')
  async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const file = await this.attachmentsService.getFileById(id);

    const filePath = join(UPLOAD_DIRECTORY, file.stored_name);

    if (!existsSync(filePath)) {
      throw new NotFoundException('The file is missing from storage');
    }

    return res.download(filePath, file.original_name);
  }
}
