import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ColorReference } from '../model/ColorReference';

@Injectable({
  providedIn: 'root'
})
export class ReferenceService {
  colRefList : ColorReference[];
  colRefListObs : BehaviorSubject<ColorReference[]>;

  constructor() { 
    this.colRefList = [];
    this.colRefListObs = new BehaviorSubject<ColorReference[]>(this.colRefList);
  }

  /**
   * Asigna el valor de la lista colRefList a la variable de clase 'colRefList' y actualiza el observable.
   * 
   * @param colRefList Lista de tipo ColorReference
   */
  setColorReferences(colRefList: ColorReference[]){
    this.colRefList = colRefList;
    this.colRefListObs.next(this.colRefList);

  }

  /**
   * Devuelve la colRefList actual.
   * 
   * @returns Lista de tipo ColorReference contenida en la variable de clase colRefList.
   */
  getColorReferenceList(){
    return this.colRefList;
  }
}
