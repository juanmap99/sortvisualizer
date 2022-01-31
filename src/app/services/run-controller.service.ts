import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EstadoEjecucionM } from '../model/EstadoEjecucionM';
import { SortAlgorithm } from '../model/SortAlgorithm';
import { ArrayControllerService } from './array-controller.service';

@Injectable({
  providedIn: 'root'
})
export class RunControllerService {
  sortAlgorithm? : SortAlgorithm;
  runningMode? : string;
  running : boolean;
  delay? : number;
  runObs : BehaviorSubject<boolean>;
  estadoModoManual : EstadoEjecucionM = {estadoVariables:[],codPasoRealizar:0};

  /**
   * Constructor del servicio.
   * 
   * @param arrServ Servicio que nos ofrece funcionalidades para realizar el control el array a visualizar
   * y ejercer cambios sobre el mismo
   */
  constructor(private arrServ : ArrayControllerService) { 
    this.running = false;
    this.runObs = new BehaviorSubject<boolean>(this.running);
  }

  /**
   * Setea la variable de clase 'sortAlgoritm' con el valor otorgado por parametro.
   * 
   * @param sortAlg instancia de tipo SortAlgorithm
   */
  setSortingAlgorithm(sortAlg : SortAlgorithm){
    this.sortAlgorithm = sortAlg;
  }

  /**
   * Setea la variable de clase 'runningMode' con el valor otorgado por parametro.
   * 
   * @param runMode String que representa el modo de ejecucion
   */
  setRunningMode(runMode : string){
    this.runningMode = runMode;
  }

  /**
   * Setea la variable de clase 'delay' con el valor otorgado por parametro.
   * 
   * @param delay Entero que representa el delay deseado por el usuario
   */
  setDelayTime(delay : number){
    this.delay = delay;
  }

  /**
   * Corre el programa en su modo de ejecucion automatico siempre y cuando
   * se hayan definido los parametros necesarios para realizar la ejecucion
   * 
   */
  async runAutomaticSorting(){
    if(this.sortAlgorithm && this.runningMode && this.delay){
      this.running = true;
      this.runObs.next(this.running);
      
      await this.sortAlgorithm.sort(this.arrServ.getCurrentArray(),this.delay);
      this.stopProgram();
    }
  }

  /**
   * Realiza el siguiente paso siempre y cuando el modo de ejecucion sea manual y asigna
   * el siguiente estado a la variable de clase 'estadoModoManual' para en el siguiente
   * llamado saber que enviar.
   * 
   */
  async runManualSortingStep(){
    if(this.running && this.sortAlgorithm && this.runningMode && this.runningMode == "manual"){
      await this.sortAlgorithm.siguientePaso(this.estadoModoManual);
      this.estadoModoManual = this.sortAlgorithm.calcularSiguienteEstado(this.estadoModoManual);
      if(this.estadoModoManual.codPasoRealizar == -1){
        this.stopProgram();
      }
    }
  }

  /**
   * Detiene la ejecucion del programa y actualiza el observable de la variable
   * booleane 'running' con el valor false.
   */
  stopProgram(){
    if(this.sortAlgorithm){
      this.sortAlgorithm.stopExecution();
    }
    this.running = false;
    this.runObs.next(this.running);
    if(this.runningMode && this.runningMode == "manual"){
      this.estadoModoManual = {estadoVariables:[],codPasoRealizar:0};
    }
  }

  /**
   * Cambia el valor de variable boolena 'running' a true indicando que inicio la ejecucion
   * del programa ya sea en modo manual o automatico y actaliza el obserbable.
   */
  activateRunningMode(){
    this.running = true;
    this.runObs.next(this.running);
  }

  /**
   * Devuelve el valor de la variable de clase 'running' que representa si el programa
   * esta siendo ejecutado o no.
   * 
   * @returns Variable booleana que representa si el programa esta corriendo.
   */
  isRunning(){
    return this.running;
  }
}
