import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from '../authService/auth-service.service'; 

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  const isLoggedIn = authService.isEmpLogined(); // can be boolean or Observable

  if (await isLoggedIn) {
    return true;
  } else {
    router.navigate(['/splash-page']);
    return false;
  }
};