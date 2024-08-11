import { HTTP_INTERCEPTORS, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
const IGNORE_CASES = [new RegExp('^https?:\\/\\/?'), new RegExp('/i18n/')];

@Injectable()
class ApiInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let ignore = false;
    for (const cases of IGNORE_CASES) {
      if (cases.test(req.url)) {
        ignore = true;
        break;
      }
    }
    if (!ignore) {
      req = req.clone({
        url: `${environment.apiUrl}${req.url}`,
      });

      const user = sessionStorage.getItem('panelLoginUser') || localStorage.getItem('panelLoginUser');

      if (user) {
        const token = JSON.parse(user).token;
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }

    return next.handle(req);
  }
}

export const apiInterceptorProvider: () => Provider = () => ({
  provide: HTTP_INTERCEPTORS,
  useClass: ApiInterceptor,
  multi: true,
});
