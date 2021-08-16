import { Component } from '@angular/core';
import { DataServiceService } from '../data-service.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  title = 'Contact Book';
  contacts: Array<any>;
  displayedColumns = ['firstName', 'email', 'edit', 'delete'];
  searchResult: any;
  contactCopy: any;

  constructor(
    private dataService: DataServiceService,
    private alertCtrl: AlertController
  ) {
    this.contacts = this.dataService.getData();
    this.contactCopy = this.contacts;
  }

  onInit() {}

  deleteContact(contact: any) {
    this.dataService.deleteData(contact);
    this.showSuccesfulDeleteAlert();
  }

  async showSuccesfulDeleteAlert() {
    const alert = await this.alertCtrl.create({
      cssClass: 'basic-alert',
      header: 'Delete',
      subHeader: 'Deleted Successfully',
      buttons: ['OK'],
    });

    await alert.present();
  }

  search(e) {
    const q = e.target.value;
    if (q) {
      this.searchResult = this.dataService.search(q);
      this.contacts = this.searchResult;
    } else {
      this.contacts = this.contactCopy;
    }
  }
}
