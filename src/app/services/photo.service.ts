import { Injectable } from '@angular/core';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import {  Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
  private platform:any = Platform;
  constructor( platform: Platform ) {
    this.platform = platform;
   }

  public async addNewToGallery() {
    // Take a photo
    const capturePhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    // Save the picture and add it to the photo collections
    var savedImageFile:any = await this.savePicture(capturePhoto) ;
    this.photos.unshift(savedImageFile);

    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    })
  }
  
  private async savePicture(photo: Photo){
    // Save the file to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);

    // write the file to the data dicrectory
    const fileName = Date.now()+'.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    })

    if(this.platform.is("hybrid")){
      // Display the new image by rewriting the 'file://' path to http
      return {
        filePath : savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri)
      }
    }
    // Use webpath to display the new image instead of base64 since it's
    // already loaded into the memory
    return {
      filePath: fileName,
      webviewPath: photo.webPath
    }  
  }

  private async readAsBase64(photo: Photo){

    // "hybrid" will detect cordova or capacitor
    if(this.platform.is("hybrid")) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path!
      })
      return file.data;
    }else {
      // Fetch The photo, read as a blob, then convert to base64 format
      const response  = await fetch(<any>photo.webPath);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  public async loadSaved() {
    // retrieve cached photo array data
    const { value } = await Preferences.get({key: this.PHOTO_STORAGE});
    this.photos = ( value ? JSON.parse(value) : [] ) as UserPhoto[];

    // Easiest way to detect when running on the web;
    // When the platform is not hybrid do this
    if(!this.platform.is('hybrid')){
      // Display the photos by reading into base64 format
      for(let photo of this.photos) {
        // Read each saved photo's data from the file system
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data
        })

        // Web Platform only load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }  
    

  }
  public async deletePicture(photo: UserPhoto, position: number){
    // Remove this picture from the photo reference data array
    this.photos.splice(position, 1);
    // update the photos array cache by overwriting the exsisting photo array
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    }) 

    // delete photo from the file system
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/')+1);

    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data
    })
  }
}

export interface UserPhoto {
  filepath: string;
  webviewPath: string; 
}
