import Registros from './models/registros.js';
import {leerLocalStorage, guardarInLocalStorage } from './helpers/localStorage.js'
import getRegistroByName from './helpers/getRegistroByName.js';

document.addEventListener('DOMContentLoaded', () => {
    const agregar = document.getElementById('agregar');
    const ProductoModal = document.getElementById('productoModal');
    const form = document.getElementById('form');
    const formulario = document.querySelectorAll('#form input');
    const select = document.getElementById('select');
    const regitrosContainer = document.getElementById('regitrosContainer');
    const inventarioContainer = document.getElementById('inventarioContainer');
    const categoriaActiva = document.getElementById('categoriaActiva');
    const search = document.getElementById('search');
    //const mostrar = document.getElementById('mostrar');
    //const limpiar = document.getElementById('limpiar');
    const atras = document.getElementById('atras');
    const adelante = document.getElementById('adelante');

    //instaciamos la clase Registos
    const registros = new Registros();
    
    //Lo convertimos de NodeList a Array;
    const inputs = Array.from(formulario);

    const leerLS = leerLocalStorage();
    if(leerLS){
        //si hay registros en el local storage los traemos a nuestro modelo, registros
        registros.cargarProductosFromArray(leerLS);
    }

//----------------------------------------------------------

const guardarButton = ( funcion, padre ) =>{

    const button = document.createElement('button');
    button.classList.add('btn','btn-primary','m-2');
    button.innerText = 'Guardar';
    button.onclick = (e) => funcion( e );
    padre.appendChild(button);

}

const cerrarButton = ( funcion, padre ) => {

    const button = document.createElement('button');
    button.classList.add('btn','succes','m-2');
    button.innerText = 'Cerrar';
    button.onclick = (e) => funcion( e );
    padre.appendChild(button);
    
}

//limpiarComponents elimina el boton guardar y cerrar cuando ya no se necesitan

const limpiarComponents = ( e ) => {

   const padre = e.target.parentNode;
   const padreArray = Array.from(padre.children)
   padreArray.forEach( (element) => {
    padre.removeChild( element )
   });

}

//----------------------------------------------------------

const bolivarParalelo = 8;

const conversionBs = ( value ) => {
    if( 0 < value ) {
        const cambio = value * bolivarParalelo 
        return `${value}$/${Number(cambio.toFixed(2))}Bs`
    }
    return `${0}$` ;
}

const cargarDatosEstadisticos = ( registroArray, categoria ) => {

    const totalProductos = registros.ListadoArray.length

    const totalProductosTipo = registroArray.length;

    const productosConDescuento = registroArray.filter( (registro) =>{
        return ( registro.descuento === '0' ) ? false : true;
    }).length

    const totalProductosCondicional = ( ) => {
        if( categoria === 'all' ){
            return `<p>Total de productos: ${totalProductos}</p>`
        }
        else {
            return ''
        }
    }

    const totalCategoriaCondicional = () => {
        if(categoria === 'all'){
            return ''
        }
        else{
          return `<p>Total de productos tipo ${categoria}: ${totalProductosTipo}</p>`
        }
    }

   let totalBruto = 0;

   if( 2 <= registroArray.length ){

    totalBruto = registroArray.reduce( ( vAnterior, vActual, indice ) => {

        if( indice === 1){
            
            let valorAnterior = parseInt(vAnterior.precio);
            if( 2 <= vAnterior.cantidad ){
                valorAnterior = valorAnterior * parseInt(vAnterior.cantidad);
            }

            let valorActual = parseInt(vActual.precio);
            if( 2 <= vActual.cantidad ){
                valorActual = valorActual * parseInt(vActual.cantidad);
            }

            return valorAnterior + valorActual ;
        }

        let valorActual = parseInt( vActual.precio );
        if( 2 <= valorActual.cantidad ){
            valorActual = valorActual * parseInt(vActual.cantidad);
        }
        
        return vAnterior + valorActual ;
    });

   } else if( registroArray.length === 1 ) {
    totalBruto = registroArray[0].precio;
    totalBruto = Number( totalBruto ) * Number( registroArray[0].cantidad );
   }

   let totalDescuento = 0;

   if(2 <= registroArray.length){ 
    totalDescuento = registroArray.reduce( ( vAnterior, vActual, indice )=>{
        if( indice === 1){
            const valorAnterior = parseInt( vAnterior.descuento );
            const valorActual = parseInt( vActual.descuento );
            return valorAnterior + valorActual ;
        }

        const valorActual = parseInt( vActual.descuento );
        return vAnterior + valorActual;
    });

   } else if( registroArray.length === 1 ){
    totalDescuento = registroArray[0].descuento;
    totalDescuento = Number( totalDescuento ); 
   }

   let totalNeto = 0;
   if( totalBruto === 0 && totalDescuento === 0 ){
    totalNeto = 0
   } else {
    totalNeto = totalBruto - ( totalBruto*((totalDescuento/registroArray.length)/100));
   }


   totalBruto = Number(totalBruto.toFixed(2));
   totalNeto = Number(totalNeto.toFixed(2))

    const div = document.createElement('div');
    div.classList.add('datos-estadisticos');
    div.setAttribute( "id" , "datosEstaditicos" );
    div.innerHTML = `
    <p>${ totalProductosCondicional() }</p>
    ${totalCategoriaCondicional()}
    <p>Total de productos con descuento: ${productosConDescuento}</p>
    <p>Total bruto: ${ conversionBs(totalBruto) }</p>
    <p>Total neto: ${ conversionBs(totalNeto) }</p>
    `
    inventarioContainer.appendChild(div);
}

//----------------------------------------------------------

const renderizarEncabezado = () =>{

        const div = document.createElement('div');
        div.classList.add('desc');
        div.setAttribute( "id" , "encabezado" );
        div.innerHTML = `
        <p>#</p>
        <p>Nombre</p>
        <p>Precio</p>
        <p>Descuento</p>
        <p>Tipo</p>
        <p>Editar/Eliminar</p>
        `;

        regitrosContainer.appendChild(div);
}


//-----------------------------------------------------------

const editar = ( e , obtenerID ) =>{

    const guardarCerrarDiv = document.getElementById('guardar-cerrar');
    guardarButton( (e)=> validarEditar(e,obtenerID.id) , guardarCerrarDiv);
    cerrarButton( cancelar , guardarCerrarDiv );
    const id = obtenerID.id;

    //desplegamos el modal
    ProductoModal.style.display = "grid";
    const {
        nombre,
        codigo,
        precio,
        descuento,
        select,
        cantidad
    }  = registros._registros[id];

    inputsValues = {nombre, codigo, precio, descuento, select, cantidad };
    //colocamos los valores
    //esto creo que se puede obtimizar con una metodo macht
    inputs.forEach( ( registro ) =>{
        if(registro.name === 'nombre') { return registro.value = nombre}
        if(registro.name === 'codigo') { return registro.value = codigo}
        if(registro.name === 'precio') { return registro.value = precio}
        if(registro.name === 'descuento') {return registro.value = descuento}
        if(registro.name === 'cantidad') {return registro.value = cantidad}
    });
    //PENDIENTE: Tengo que reflejar la categoria
}

const eliminar = (obtenerID) => {
    const id = obtenerID.id;
    //eliminamos de nuestro modelo
    registros.borrar(id);
    //guardamos en LocalStorage el nuevo modelo
    guardarInLocalStorage( registros.ListadoArray );

    //eliminamos de el DOM
    const child = obtenerID.parentNode;
    regitrosContainer.removeChild(child);
    rederizarCategoriaActiva(categoriaActiva.value);
    
    //Verificamos si no borramos el ultimo elemento de el encabezado,
    //porque si es asi tenemos que eliminar el encabezado
   if( child.indice === "1" ){
        const encabezado = document.getElementById("encabezado");
        const padre = encabezado.parentNode;
        padre.removeChild(encabezado);
    }
}

//-----------------------------------------------------------


const renderizarRegistro = ( indice , registro ) =>{

    const input = document.createElement('input');
    input.setAttribute( "type" , "checkbox" );
    input.onchange = () => console.log('hola');

    const div = document.createElement('div');
        div.classList.add('fila');
        div.setAttribute( "indice" , `${indice}` );
        div.innerHTML = `
        <p>${indice}</p>
        <p>${registro.nombre}</p>
        <p>${registro.precio}$</p>
        <p>${registro.descuento}%</p>
        <p>${registro.select}</p>
        <div id="${registro.id}"></div>
        `;

        const obtenerID = div.children[5];

        //div.children[1].onchange = (e) => console.log(e.target.checked);

        regitrosContainer.appendChild(div);

        
        /*crear boton editar*/
        const editButton = document.createElement('button');
        editButton.classList.add('btn','btn-primary','mb-1');
        editButton.onclick = (e) => editar(e,obtenerID);
        editButton.innerHTML = `<i class="fa fa-pencil"></i>`;
        div.children[5].appendChild(editButton);
        /*crear boton eliminar*/
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn','btn-danger','mb-1','ml-1');
        deleteButton.onclick = () => eliminar(obtenerID);
        deleteButton.innerHTML= `<i class="fa fa-trash"></i>`;
        div.children[5].appendChild(deleteButton);

}
//-----------------------------------------------------------
/*
const addToSelectedList = (e) => {
    if(e.target.checked){

    } else {

    }
}
*/
/*
mostrar.onclick = () => {
    console.log('mostrar')
}

limpiar.onclick = (e) => {
    console.log('limpiar')
}
*/
//-----------------------------------------------------------


    let paginaActual = 1;

    //Esta es la funcion encargada de paginar los arrays antes de renderizarlos
    
    const paginar = (array, pagina) => {
        const offset = pagina * 5;
        const inicio = offset - 5;
        return array.slice( inicio , offset );
    }

//-----------------------------------------------------------
    const cargarPrimeraVez = () => {

        if( 1 <= registros.ListadoArray.length) {
            renderizarEncabezado();
        }

        let listadoArray = paginar( registros.ListadoArray, paginaActual );

        if( listadoArray.length === 0 ){
            if( 1 < paginaActual ){ paginaActual = paginaActual -1 };
            listadoArray = paginar( registros.ListadoArray, paginaActual );
        }

        listadoArray.forEach( ( registro , i ) => {
            /*
              hay que crear una funcion que reenderize,
              todos los registros, cuando la pagina se,
              carge por primera vez
            */
              let indice = 0;
          
              if( 2 <= paginaActual  ){
                  indice = ( i + 1 ) + ( 5 * ( paginaActual-1 ) );
              } else {
                  indice = i + 1;
              }
          
          
          renderizarRegistro(  indice , registro );
      });
        cargarDatosEstadisticos(registros.ListadoArray, 'all');
    }

    //llamaremos a esta funcion si el local storage esta vacio
    const hasData = leerLocalStorage;
    !!hasData && cargarPrimeraVez();
//-----------------------------------------------------------

    const limpiarRegistros = () => {
        Array.from(regitrosContainer.children).forEach( registro => {
            regitrosContainer.removeChild( registro );
        });
    }

    const limpiarDatosEstadisticos = () => {
        const datosEstadisticos = document.getElementById('datosEstaditicos');
        inventarioContainer.removeChild(datosEstadisticos);
    }

//-----------------------------------------------------------


    const rederizarCategoriaActiva = (selectValue) =>{

        console.log('renderizar categoria disparado');
        
        limpiarRegistros();
        limpiarDatosEstadisticos();

        if(selectValue === 'all'){
            //verificamos si hay que renderizar el encabezado
            if( 1 <= registros.ListadoArray.length ) {
                renderizarEncabezado();
            }

            let listadoArray = paginar( registros.ListadoArray, paginaActual );

            if( listadoArray.length === 0 ){
                if( 1 < paginaActual ){ paginaActual = paginaActual -1 };
                listadoArray = paginar( registros.ListadoArray, paginaActual );
            }
            listadoArray.forEach( (registro,i) => {
                
                let indice = 0;
          
                if( 2 <= paginaActual  ){
                    indice = ( i + 1 ) + ( 5 * ( paginaActual-1 ) );
                } else {
                    indice = i + 1;
                }
                
                renderizarRegistro( indice, registro );
            });

            cargarDatosEstadisticos(registros.ListadoArray, selectValue);
        } else {
            
            const categoriaActivaArray = registros.ListadoArray.filter( (registro) => {
                if( registro.select === selectValue){
                    return true;
                }
                return false;
            });
            //verificamos si hay que renderizar el encabezado
            if( 1 <= categoriaActivaArray.length ){
                renderizarEncabezado();
            }

            console.log(categoriaActivaArray);
            // caap : categoria Activa Array Paginado
            let caap = paginar(categoriaActivaArray, paginaActual );
            if( caap.length === 0 ){
                if( 1 < paginaActual ){ paginaActual = paginaActual -1 };
                caap = paginar(categoriaActivaArray, paginaActual );
            }
            
            caap.forEach( (registro, i) => {
                
                let indice = 0;
          
                if( 2 <= paginaActual  ){
                    indice = ( i + 1 ) + ( 5 * ( paginaActual-1 ) );
                } else {
                    indice = i + 1;
                }

                renderizarRegistro( indice , registro);
            });


            cargarDatosEstadisticos( categoriaActivaArray , categoriaActiva.value );
        }
    }
    
    
    //estamos a la escucha de el selector de categorias 
    //para que cada que alla un cambio ejecutemos esta funcion
    categoriaActiva.onchange = (e) => rederizarCategoriaActiva(e.target.value);

//-----------------------------------------------------------

    const searchFunction = ( e ) => {
        const searchValue = e.target.value;
        const searchResult = getRegistroByName( searchValue, registros.ListadoArray );
        
        if( 1 <= searchResult.length ){
            
            limpiarRegistros();

            renderizarEncabezado();
            
            let searchResultPaginado = paginar( searchResult, paginaActual );
            
            if( searchResultPaginado.length === 0 ){
                if( 1 < paginaActual ){ paginaActual = paginaActual -1 };
                searchResultPaginado = paginar(searchResult, paginaActual );
            }

            searchResultPaginado.forEach( (registro, i) => {
                
                let indice = 0;
          
                if( 2 <= paginaActual  ){
                    indice = ( i + 1 ) + ( 5 * ( paginaActual-1 ) );
                } else {
                    indice = i + 1;
                }
                
                renderizarRegistro( indice , registro);
            });
            //los datos estadisticos podriamos omitirlos

        } else if( 0 <= searchResult.length ){
            limpiarRegistros();
            rederizarCategoriaActiva(categoriaActiva.value);
            limpiarDatosEstadisticos();
            cargarDatosEstadisticos( registros.ListadoArray, 'all' );
        }
    }

    search.onkeyup = (e) => searchFunction(e);

  /*search.onkeyup = (e) => {
        console.log('Value', e.target.value);
        console.log('search');
    }*/

//-----------------------------------------------------------
    
    //guardar valores en constantes para tenerlos a mano
    let inputsValues = {};

//-----------------------------------------------------------
    
    //validar los datos de los  inputs por cada evento realizado,
    //almacenarlos en inputsValues, y mostrar mensajes de error personalizados

    inputs.forEach( (input) =>{

        const guardarValores = ({target}) =>{
            inputsValues[target.name] = target.value;
        }

        const validarCampo = ({target}) =>{
            if(registros.validaciones[target.name](target)){
               //remover mensaje de error dependiendo de el input
               //validar si esto esta llegando
               target.parentNode.parentNode.children[2].style.display = "none";
            } else{
              //mostrar mensaje de error dependiendo de el input
              target.parentNode.parentNode.children[2].style.display = "block";
            };
        }

        //cada que se se ejecute uno de estos eventos, se validara el campo

        input.onkeyup = validarCampo;
        input.onblur = validarCampo;
        input.oninput = guardarValores;
    });

//------------------------------------------------------------

    //Mostrar modal donde se ingresara nuevo prodicto
    agregar.onclick = () => {
        ProductoModal.style.display = "grid";
        //añadimos botones segun lo que queramos hacer 
        //en este caso guardar nuevo producto 
        const guardarCerrarDiv = document.getElementById('guardar-cerrar');
        //se le pasa la funcion validarGuardar porque eso es lo que hara el boton
        //tambien se le pasa el padre que lo albergara
        guardarButton( validarGuardar , guardarCerrarDiv );
        cerrarButton( cancelar , guardarCerrarDiv );
    }

   const cancelar = (e) => {
        //form.reset();
        //limpiarComponets
        limpiarComponents( e );
        ProductoModal.style.display = "none";
        e.preventDefault();
    }

    form.onsubmit = (e) => {
    //prevenir que se reinicien los valores
    //event.preventDefault();
    window.history.back();
    }

//-----------------------------------------------------------
    //validar toodo los campos antes de guarlarlos
    const validarTodosLosCampos = () => {

        const even = (element) => element === false;

        return !inputs.map( (input)=>{
            return registros.validaciones[input.name](input);
        }).some(even);

    }
//-----------------------------------------------------------

    /*Desplegar el mensaje de error*/
    const showErrorMessage = () =>{
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = "block";
        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 2500 );
    }

//-----------------------------------------------------------
    //estos son los botones de la paginacion
    atras.onclick = ( e ) => {
        if(paginaActual<=1){
            return true
        }
        paginaActual = paginaActual - 1;
        rederizarCategoriaActiva(categoriaActiva.value);
    } 

    adelante.onclick = ( e ) => {
        paginaActual = paginaActual + 1;
        rederizarCategoriaActiva(categoriaActiva.value); 
    }

//-----------------------------------------------------------

    const validarGuardar = (e) => {

        const guardarDatos = () =>{
            const registro = registros.guardarProducto( inputsValues );
            //Guardar en localStorage 
            guardarInLocalStorage( registros.ListadoArray );
            //rederizar datos
            //renderizarEncabezado();
            const indice = registros.ListadoArray.length;
            //renderizarRegistro( indice , registro );
            rederizarCategoriaActiva(categoriaActiva.value);
            cancelar( e );
            //receteamos los datos
            form.reset();
            //cerramos el modal
            ProductoModal.style.display = "none";
            //cargamos los nuevos datos estadisticos
        }
        
        e.preventDefault();

        inputsValues = { ...inputsValues , select: select.value };

        //Si es verdadero lo podemos enviar, si es falso no podemos continuar
        validarTodosLosCampos() 
        ? guardarDatos()
        : showErrorMessage();
    }

//-----------------------------------------------------------

    
const validarEditar = (e, id) => {

    const editarDatos = () =>{
        const registro = registros.editarProducto(id , inputsValues);
        guardarInLocalStorage( registros.ListadoArray );
        cancelar( e );
        form.reset();
        ProductoModal.style.display = "none";
        rederizarCategoriaActiva(categoriaActiva.value);
    }

    e.preventDefault();
    
    inputsValues = { ...inputsValues , select: select.value };
    
    //Si es verdadero lo podemos enviar, si es falso no podemos continuar
    validarTodosLosCampos() 
    ? editarDatos()
    : showErrorMessage();
}



});