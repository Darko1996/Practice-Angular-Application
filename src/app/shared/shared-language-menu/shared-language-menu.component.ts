import {Component, Input, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-shared-language-menu',
  templateUrl: './shared-language-menu.component.html',
  styleUrls: ['./shared-language-menu.component.scss']
})
export class SharedLanguageMenuComponent implements OnInit {
  @Input() orientation?: 'horizontal' | 'vertical';

  currentLanguage: any;
  languages: any[];
  showAvailable = false;

  constructor(private translateService: TranslateService) {
    this.languages = [{
      locale: 'en',
      src: '../../../assets/images/languages-menu/en.png'
    },
    {
      locale: 'rs',
      src: '../../../assets/images/languages-menu/rs.png'
    }];

    this.translateService.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.currentLanguage = this.getCurrentLanguageData(this.translateService.currentLang);
  }

  toggleAvailable(): void {
    this.showAvailable = !this.showAvailable;
  }

  getCurrentLanguageData(currentLanguage: string): any {
    return this.languages.find(l => l.locale === (currentLanguage || 'en'));
  }

  select(language: string): void {
    this.currentLanguage = this.getCurrentLanguageData(language);
    this.toggleAvailable();
    this.translateService.use(language);
  }

}
