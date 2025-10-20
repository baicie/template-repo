import { Injectable, NotFoundException } from '@nestjs/common';
import type { FileMetadata } from './entities/file-metadata.entity';

@Injectable()
export class UploadsService {
  private files: FileMetadata[] = [
    {
      id: 1,
      filename: 'example.jpg',
      originalname: 'example.jpg',
      mimetype: 'image/jpeg',
      size: 123456,
      path: '/uploads/example.jpg',
      createdAt: new Date(),
    },
  ];

  saveFile(file: Express.Multer.File): FileMetadata {
    const newId =
      this.files.length > 0 ? Math.max(...this.files.map((f) => f.id)) + 1 : 1;
    const url = `/uploads/${file.filename || `file-${newId}`}`;

    const fileMetadata: FileMetadata = {
      id: newId,
      filename: file.filename || `file-${newId}`,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: url,
      createdAt: new Date(),
    };

    this.files.push(fileMetadata);
    return fileMetadata;
  }

  saveImage(file: Express.Multer.File): FileMetadata {
    const fileMetadata = this.saveFile(file);
    fileMetadata.isImage = true;
    return fileMetadata;
  }

  saveMultipleFiles(files: Express.Multer.File[]): FileMetadata[] {
    return files.map((file) => this.saveFile(file));
  }

  getFilesList(page: number, limit: number) {
    const total = this.files.length;
    const skip = (page - 1) * limit;

    return {
      data: this.files.slice(skip, skip + limit),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  deleteFile(id: number): { success: boolean } {
    const index = this.files.findIndex((file) => file.id === id);
    if (index === -1) {
      throw new NotFoundException(`文件ID ${id} 不存在`);
    }

    this.files.splice(index, 1);
    return { success: true };
  }
}
