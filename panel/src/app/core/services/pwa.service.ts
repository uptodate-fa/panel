import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  onDefferedPromped = new Subject<void>();
  deferredPrompt: any;

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      this.onDefferedPromped.next();
    });
  }

  install(): void {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      this.deferredPrompt.userChoice
        .then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            this.deferredPrompt = null;
          }
        })
        .catch((error: any) => {});
    }
  }

  get isStandalone() {
    const mqStandAlone = '(display-mode: standalone)';
    return window.matchMedia(mqStandAlone).matches;
  }
}
