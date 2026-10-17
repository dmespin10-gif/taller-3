import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmployeePageComponent } from './containers/employee-page/employee-page.component';
import { EmployeeFormComponent } from './components/employee-form/employee-form.component';
import { EmployeeTableComponent } from './components/employee-table/employee-table.component';

@NgModule({
  declarations: [
    AppComponent,
    // Smart
    EmployeePageComponent,
    // Dumb
    EmployeeFormComponent,
    EmployeeTableComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    // EmployeeService usa providedIn: 'root'; no se registra aquí para no duplicar instancias.
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
