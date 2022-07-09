import { ComponentFactory, ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ModalSize } from '../model/ModalSize';
import { QsModalComponent } from '../qs-modal/qs-modal.component';
import { CodeModalComponent } from '../code-modal/code-modal.component';
import { BubbleSModalComponent } from '../bubble-s-modal/bubble-s-modal.component';
import { HeapsModalComponent } from '../heaps-modal/heaps-modal.component';
import { MergesModalComponent } from '../merges-modal/merges-modal.component';
import { SelectionSModalComponent } from '../selection-s-modal/selection-s-modal.component';
import { InsertionSModalComponent } from '../insertion-s-modal/insertion-s-modal.component';


@Injectable({
  providedIn: 'root'
})
export class ModalService {
  modalInstance! : ComponentRef<any>//Holds de instance
  modalObserver! : Subject<string>;//We create a subject with random type, because we just want to notify the parent on destroy
  modalSize : ModalSize = {modalWidth:0, modalHeight:0};
  modalSizeObs : BehaviorSubject<ModalSize>;

  /**
   * Constructor del servicio.
   * @param factoryResolver Servicio utilizado para obtener la fabrica de un componente
   */
  constructor(private factoryResolver: ComponentFactoryResolver) {
    this.modalSizeObs = new BehaviorSubject<ModalSize>(this.modalSize);
   }

  /**
  * Abre el modal al cual referencia 'explId' insertandolo sobre 'hostContainer'.
  * 
  * @param hostContainer instancia de ViewContainerRef sobre la cual agregaremos la modal
  * @param explId String que representa la explicacion de que algoritmo se desea mostrar
  * @returns Observable del modal.
  */
  openExplanationModal(hostContainer : ViewContainerRef, explId: string){
    let modalFactory = this.getModalFactory(explId);//Trae la fabrica
    this.modalInstance = hostContainer.createComponent(modalFactory);//Crea el componente dentro del hostContainer
    this.modalInstance.instance.closeModalEvent.subscribe(() => this.closeModal());
    this.modalObserver = new Subject<string>();//Usamos subject porque no precisa instanciarlo con un valor.
    return this.modalObserver.asObservable();
  }

  /**
   * Abre el modal al cual referencia 'codeId' insertandolo sobre 'hostContainer'
   * 
   * @param hostContainer instancia de ViewContainerRef sobre la cual agregaremos la modal
   * @param codeId String que representa el codigo de que algoritmo se desea mostrar
   * @returns Observable del modal.
   */
  openCodeModal(hostContainer :ViewContainerRef, codeId: string){
    let modalFactory = this.factoryResolver.resolveComponentFactory(CodeModalComponent);//Brings factory
    this.modalInstance = hostContainer.createComponent(modalFactory);
    this.modalInstance.instance.codeId = codeId;
    this.modalInstance.instance.codeLinesArray = this.modalInstance.instance.loadCodeFromFile();
    this.modalInstance.instance.closeModalEvent.subscribe(() => this.closeModal());
    this.modalObserver = new Subject<string>();//Subject doesn't need value on creating
    return this.modalObserver.asObservable();
  }

  /**
   * Retorna la fabrica del componente identificado por 'elemId'.
   * 
   * @param elemId String que representa la explicacion de que algoritmo se desea mostrar
   * @returns ComponentFactory del componente identificado por 'elemId'.
   */
  getModalFactory(elemId: string): ComponentFactory<any>{
    switch(elemId){
      case("BubbleSort"):
        return this.factoryResolver.resolveComponentFactory(BubbleSModalComponent);
      case("HeapSort"):
        return this.factoryResolver.resolveComponentFactory(HeapsModalComponent);
      case("MergeSort"):
        return this.factoryResolver.resolveComponentFactory(MergesModalComponent);
      case("SelectionSort"):
        return this.factoryResolver.resolveComponentFactory(SelectionSModalComponent);
      case("InsertionSort"):
        return this.factoryResolver.resolveComponentFactory(InsertionSModalComponent);
      default: // El default es el QuickSort.
        return this.factoryResolver.resolveComponentFactory(QsModalComponent);
    }
  }

  /**
   * Cierra la modal.
   */
  closeModal(){
    this.modalObserver.next("Closing.");
    this.modalObserver.complete();
    this.modalInstance.destroy();
  }

  /**
   * Calcula el ancho y alto en px que tendra la modal en base al tamaño de la pantalla
   * y actualizar el observable.
   * 
   * @param screenWidth Valor que representa el ancho de la pantalla en px
   * @param screenHeight Valor que representa el alto de la pantalla
   */
  calculateModalSize(screenWidth:number, screenHeight:number){
    let width = 1270 > screenWidth ? 1270 : screenWidth;
    let height = 850 > screenHeight ? 850 : screenHeight;
    this.modalSize.modalWidth = width*0.40;
    this.modalSize.modalHeight = height*0.70;
    this.modalSizeObs.next(this.modalSize);
  }

  setModalSize(totalWidth:number,totalHeight:number){
    this.modalSize.modalWidth = totalWidth*0.40;
    this.modalSize.modalHeight = totalHeight*0.70;
    this.modalSizeObs.next(this.modalSize);
  }
}
