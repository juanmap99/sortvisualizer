import { Component, HostListener, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { QuickSort} from './model/sorting-alg/QuickSort';
import { RunParams } from './model/RunParams';
import { SortAlgorithm } from './model/SortAlgorithm';
import { Subscription, timer } from 'rxjs';

import { ArrayControllerService } from './services/array-controller.service';
import { ArrayColorerService } from './services/array-colorer.service';
import { ModalService } from './services/modal.service';
import { ReferenceService } from './services/reference-service';
import { RunControllerService } from './services/run-controller.service';
import { BubbleSort } from './model/sorting-alg/BubbleSort';
import { HeapSort } from './model/sorting-alg/HeapSort';
import { MergeSort } from './model/sorting-alg/MergeSort';
import { AuxVarService } from './services/aux-var.service';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { AuxiliarVariable, DisplayStatus } from './model/AuxiliarVariable';
import { SelectionSort } from './model/sorting-alg/SelectionSort';
import { InsertionSort } from './model/sorting-alg/InsertionSort';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild("modalContainer", { read: ViewContainerRef })
  modalContainer!: ViewContainerRef;

  title = 'sortvisualizer';
  public scWidth: any;
  public scHeight: any;
  running : boolean;
  algoritmoElegido : string;
  sortAlgInstance : SortAlgorithm;
  modalWidth : number = 0;
  modalHeight : number = 0;
  openModal : boolean = false;
  segundos : number = 0;
  milisegundos : number = 0;
  minutos : number = 0;
  tenMsTimer = timer(0,10);
  timerObs? : Subscription;
  timerDesired : boolean = false;
  auxVariableExist : boolean = false;
  modoManualOn : boolean = false;
  modoManualDisabled : boolean = false;
  auxVarList : AuxiliarVariable[] = [];
  threeDots  = faEllipsisH;

  /**
   * Constructor del app component.
   * 
   * @param arrService Servicio que nos ofrece funcionalidades para realizar el control el array a visualizar
   * y ejercer cambios sobre el mismo
   * @param colorServ Servicio que ofrece funcionalidades para definir los colores de los indices de los
   * elementos del array.
   * @param colRefServ Servicio que nos ofrece funcionalidades para manejar las referencias propias a cada algoritmo
   * @param runServ Servicio a traves del cual podemos setear los parametros de ejecucion y realizar
   * la ejecucion ya sea manual o automatica del algoritmo elegido.
   * @param modalServ Servicio a traves del cual se muestran las diversas modal en pantalla.
   * @param auxServ Servicio que nos ofrece diversas funcionalidades para definir y alterar
   * variables auxiliares que son usadas por diversos algoritmos.
   */
  constructor(private arrService: ArrayControllerService,
              private colorServ : ArrayColorerService,
              private colRefServ: ReferenceService,
              private runServ: RunControllerService,
              private modalServ: ModalService,
              private auxServ : AuxVarService){
    this.running = false;
    this.algoritmoElegido = "QuickSort";
    this.sortAlgInstance = this.instanciateSortAlg(this.algoritmoElegido);
    this.runServ.runObs.subscribe(newState => this.changeRunningState(newState));
    this.auxServ.auxVarListObs.subscribe(newAuxVarList => {
      this.auxVarList = newAuxVarList;
      this.auxVariableExist = this.auxVarList.length > 0;
      this.updateDisplayStatus();
    })
  }

  /**
   * Funcion que corre en el 'init' que llamara a una funcion que actualizar el valor
   * de toda variabla dependiente del tamaño de la pantalla del usuario.
   */
  ngOnInit(): void {
    this.updateSizeDependantVar();
  }

  /**
   * Cambia la variable local 'running' a true en los casos en donde el algoritmo este ejecutandose
   * y en false en casos contrarios. A su vez se desuscribe a la variable que se encarga de hacer un
   * recording del tiempo de ejecucion del algoritmo en el momento que el algoritmo pare su ejecucion.
   * @param newState Estado de ejecucion.
   */
  changeRunningState(newState: boolean){
    this.running = newState;
    if(this.running == false){
      this.timerObs?.unsubscribe();
    }
  }

  /**
   * Funcion que se llama cuando el usuario varia el valor de la slide que referencia al tamaño del array,
   * indicandole al 'arrService' que actualize su array en concordancia al nuevo tamaño establecido por el usuario.
   * @param newSize Valor numerico que representa el tamaño del array
   */
  triggerArrayUpdate(newSize: number){
    this.arrService.updateArray(newSize);
  }

  /**
   * Realiza la ejecucion del programa, sease a traves de su modo automatico o manual.
   * @param params Parametros definidos por el usuario
   */
  async runProgram(params : RunParams){
    //Seteamos running mode
    this.runServ.setRunningMode(params.useMode);
    //Calculamos el delay en base a velocidad elegida
    let speedToDelayDic = [500,250,100,60,30];
    let delay = speedToDelayDic[params.runSpeed -1];
    this.runServ.setDelayTime(delay);
    //Mandamos la instancia de sortAlg como algoritmo a correr
    this.runServ.setSortingAlgorithm(this.sortAlgInstance);
    //Segun el modo de uso corremos
    if(params.useMode == "automatic"){
      this.modoManualOn = false;
      this.runServ.runAutomaticSorting();
      if(params.timerDesired){
        this.timerDesired = true;
        this.startTimer();
      }
    }
    else{
      this.runServ.activateRunningMode();
      this.timerDesired = false;
      this.modoManualOn = true;
    }
  }

  /**
   * Realiza el siguiente paso en el contexto de ejecucion manual cuando el usuario presiona
   * sobre el boton 'Next Step'
   */
  async doNextStep(){
    this.modoManualDisabled = true;
    await this.runServ.runManualSortingStep();
    this.modoManualDisabled = false;
  }

  /**
   * Comienza el timer que se utilizara para mostrar por pantalla en el contexto de ejecucion
   * automatica el tiempo que le lleva al algoritmo completar con el ordenamiento en pos
   * que sirva como margen de comparación y evidencie la complejidad temporal del mismo.
   */
  startTimer(){
    let addMinute = ()=>{
      this.minutos += 1;
    }

    let addSecond = () =>{
      if(this.segundos == 59){
        addMinute();
        this.segundos = 0;
      }
      else{
        this.segundos += 1;
      }
    }
    let addMilisecond = ()=>{
      if(this.milisegundos == 99){
        addSecond();
        this.milisegundos = 0;
      }
      else{
        this.milisegundos += 1;
      }
    }
    this.segundos = 0;
    this.minutos = 0;
    this.milisegundos = 0;

    this.timerObs = this.tenMsTimer.subscribe(() => {
      addMilisecond();
    });
  }

  /**
   * Instancia la clase del algoritmo seleccionado en la Toolbar. Esto lo hacemos no solo para
   * saber que algoritmo correr en la ejecucion sino debido a que en el momento en el cual se instancia
   * de clase se intancian las referencias que el algoritmo utilizara en su ejecucion, de manera tal que
   * el usuario pueda revisarlas previo a la ejecución del mismo.
   * 
   * @param algName Nombre del algoritmo. Variaria de acuerdo a la tab seleccionada el la Toolbar
   * @returns Instancia del algoritmo deseado instanciada. 
   */
  instanciateSortAlg(algName: string) : SortAlgorithm {
    switch(algName){
      case("BubbleSort"):
        return new BubbleSort(this.colorServ,this.arrService,this.colRefServ,this.auxServ);
      case("HeapSort"):
        return new HeapSort(this.colorServ,this.arrService,this.colRefServ,this.auxServ);
      case("MergeSort"):
        return new MergeSort(this.colorServ,this.arrService,this.colRefServ,this.auxServ);
      case("SelectionSort"):
        return new SelectionSort(this.colorServ,this.arrService,this.colRefServ,this.auxServ);
      case("InsertionSort"):
        return new InsertionSort(this.colorServ,this.arrService,this.colRefServ,this.auxServ);
      default: // El default es el QuickSort.
        return new QuickSort(this.colorServ,this.arrService,this.colRefServ,this.auxServ);
    }

  }

  /**
   * Define la variable de clase 'algoritmoElegido' en concordancia con lo elegido en la toolbar
   * y llama al metodo que instancia el mismo. A su vez, detiene la ejecucion del algoritmo
   * en el caso que se cambie a otra toolbar en el momento en el que otro algoritmo estaba
   * siendo ejecutado.
   * @param algoritmoElegido Algoritmo elegido en la toolbar
   */
  setCurrentSortAlg(algoritmoElegido: string){
    if(this.algoritmoElegido != algoritmoElegido &&
      this.running){
        this.runServ.stopProgram();
      }
    this.algoritmoElegido = algoritmoElegido;
    this.sortAlgInstance = this.instanciateSortAlg(algoritmoElegido);
  }

  /**
   * Funcion que llama al a funcion que actualiza toda variable dependiente del tamaño de la pantalla del usuario
   * en el momento que existe un resize.
   */
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.updateSizeDependantVar();
  }

  /**
   * Actualiza todas las variables dependientes del tamaño. Definimos a su vez
   * que el tamaño de width minimo de nuestra pagina sera de 1270 pixeles de largo
   * por 800 pixeles de alto.
   */
  updateSizeDependantVar(){
    this.scWidth = window.innerWidth < 1270 ? 1270 : window.innerWidth;
    this.scHeight = window.innerHeight < 800 ? 800 : window.innerHeight;
    this.modalServ.calculateModalSize(this.scWidth,this.scHeight);
    this.modalWidth = this.modalServ.modalSize.modalWidth;
    this.modalHeight = this.modalServ.modalSize.modalHeight;
  }

  /**
   * Devuelve la altura en pixeles del cuerpo de la pagina exceptuando la toolbar
   * que se encuentra por encima de ello.
   * @returns Altura de la seccion en donde se encontrara el cuerpo de la pagina. 
   */
  getBodyHeight(){
    let height = this.scHeight - 75;//75px de la nav bar
    return height < 850 ? 850 : height
  }

  /**
   * Retorna la longitud maxima posible que puede tomar el array restando el tamaño
   * maximo que ocupa la barra de configuracion y referencias
   * @returns Retorna la longitud maxima posible que puede tomar el contenedor del array
   */
  getArrMaxWidth(){
    return this.scWidth - 450;
  }

  /**
   * Llama al servicio que maneja la ejecucion del programa indicandole que detenga la ejecucion
   */
  killSortingProcess(){
    this.runServ.stopProgram();
  }

  /**
   * Utiliza el servicio que maneja las modals para que haga un display de la explicación
   * del algoritmo actualmente elegido
   */
  displayExplanationModal(){
    this.openModal = true;
    this.modalServ.openExplanationModal(this.modalContainer, this.algoritmoElegido)
                 .subscribe(() =>{
                   this.openModal = false;
                 })
  }

   /**
   * Utiliza el servicio que maneja las modals para que haga un display del codigo
   * del algoritmo actualmente elegido
   */
  displayCodeModal(){
    this.openModal = true;
    this.modalServ.openCodeModal(this.modalContainer, this.algoritmoElegido)
                 .subscribe(() =>{
                   this.openModal = false;
                 })
  }

  /**
   * Restablece los valores del timer a 0 y le otorga el valor 'true' o 'false' dependiendo
   * de si el usuario desea un timer o no.
   * 
   * @param timerDesired Variable booleana que representa si el usuario desea un timer o no
   */
  changeTimerDisplayingState(timerDesired : boolean){
    this.milisegundos = 0;
    this.minutos = 0;
    this.segundos = 0;
    this.timerDesired = timerDesired;
  }

  /**
   Utiliza el servicio que maneja las modals para indicarle que cierre la misma
   */
  closeModal(){
    this.modalServ.closeModal();
  }

  /**
   * Define el ancho que puede ocupar cada indice del array de la variable auxiliar
   * en concordancia con la naturaleza del valor de cada indice
   * @param value Valor del indice
   * @returns Width que tomaran los indices de la variable auxilar.
   */
  defineAuxVarWidth(value : any){
    if(value == undefined){
      return "10000";//Para que el display sea 0
    }
    else if(value.iLeft != undefined && value.iRight != undefined){
      return "90";
    }
    else if(value.length == 2){
      return "90";
    }
    return "45";
  }

  /**
   * De acuerdo a la naturaleza del valor, define la manera que lo mostraremos por pantalla.
   * 
   * @param val Valor de la variable auxiliar
   * @returns Valor que una posicion de la variable auxiliar mostrara por pantalla
   */
  defineAuxText(val : any){
    if(val.iLeft != undefined && val.iRight != undefined){
      return "["+ val.iLeft + ","+ val.iRight + "]";
    }
    else if(val.length == 2){
      return "["+ val + "]";
    }
    return val;
  }

  /**
   * Define el background color una posicion teniendo en cuenta el indice actual(definido por
   * el ngFor en el html) y el iStart sobre el cual esta recorriendo el ngFor en la vista.
   * 
   * @param colorList Lista de colores que define que color debera poseer cada indice
   * @param iStart iStart del display status(explicado en la seccion correspondiente)
   * @param curIndex Indice del ngFor en el html
   * @returns Background color del indice establecido de la variable auxiliar. En caso de no
   * tenerlo se retorna 'transparent'
   */
  getAuxVarBC(colorList : string[], iStart: number, curIndex: number){
    if(colorList[iStart + curIndex] != ""){
        return colorList[iStart + curIndex];
      }
    return "transparent";
  }

  /**
   * Realiza un update del display status en donde se realizan diversos calculos teniendo en cuenta
   * la naturaleza de los valores de las diversas variables y la longitud de la seccion en la que se encuentra
   * para calcular no solo la cantidad de elementos que nos podemos permitir mostrar por pantalla sino 
   * a su vez definir en base a eso el displayStatus en pos de que en base a eso realizamos el display
   * de ciertos elementos en la vista del html o no.
   */
  updateDisplayStatus(){
    for(let i=0; i<this.auxVarList.length; i++){
      let auxVar = this.auxVarList[i];
      let lenCanDisplay : number = Math.floor(350 / (+this.defineAuxVarWidth(auxVar.data[0])));
      let inStart = lenCanDisplay >= auxVar.dataSize ? 0 : auxVar.priorityIndex;
      let inEnd = inStart + lenCanDisplay >= auxVar.dataSize ? auxVar.dataSize : inStart + lenCanDisplay;
      let displayStatus : DisplayStatus = {
        leftHiding : (auxVar.priorityIndex > 0) &&  (auxVar.dataSize > lenCanDisplay),
        rightHiding :  (auxVar.priorityIndex + lenCanDisplay) < auxVar.dataSize,
        iStart : inStart,
        iEnd : inEnd
        };
      auxVar.displayStatus = displayStatus;
    }
  }
  
}
