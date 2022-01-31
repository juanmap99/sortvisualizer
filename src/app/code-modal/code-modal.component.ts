import { Component, EventEmitter, Output } from '@angular/core';

import { faTimes, faSun } from '@fortawesome/free-solid-svg-icons';
import { ModalSize } from '../model/ModalSize';
import { ModalService } from '../services/modal.service';
import { ClipboardService } from 'ngx-clipboard';

import { faCopy, faMoon } from '@fortawesome/free-regular-svg-icons';

import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarCodeCopiedComponent } from '../snack-bar-code-copied/snack-bar-code-copied.component';


@Component({
  selector: 'app-code-modal',
  templateUrl: './code-modal.component.html',
  styleUrls: ['./code-modal.component.css']
})
export class CodeModalComponent {
  @Output() closeModalEvent = new EventEmitter();
  modalWidth : number = 0;
  modalHeight : number = 0;
  codeId : string = "";
  closeButton = faTimes;
  copyButton = faCopy;
  darkButton = faMoon;
  lightButton = faSun;
  codeLinesArray : string[] = [];
  codeRaw : string = "";//To enable user copying the code
  darkMode : boolean = true;
  classDic = new Map([
    [' ','default-code-dark'],
    ['$s','syntax-code-dark'],
    ['$u','number-code-dark'],
    ['$f','lg-function-code-dark'],
    ['$d','us-function-code-dark']
  ]);

  /**
   * Modal component constructor.
   * 
   * @param modalServ Servicio que se encarga de manejar los Modal(tanto los usados para hacer
   * el display de la explicación del codigo como a su vez el display del codigo del algoritmo)
   * @param http Servicio Http client utilizado en esta clase para leer los archivos txt de la
   * carpeta assets para hacer un display del codigo que se solicite.
   * @param clipServ Servicio que permite copiar texto a la clipboard del usuario.
   * @param _snackBar Servicio utilizado para notificar a traves de una snacback que el codigo fue copiado
   * con exito el momento que el usuario asi lo solicite.
   */
  constructor(private modalServ: ModalService,
              private http: HttpClient,
              private clipServ : ClipboardService,
              private _snackBar: MatSnackBar) { 
    this.modalServ.modalSizeObs.subscribe((newSize)=> this.setNewSize(newSize));
  }

  /**
   * Copia el codigo del algoritmo seleccionado en la clickboard y a traves del snackbar service
   * notifica al usuario que el mismo fue copiado con exito.
   */
  copyToClickboard(){
    this.clipServ.copyFromContent(this.codeRaw);
    this._snackBar.openFromComponent(SnackBarCodeCopiedComponent,{
      duration : 3000
    });
  }

  /**
   * Setea el "Theme" del codigo a la alternativa opuesta a la actual, teniendo como opciones
   * 'Light' y 'Dark', siendo 'Dark' la que viene definida por default.
   */
  switchThemeColor(){
    this.darkMode = !this.darkMode;
    if(this.darkMode){
      this.classDic = new Map([
        [' ','default-code-dark'],
        ['$s','syntax-code-dark'],
        ['$u','number-code-dark'],
        ['$f','lg-function-code-dark'],
        ['$d','us-function-code-dark']
      ]);
    }
    else{
      this.classDic = new Map([
        [' ','default-code-white'],
        ['$s','syntax-code-white'],
        ['$u','number-code-white'],
        ['$f','lg-function-code-white'],
        ['$d','us-function-code-white']
      ]);
    }
  }

  /**
   * Setea el tamaño en largo y ancho de la modal.
   * 
   * @param newSize Instancia de ModalSize
   */
  setNewSize(newSize: ModalSize){
    this.modalWidth = newSize.modalWidth;
    this.modalHeight = newSize.modalHeight;
  }

  /**
   * Emite un evento 'closeModalEvent' recepcionado por el modal service que se va
   * a encargar de cerrar la modal.
   */
  closeModal(){
    this.closeModalEvent.emit();
  }

  /**
   * Toma la 'codeId' definida por la pestaña en la que se encuentra el usuario para cargar
   * a traves del servicio http la version 'Raw' y la 'normal' del codigo que se encuentra contenido
   * en assets.
   * La version 'Raw' es el codigo sin ningun tipo de modificacion va a ser la utilizada para copiar a la clipboard
   * cuando asi se lo desee. La otra es la que contiene ciertas modificaciones que nos van a permitir
   * hacer un display del mismo con sintaxis coloreada de la manera que lo veriamos en una IDE.
   */
  loadCodeFromFile(){
    let ruta : string = "assets/codigos/"+this.codeId+ ".txt";
    this.http.get(ruta,{
      responseType: 'text'
    }).subscribe(data=>{
      this.loadIntoArray(data);
    })
    
    let rutaRaw : string = "assets/codigos/"+this.codeId+ "Raw.txt";
    this.http.get(rutaRaw,{
      responseType: 'text'
    }).subscribe(rawCode=>{
      this.codeRaw = rawCode;
    })
  }

  /**
   * Carga los contenidos del archivo .txt en la variable de clase 'codeLinesArray' que contiene
   * un array en donde en cada posicion tenemos una linea diferente del archivo .txt
   * @param data Contenidos del archivo .txt
   */
  loadIntoArray(data: string){
    this.codeLinesArray = data.split("\n");
  }

  /**
   * Separa a una linea en segmentos, entendiendo a segmentos como una porcion de texto dentro de una
   * linea que debe ser tratada de una manera diferente al resto de porciones de texto dentro de esa linea.
   * Estos segmentos son utilizados para colorear cada segmento en especifico segun el tipo de sintaxis
   * que sea encerrada a traves del signo '$'.
   * 
   * @param line Una de las lineas contenidas en el archivo .txt cargadas en 'codeLinesArray'
   * @returns Lista de tipo 'string[]' que representa los segmentos diferentes dentro de una linea.
   */
  getLineSegments(line: string): string[]{
    let getSegment = (line : string, iComienzo: number)=>{
      let temp : string[] = [];
      let specialSegment : boolean = line[iComienzo] == '$';
      if(specialSegment){
        temp.push("$");
        iComienzo += 1;
      }
      while(iComienzo < line.length && line[iComienzo] != '$'){
        temp.push(line[iComienzo]);
        iComienzo += 1;
      }
      if(specialSegment){
        temp.push(line[iComienzo]);
        temp.push(line[iComienzo+1]);
        iComienzo += 2;
      }
      return {curIndex:iComienzo,segmento:temp.join("")};
    }
    let segments : string[] = [];
    let temp : string[] = [];
    let j = 0;
    while(j < line.length){
      let segResult = getSegment(line,j);
      j = segResult.curIndex;
      segments.push(segResult.segmento);
    }
    return segments;
  }

  /**
   * Analiza a que clase pertenece un segmento haciendo uso de la variable de clase 'classDic'
   * @param segment Segmento de una linea
   * @returns Retorna un string que representa la clase a la que pertenece el segmento.
   */
  getSegmentClass(segment: string) : string{
    let classBelongs : string = " ";
    let found : boolean = false;
    let j : number = 0;
    while(j<segment.length && !found){
      if(segment[j] == "$"){
        classBelongs = segment[j] + segment[j+1];
        found = true;
      }
      j += 1;
    }
    let result = this.classDic.get(classBelongs);
    if(result){
      return result;
    } 
    return "default-code-dark";//Nunca va a llegar aca
  }

  /**
   * Retorna el texto de un segmento, quitando del mismo la sintaxis especial encerrada
   * entre '$' que se utiliza para que la clase pueda interpretae que tipo de 
   * clase atribuirle al segmento.
   * 
   * @param segment Segmento de una linea
   * @returns Texto de dicho segmento
   */
  getSegmentText(segment: string): string{
    let text : string[]= [];
    let j : number = 0;
    while(j<segment.length){
      text.push(segment[j]);
      if(segment[j] == "$"){
        text.pop();
        j += 1;
      }
      j+=1;
    }
    return text.join("");
  }
}
