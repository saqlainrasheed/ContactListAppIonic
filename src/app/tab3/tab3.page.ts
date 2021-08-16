import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataServiceService } from '../data-service.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  providers: [Camera],
})
export class Tab3Page {
  contact: any;
  id: string;
  userRef: any;
  base64Image;

  contactForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private camera: Camera,
    public actionSheetController: ActionSheetController,
    private alertCtrl: AlertController
  ) {
    this.id = this.route.snapshot.paramMap.get('id');

    this.dataService.getUserDoc(this.id).subscribe((res) => {
      this.contact = res;
      this.contactForm = this.formBuilder.group({
        firstName: [this.contact.firstName, Validators.required],
        lastName: [this.contact.lastName, Validators.required],
        designation: [this.contact.designation, Validators.required],
        email: [this.contact.email, [Validators.required, Validators.email]],
        longitude: [this.contact.longitude, Validators.required],
        latitude: [this.contact.latitude, Validators.required],
        phoneNumbers: this.formBuilder.array(this.contact.phoneNumbers),
      });
    });
  }

  onInit() {}

  get alternatePhoneNumbers() {
    return this.contactForm.get('phoneNumbers') as FormArray;
  }

  addAlternatePhoneNumber() {
    this.alternatePhoneNumbers.push(this.formBuilder.control(''));
  }

  onSubmit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.dataService.edit(this.contactForm.value, id, this.base64Image);
    this.router.navigate(['']);
    this.showSuccessfulUpdate();
  }

  async openCamera() {
    const cameraOptions: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      mediaType: this.camera.MediaType.PICTURE,
    };

    await this.camera.getPicture(cameraOptions).then(
      (imageData) => {
        this.base64Image = 'data:image/jpeg;base64,' + imageData;
      },
      (err) => {}
    );
  }

  openGallery() {
    const galleryOptions: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
    };

    this.camera.getPicture(galleryOptions).then(
      (imageData) => {
        this.base64Image = 'data:image/jpeg;base64,' + imageData;
      },
      (err) => {}
    );
  }

  async selectImage(e) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select image',
      buttons: [
        {
          text: 'Gallery',
          handler: () => {
            this.openGallery();
          },
        },
        {
          text: 'Camera',
          handler: () => {
            this.openCamera();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  async showSuccessfulUpdate() {
    const alert = await this.alertCtrl.create({
      cssClass: 'basic-alert',
      header: 'Updated',
      subHeader: 'Contact Updated successfully.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}
