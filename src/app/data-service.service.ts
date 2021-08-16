import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import {
  AngularFireStorage,
  AngularFireStorageModule,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class DataServiceService {
  base64Image: string;
  selectedFile: File = null;
  downloadURL: Observable<string>;
  private data: any;

  constructor(
    private store: AngularFirestore,
    private storage: AngularFireStorage
  ) {
    this.data = this.store
      .collection('contacts')
      .valueChanges({ idField: 'id' });
  }

  getData() {
    return this.data;
  }

  addData(item: any, file) {
    return new Promise<any>((resolve, reject) => {
      this.store
        .collection('contacts')
        .add(item)
        .then(
          async (res) => {
            const imageUrl = await this.upload(res.id, file);

            this.store
              .collection('contacts')
              .doc(res.id)
              .update({
                id: res.id,
                imageUrl: imageUrl || null,
              });
          },
          (err) => reject(err)
        );
    });
  }

  async upload(id, image): Promise<any> {
    if (image) {
      try {
        const file: any = this.base64ToImage(image);
        const task = await this.storage.ref('/Images').child(id).put(file);
        return this.storage.ref(`Images/${id}`).getDownloadURL().toPromise();
      } catch (error) {
        console.log(error);
      }
    }
  }

  base64ToImage(dataURI) {
    const fileDate = dataURI.split(',');
    const byteString = atob(fileDate[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: 'image/png' });
    return blob;
  }

  deleteData(contact: any) {
    if (contact.imageUrl) {
      this.storage.ref(`Images/${contact.id}`).delete();
    }
    this.store.collection('contacts').doc(contact.id).delete();
  }

  search(query: string) {
    return this.store
      .collection('contacts', (ref) => ref.orderBy('email').startAt(query))
      .valueChanges();
  }

  async edit(contact: any, id: any, image) {
    if (contact.imageUrl) {
      this.storage.ref(`Images/${contact.id}`).delete();
    }

    this.store
      .collection('contacts')
      .doc(id)
      .update({
        firstName: contact.firstName,
        lastName: contact.lastName,
        designation: contact.designation,
        email: contact.email,
        phoneNumbers: contact.phoneNumbers,
        longitude: contact.longitude,
        latitude: contact.latitude,
      })
      .then(
        async (res) => {
          const imageUrl = await this.upload(id, image);

          this.store
            .collection('contacts')
            .doc(id)
            .update({
              imageUrl: imageUrl || null,
            });
        },
        (err) => {}
      );
  }

  getUserDoc(id) {
    return this.store.collection('contacts').doc(id).valueChanges();
  }
}
