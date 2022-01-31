import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Swapper } from '../model/Swapper';
import { ArrayControllerService } from './array-controller.service';

@Injectable({
  providedIn: 'root'
})
export class ArrayColorerService {
  colorList : string[][] = [];
  colorListObs : BehaviorSubject<string[][]>;

  /**
   * Constructor del servicio.
   * 
   * @param arrServ Servicio que nos ofrece funcionalidades para realizar el control el array a visualizar
   * y ejercer cambios sobre el mismo
   */
  constructor(private arrServ: ArrayControllerService) { 
    this.colorListObs = new BehaviorSubject(this.colorList);
    this.arrServ.arrObservable.subscribe(newArr => this.updateColorState(newArr));
  }

  /**
   * Funcion llamada en el momento que el observable del ArrayControllerService obtiene un
   * nuevo array por orden del usuario. Crea una lista de colores en consecuencia al
   * array creado con un color predeterminado.
   * @param newArr Array que representa el array actual.
   */
  updateColorState(newArr: Array<[number,number]>){
    this.colorList = Array(newArr.length).fill(["#00A4E8"]);
    this.updateChanges();
  }

  /**
   * Funcion que permite cambiar el color entre dos posiciones.
   * @param swap instancia valida de la clase Swapper que representa dos indices a swappear.
   */
  syncColors(swap : Swapper){
    let temp = this.colorList[swap.indexA];
    this.colorList[swap.indexA] = this.colorList[swap.indexB];
    this.colorList[swap.indexB] = temp;
    this.updateChanges();
  }

  /**
   * Remueve el color 'color' de la posicion 'index'.
   * @param index Indice que representa la posicion a cambiar
   * @param color Color a remover
   */
  extractColor(index: number, color: string){
    if(this.colorList[index].length == 1 && this.colorList[index][0] == color){
      this.revertToDefault(index);
    }
    else if(this.colorExistsInIndex(index,color)){
      let deleteElem = (cList: string[],elem: string) =>{
        let newList : string[] = [];
        for(let i=0; i< cList.length; i+=1){
          if(cList[i] != elem){newList.push(cList[i]);}
        }
        return (newList.length != 0) ? newList : ["#00A4E8"];
      };
      this.colorList[index] = deleteElem(this.colorList[index], color);
      this.updateChanges();
    }
  }

  /**
   * Devuelve true en caso que el color exista en el indice, false en caso contrario.
   * @param index Indice que representa la posicion a analizar
   * @param color String que representa color
   * @returns True en caso que el color exista en el indice, false en caso contrario.
   */
  colorExistsInIndex(index: number, color: string){
    for(let i=0; i < this.colorList[index].length; i++){
      if(this.colorList[index][i] == color){
        return true;
      }
    }
    return false;
  }

  /**
   * Agrega el color 'color' sobre el indice 'index' siempre y cuando dicho color no 
   * se encuentre presente.
   * 
   * @param index Indice que representa la posicion sobre la cual agregar el color
   * @param color Color a agregar
   */
  addColor(index: number, color: string){
    if(this.colorList[index][0] == "#00A4E8"){
        this.colorList[index] = [color];
        this.updateChanges();
    }
    else if(!this.colorExistsInIndex(index,color)){
      this.colorList[index] = this.colorList[index].concat(color);
      this.updateChanges();
    }
  }

  /**
   * Devuelve el color de un indice a su estado default.
   * 
   * @param indice Idice que representa la posicion sobre la cual realizar el cambio
   */
  revertToDefault(indice: number){
    this.colorList[indice] = ["#00A4E8"];
    this.updateChanges();
  }

  /**
   * Remueve todos los indices a su estado default.
   * 
   */
  revertEverythingToDefault(){
    this.colorList = Array(this.arrServ.arr.length).fill(["#00A4E8"]);
    this.updateChanges();
  }

  /**
   * Actualiza el observable otorgandole la colorList actual.
   */
  updateChanges(){
    this.colorListObs.next(this.colorList);
  }

  /**
   * Retorna la colorList actual.
   * 
   * @returns colorList actual.
   */
  getColorList(){
    return this.colorList;
  }
}
