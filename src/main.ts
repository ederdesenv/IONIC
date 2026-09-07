import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// OBS: o registro do web component "jeep-sqlite" (usado pelo SQLite no
// navegador) NÃO é feito aqui. Fazer isso de forma "eager"/síncrona no
// carregamento do main.ts, antes de existir um <jeep-sqlite> no DOM, aciona
// um bug conhecido do Stencil (engine do jeep-sqlite) que quebra o
// componente ("Couldn't find host element for jeep-sqlite").
// Por isso o registro é feito de forma tardia dentro do TodoService,
// depois que o elemento já existe no DOM. Ver src/app/todo.service.ts.

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
