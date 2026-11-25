export type ToolCategory = 'all' | 'organize' | 'convert-to-pdf' | 'convert-from-pdf' | 'security-edit';

export type ToolId =
  | 'merge-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'ocr-pdf'
  | 'pdf-to-images'
  | 'images-to-pdf'
  | 'pdf-to-word'
  | 'pdf-to-text'
  | 'text-to-pdf'
  | 'organize-pdf'
  | 'watermark-pdf'
  | 'unlock-pdf'
  | 'page-numbers';

export interface ToolDefinition {
  id: ToolId;
  title: string;
  shortDesc: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  badge?: string;
  popular?: boolean;
  color: string;
  accept: string;
  multiple: boolean;
}

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  previewUrl?: string;
}

export interface PdfPageInfo {
  pageNumber: number;
  rotation: number;
  thumbnailUrl: string;
  selected?: boolean;
}

export interface ProcessResult {
  blob: Blob;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  originalSize?: number;
}
