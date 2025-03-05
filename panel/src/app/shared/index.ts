import { GoBackDirective } from './directives/go-back.directive';
import { StopPropagationDirective } from './directives/stop-propagation.directive';
import { SHARED_MODULES } from './modules';
import { COMMON_MATERIAL_ANGULAR_MODULES } from './modules/material-angular';
import { BaseUrlPipe } from './pipes/base-url.pipe';
import { DecodeUriPipe } from './pipes/decode-uri.pipe';
import { PdatePipe } from './pipes/pdate.pipe';
import { QueryParamsPipe } from './pipes/query-params.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

export const SHARED = [
  SHARED_MODULES,
  COMMON_MATERIAL_ANGULAR_MODULES,

  SafeHtmlPipe,
  StopPropagationDirective,
  GoBackDirective,
  PdatePipe,
  DecodeUriPipe,
  BaseUrlPipe,
  QueryParamsPipe,
];
