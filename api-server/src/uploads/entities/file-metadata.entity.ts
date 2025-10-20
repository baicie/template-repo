export class FileMetadata {
  id: number;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  isImage?: boolean;
  createdAt: Date;
}
