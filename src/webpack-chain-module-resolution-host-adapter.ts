import { ModuleResolutionHost } from 'typescript';
import { ModuleResolutionHostAdapter } from '@angular/compiler-cli' ;

import { WebpackResourceLoader } from './webpack-resource-loader';
import { WebpackWrapper, ExternalAssetsSource } from './webpack-wrapper';

export class WebpackChainModuleResolutionHostAdapter extends ModuleResolutionHostAdapter implements ExternalAssetsSource {
  private _loader: WebpackResourceLoader;

  constructor(host: ModuleResolutionHost, public webpackWrapper: WebpackWrapper) {
    super(host);
    this._loader = new WebpackResourceLoader(webpackWrapper.compiler.createCompilation());
    webpackWrapper.externalAssetsSource = this;
  }

  get externalAssets(): any {
    return this._loader.getExternalAssets();
  }

  readFile(path: string): string {
    return <any>this.webpackWrapper.readFileTransformer(path, super.readFile(path));
  }

  readResource(path: string): Promise<string> {

    const newPath = this.webpackWrapper.resourcePathTransformer(path);

    if (newPath === '') {
      return Promise.resolve(newPath);
    } else if (!this.fileExists(newPath)) {
      throw new Error(`Compilation failed. Resource file not found: ${newPath}`);
    } else {
      return this._loader.get(newPath)
        .then( source => Promise.resolve(this.webpackWrapper.resourceTransformer(newPath, source)) );
    }

  }
}
