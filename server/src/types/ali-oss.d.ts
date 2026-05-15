declare module 'ali-oss' {
  interface HeadOptions {
    timeout?: number;
    headers?: Record<string, string>;
  }

  interface SignatureUrlOptions {
    method?: string;
    expires?: number;
    headers?: Record<string, string>;
    'Content-Type'?: string;
    response?: Record<string, string>;
  }

  interface OSSOptions {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    endpoint?: string;
    timeout?: number | string;
  }

  class OSS {
    constructor(options: OSSOptions);
    signatureUrl(name: string, options?: SignatureUrlOptions): string;
    head(name: string, options?: HeadOptions): Promise<unknown>;
    delete(name: string): Promise<unknown>;
  }

  export = OSS;
}
