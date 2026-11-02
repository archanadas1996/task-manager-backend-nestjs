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
  UseGuards,
} from '@nestjs/common';

import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('api/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  getProjects() {
    return this.projectsService.getProjects();
  }

  @Get(':id')
  getProjectById(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getProjectById(id);
  }

  @Roles('ADMIN')
  @Post()
  createProject(@Body() body: any) {
    return this.projectsService.createProject(body);
  }

  @Roles('ADMIN')
  @Put(':id')
  updateProject(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.projectsService.updateProject(id, body);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(@Param('id', ParseIntPipe) id: number) {
    await this.projectsService.deleteProject(id);
  }
}
