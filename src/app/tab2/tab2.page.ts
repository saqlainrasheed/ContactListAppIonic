import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataServiceService } from '../data-service.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  providers: [Camera],
})
export class Tab2Page {
  longitude = 30393.2;
  latitude = 399309.3;
  contactForm: FormGroup;
  submitted: false;
  picture: any;
  base64Image: string;
  selectedFile: File = null;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataServiceService,
    private router: Router,
    private camera: Camera,
    public actionSheetController: ActionSheetController
  ) {
    this.findMyLocation('longitude');
    this.findMyLocation('latitude');
    this.initForm();
  }

  onInit(): void {}

  initForm() {
    this.contactForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      designation: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      longitude: [this.longitude, Validators.required],
      latitude: [this.latitude, Validators.required],
      phoneNumbers: this.formBuilder.array([]),
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  get alternatePhoneNumbers() {
    return this.contactForm.get('phoneNumbers') as FormArray;
  }

  addAlternatePhoneNumber() {
    this.alternatePhoneNumbers.push(this.formBuilder.control(''));
  }

  findMyLocation(cortinate) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (cortinate === 'longitude') {
          this.longitude = position.coords.longitude;
        } else {
          this.latitude = position.coords.latitude;
        }
      });
    }
  }

  async onSubmit() {
    this.dataService.addData(this.contactForm.value, this.base64Image);
    this.router.navigate(['']);
  }

  onDiscard() {
    this.submitted = false;
    this.contactForm.reset();
    this.alternatePhoneNumbers.controls = [];
    this.alternatePhoneNumbers.reset();
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
      (err) => {
        // Handle error
      }
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
      (err) => {
        console.log(err);
      }
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
}
