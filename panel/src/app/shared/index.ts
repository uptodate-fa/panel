import { StopPropagationDirective } from "./directives/stop-propagation.directive";
import { SHARED_MODULES } from "./modules";
import { COMMON_MATERIAL_ANGULAR_MODULES } from "./modules/material-angular";
import { SafeHtmlPipe } from "./pipes/safe-html.pipe";

export const SHARED = [
  SHARED_MODULES,
  COMMON_MATERIAL_ANGULAR_MODULES,

  SafeHtmlPipe,
  StopPropagationDirective
]