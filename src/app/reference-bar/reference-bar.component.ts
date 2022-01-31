import { Component} from '@angular/core';
import { ColorReference } from '../model/ColorReference';

import { ReferenceService } from '../services/reference-service';

@Component({
  selector: 'app-reference-bar',
  templateUrl: './reference-bar.component.html',
  styleUrls: ['./reference-bar.component.css']
})
export class ReferenceBarComponent {
  referenceList : ColorReference[]; 
  hasClicked : boolean;
  elemDisplay : ColorReference;
  
  /**
   * Constructor del componente.
   * @param colorRef Servicio que define el color que tomara cada referencia.
   */
  constructor(private colorRef: ReferenceService) { 
    this.hasClicked = false;
    this.elemDisplay = {varName:"",refColor:"",descripcion:""};
    this.referenceList = colorRef.getColorReferenceList();
    this.colorRef.colRefListObs.subscribe(
      (newVarStateList) => {
        this.referenceList = newVarStateList;
        this.hasClicked = false;
      });
  }
  
  /**
   * Otorga a 'elemDisplay' la ColorReference sobre la cual el usuario presiono 'Descripcion'
   * y cambia el valor de la variable de clase 'hasClicked' a true que hara que sea posible
   * visualizar la descripcion de dicha referencia en la pagina.
   * @param refEl Elemento de instancia ColorReference contenido dentro de ReferenceList.
   */
  setInfoDisplay(refEl : ColorReference){
    this.hasClicked = true;
    this.elemDisplay = refEl;
  }

}
