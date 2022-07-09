import { Component, HostListener, OnInit } from '@angular/core';

import { ArrayControllerService } from '../services/array-controller.service';
import { ArrayColorerService } from '../services/array-colorer.service';

@Component({
  selector: 'app-array-display',
  templateUrl: './array-display.component.html',
  styleUrls: ['./array-display.component.css']
})
export class ArrayDisplayComponent implements OnInit {
  array : Array<[number,number]> = [];
  colors : string[][] = [];
  public scWidth: any;
  public scHeight: any;
  elWidth : number = 0;
  elMaxHeight : number = 0;
  containerHeight : number = 0;
  containerWidth : number = 0;
  fontSize : number = 100;
  
  /**
   * Constructor del componente.
   * 
   * @param arrService Servicio utilizado para manejar el array
   * @param coloradorServ Servicio utilizado para manejar los colores que cada indice del array tiene atribuido
   * que deben ser mostrados en el display.
   */
  constructor(private arrService : ArrayControllerService,
              private coloradorServ : ArrayColorerService) { 
    this.array = this.arrService.getCurrentArray();
  }

  /**
   * Proceso realizado en el 'onInit' a traves del cual nos suscribiremos a los observables
   * de los diferentes servicios que utilizaremos y actualizaremos variables que determinaran
   * el tamaño de ciertos elementos en concordancia con el tamaño de la pantalla del usuario.
   */
  ngOnInit(): void {
    this.scWidth = window.innerWidth;
    this.scHeight = window.innerHeight;
    this.updateSizeVariables();
    this.arrService.arrObservable.subscribe(newArr => this.updateArrayState(newArr));
    this.coloradorServ.colorListObs.subscribe(newColorSet => this.adjustColors(newColorSet));
  }

  /**
   * Asigna el color set a la variable de clase 'colors'
   * @param colorSet Color set de los indices array.
   */
  adjustColors(colorSet: string[][]){
    this.colors = colorSet;
  }

  /**
   * Setea el color del background de una posicion en caso que la cantidad de colores deseados
   * sea uno solo. En caso contrario el backgroundColor sera transparente ya que haremos un
   * gradiente de colores.
   * 
   * @param colorIndex Lista de colores contenidos en un indice
   * @returns Background color de una posicion.
   */
  calculateBackgroundColor(colorIndex : string[]){
    if (colorIndex.length == 1){
      return colorIndex[0];
    }
    else{
      return "transparent";
    }
  }

  /**
   * Setea un gradiente en donde cada color ocupa porcentualmente una cantidad identica
   * al resto de colores en el caso que tengamos mas de un color. En caso que solo exista
   * un color la backgroundImage sera none ya que aplicaremos directamente un 
   * backgroundColor. Cabe destacar que el gradiente se encuentra definido para un total
   * de 3 colores como maximo debido a que actualmente no contamos con ningun algoritmo
   * a traves del cual un mismo indice vaya a contener mas de 3 colores diferentes.
   * 
   * @param colorIndex Lista de colores contenidos en un indice
   * @returns 
   */
  calculateBackgroundImage(colorIndex: string[]){
    if (colorIndex.length == 1){
      return "none";
    }
    else if (colorIndex.length == 2){
      return "linear-gradient(180deg,"+colorIndex[0]+" 50%,"+colorIndex[1]+" 50%)";
    }
    else{
      let firstPart = colorIndex[0] + " 0," + colorIndex[0] + " 33%";
      let secondPart = colorIndex[1] + " 33%," + colorIndex[1] + " 66%";
      let thirdPart = colorIndex[2] + " 66%," + colorIndex[2] + " 100%";
      return "linear-gradient(180deg,"+firstPart+","+secondPart+","+thirdPart+")";
    }
  }

  /**
   * Calcula la altura de un elemento dado su valor. El calculo lo realizamos a traves
   * de una regla de tres simple en donde multiplicamos el valor del elemento
   * por la altura maxima que tenemos disponible y lo dividimos por la longitud del array*3.
   * El motivo por el cual la longitud del array se encuentra multiplicada por 3 es debido a que
   * cuando inicializamos un array, el valor maximo que permitimos para mantenernos bajo cierta
   * escala y que no quede desproporcionado son los valores que se encuentran contenidos en el
   * rango que va desde 4 hasta la longitud del array*3.
   * @param value Valor del indice
   * @returns Altura en pixeles que debe ocupar en la pantalla.
   */
  calculateElemHeight(value:number){
    return (value*this.elMaxHeight)/(this.array.length*3) ;
  }

  /**
   * Metodo que se encarga de calcular el tamaño de la fuente del valor del array. Para ello
   * se busca el tamaño de fuente optimo teniendo en cuenta la altura y longitud de los elementos.
   * Si una vez realizado el calculo el tamaño de fuente optimo es menor a 8px, se define la misma como 0
   * ya que no es lo suficientemente grande para que pueda ser visualizado con claridad por los ojos del
   * usuario.
   */
  updateFontSize(){
    this.fontSize = 100;
    for(let i=0; i< this.array.length;i++){
      let optimalFont = Math.min(this.elWidth / 2 , this.calculateElemHeight(this.array[i][1]));
      console.log("Optimal font: " + this.array[i][1] + " es:" + optimalFont)
      this.fontSize = optimalFont < this.fontSize ? optimalFont : this.fontSize;
    }
    if (this.fontSize < 9){
      this.fontSize = 0;//Si no queda muy chica y no se ve nada
    }
  }
  /**
   * Setea el array recibido por parametro como nuevo array y actualiza las variables de tamaño
   * para hacer un display del mismo por pantalla que respete el valor de cada indice.
   * @param newArray Array actual que se recibe a traves del observable del controlador del array 
   */
  updateArrayState(newArray : Array<[number,number]>){
    this.array = newArray;
    this.updateSizeVariables();
  }

  /**
   * Funcion que actualiza las variables de tamaño utilizada para hacer calculos en el display
   * que se ve activada en el momento que existe un resize en la pantalla del usuario en pos
   * de que la pagina sea responsive.
   */
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.scWidth = window.innerWidth;
    this.scHeight = window.innerHeight;
    this.updateSizeVariables();
  }

  /**
   * Funcion que actualiza el tamaño del contenedor en donde se vera contenido el array. A su vez
   * llama a aque se actualize el fontSize.
   */
  updateSizeVariables(){
    this.containerHeight = (this.scHeight -75 -350) * 0.95; //75px del nav 200px de las referencias
    this.containerHeight = this.containerHeight < 300 ? 300 : this.containerHeight;
    this.containerWidth = this.scWidth > 1240 ? (this.scWidth-300-200-30-30-80): 600;//300px configuracion 200px state 30 de margen de ambos lados
    this.elMaxHeight = this.containerHeight;
    this.elWidth = ((this.containerWidth- (5*this.array.length)) / this.array.length); //MargenesSep
    this.updateFontSize();
    console.log("Font size:" + this.fontSize)
  }

}
