import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './service/auth.service';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  const backendBase = environment.api.replace(/\/+$/, '');
  const isBackendAbsolute = /^https?:\/\//i.test(req.url) && req.url.startsWith(`${backendBase}/`);
  const isBackendRelative = req.url.startsWith('/api/') || req.url.startsWith('/spring/api/');
  const isBackend = isBackendAbsolute || isBackendRelative;

  if (!isBackend) {
    return next(req);
  }

  const authReq = req.clone({
    withCredentials: true,
    setHeaders: token && !req.headers.has('Authorization')
      ? { Authorization: `Token ${token}` }
      : {}
  });

  return next(authReq);
};
