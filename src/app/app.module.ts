import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { VdomModule } from './proxy'

import { AppComponent } from './app.component'


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    VdomModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
