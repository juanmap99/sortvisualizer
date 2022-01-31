import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuxiliarVariable, DisplayStatus } from '../model/AuxiliarVariable';

@Injectable({
  providedIn: 'root'
})
export class AuxVarService {
  auxVarList : AuxiliarVariable[] = [];
  auxVarListObs : BehaviorSubject<AuxiliarVariable[]>;

  constructor() { 
    this.auxVarListObs = new BehaviorSubject(this.auxVarList);
  }

  /**
   * Devuelve una variable de tipo AuxiliarVariable en caso que la misma se encuentre contenida
   * en la variable de clase auxVarList, o undefined en caso contrario.
   * 
   * @param key String que representa el nombre de la variable auxiliar
   * @returns instancia valida de 'AuxiliarVariable' o undefined.
   */
  getAuxiliarVariable(key: string){
    for(let i=0; i<this.auxVarList.length; i++){
      if(key == this.auxVarList[i].varName){
        return this.auxVarList[i];
      }
    }
    return undefined;
  }

  /**
   * Devuelve un valor entero que representa la posicion en la que se encuentra la variable
   * con nombre 'key' en la variable de clase auxVarList, o -1 en caso que dicha variable
   * no exista en el array.
   * 
   * @param key String que representa el nombre de la variable auxiliar
   * @returns Indice en donde se encuentra posicionada la variable. -1 en caso que no exista.
   */
  getAuxiliarVariableIndex(key: string){
    for(let i=0; i<this.auxVarList.length; i++){
      if(key == this.auxVarList[i].varName){
        return i;
      }
    }
    return -1;
  }

  /**
   * Crea una lista que define los colores que tendra cada posicion de la variable auxiliar
   * en donde por default el color es inexistente.
   * 
   * @param size Tamaño de la lista
   * @returns Lista que representa los colores de cada posicion
   */
  inicializeDefaultColors(size : number){
    let defaultColors = [];
    for(let i=0; i<size; i+=1){
      defaultColors.push('');
    }
    return defaultColors;
  }

  /**
   * Actualiza el observable con la lista de variables auxiliares actual.
   */
  updateAuxVarChange(){
    this.auxVarListObs.next(this.auxVarList);
  }

  /**
   * Instancia una variable auxiliar de nombre 'auxVarName' con valor 'auxData' y la
   * agrega a la variable de clase 'auxVarList' en caso que no exista, o la modifica
   * en caso que ya se encuentre presente.
   * 
   * @param auxVarName String que representa el nombre de la variable auxiliar
   * @param auxData Data contenida en la variable auxiliar
   */
  setAuxVariable(auxVarName: string, auxData: any){
    let auxVarInstance = this.getAuxiliarVariable(auxVarName);
    if(auxVarInstance == undefined){
      auxVarInstance = {
          varName: auxVarName,
          data: auxData,
          dataSize : auxData.length,
          colorList : this.inicializeDefaultColors(auxData.length),
          priorityIndex : 0,
          displayStatus : {leftHiding:false,rightHiding:false,iStart:0, iEnd:auxData.length-1}
      };
      this.auxVarList.push(auxVarInstance);
    }
    else{
      auxVarInstance.data = auxData;
      auxVarInstance.dataSize = auxData.length;
    }
    this.updateAuxVarChange();
  }

  /**
   * Le otorga a posicion 'index' de la variable auxiliar 'auxVarName' el color 'color'
   * 
   * @param auxVarName String que representa el nombre de la variable auxiliar
   * @param index Indice que representa la posicion dentro de auxData sobre la cual aplicar el color
   * @param color String que representa el color a aplicar
   */
  addColor(auxVarName: string, index: number, color: string){
    let auxVar = this.getAuxiliarVariable(auxVarName);
    if(auxVar != undefined){
      auxVar.colorList[index] = color;
      this.updateAuxVarChange();
    }
  }

  /**
   * Retorna a default el color de la posicion 'index' de la variable 'auxVarName'.
   * 
   * @param auxVarName String que representa el nombre de la variable auxiliar
   * @param index Indice que representa la posicion dentro de auxData la cual se desea cambiar
   */
  revertColorToDefault(auxVarName: string, index: number){
    let auxVar = this.getAuxiliarVariable(auxVarName);
    if(auxVar != undefined){
      auxVar.colorList[index] = "";
    }
    this.updateAuxVarChange();
  }

  /**
   * Elimina la variable auxVarName de la variable de clase auxVarList siempre y cuando
   * se encuentre presente en la misma.
   * 
   * @param auxVarName String que representa el nombre de la variable auxiliar
   */
  deleteAuxVar(auxVarName: string){
    let auxVarIndex = this.getAuxiliarVariableIndex(auxVarName);
    if(auxVarIndex != -1){
      this.auxVarList.splice(auxVarIndex,1);
      this.updateAuxVarChange();
    }
  }

  /**
   * Retorna la lista de variables auxiliares actual comprendidas en la variable de 
   * clase auxVarList
   * 
   * @returns Lista de variables auxiliares actual
   */
  getCurAuxVarList(){
    return this.auxVarList;
  }

  /**
   * Setea el indice 'index' como indice de prioridad dentro de la varaible
   * auxiliar con nombre 'key'
   * 
   * @param key String que representa el nombre de la variable auxiliar
   * @param index Entero que representa el nuevo indice de prioridad.
   */
  setPriorityIndex(key:string, index: number){
    let auxVar = this.getAuxiliarVariable(key);
    if(auxVar != undefined){
      auxVar.priorityIndex = index;
      this.updateAuxVarChange();
    }
  }

  /**
   * Actualiza el display status de la variable auxiliar con nombre 'key' a
   * el 'statusDisplay' otorgado por parametro.
   * 
   * @param key String que representa el nombre de la variable auxiliar
   * @param statusDisplay DisplayStatus de la variable
   */
  setDisplayStatus(key:string, statusDisplay: DisplayStatus){
    let auxVar = this.getAuxiliarVariable(key);
    if(auxVar != undefined){
      auxVar.displayStatus = statusDisplay;
      this.updateAuxVarChange();
    }
  }
}
