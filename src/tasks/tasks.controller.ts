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

import { TasksService } from './tasks.service';
import type { Task } from './interfaces/task.interface';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // GET /api/tasks
  @Get()
  getTasks(): Promise<Task[]> {
    return this.tasksService.getTasks();
  }

  // GET /api/tasks/:id
  @Get(':id')
  getTaskById(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  // POST /api/tasks
  @Post()
  createTask(@Body() body: Partial<Task>): Promise<Task> {
    return this.tasksService.createTask(body);
  }

  // PUT /api/tasks/:id
  @Put(':id')
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Task>,
  ): Promise<Task> {
    return this.tasksService.updateTask(id, body);
  }

  // DELETE /api/tasks/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.tasksService.deleteTask(id);
  }
}
