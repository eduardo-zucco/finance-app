import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonFooter } from '@ionic/angular/standalone';
import { StatusBarService } from './core/services/status-bar.service';
import { IonicModule } from "@ionic/angular";
import { addIcons } from 'ionicons';
import { homeOutline, swapHorizontalOutline, walletOutline, pieChartOutline, trophyOutline, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonFooter, IonicModule],
})
export class AppComponent {
  constructor(private statusBarService: StatusBarService) {
    this.statusBarService.init();
    addIcons({ homeOutline, swapHorizontalOutline, walletOutline, pieChartOutline, trophyOutline, logOutOutline });
  }
}
