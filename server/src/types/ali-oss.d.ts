declare module 'ali-oss' {
  export default class OSS {
    constructor(options: any);
    put(name: string, buffer: Buffer): Promise<{ url: string }>;
    delete(name: string): Promise<any>;
  }
}
