export interface UploadedImage {
    id: string;
    url: string;
    name: string;
    file?: File;
}

export type AspectRatioId = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '2:3' | '21:9';

export interface AspectRatioOption {
    id: string;
    name: string;
}

export interface DurationOption {
    id: string;
    name: string;
}
