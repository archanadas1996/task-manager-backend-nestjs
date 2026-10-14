import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { CommentsService } from './comments.service';

@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // GET /api/comments
  @Get()
  getComments() {
    return this.commentsService.getComments();
  }

  // GET /api/comments/:id
  @Get(':id')
  getCommentById(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.getCommentById(id);
  }

  // POST /api/comments
  @Post()
  createComment(
    @Body()
    body: {
      task_id: number;
      user_id: number;
      content: string;
    },
  ) {
    return this.commentsService.createComment(body);
  }

  // PUT /api/comments/:id
  @Put(':id')
  updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { content: string },
  ) {
    return this.commentsService.updateComment(id, body);
  }

  // DELETE /api/comments/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.commentsService.deleteComment(id);
  }
}
