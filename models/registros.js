import Registro from './registro.js'

export default class Registros{

    _registros = {};

  /*_selectedList = {};*/

    get ListadoArray(){
    const listado = [];
        
    Object.keys(this._registros).forEach( key =>{

        const registro = this._registros[ key ];
        
        listado.push( registro );
    });

    return listado;
    }

    constructor(){
        this._registros = {};

      /*this._selectedList = {};*/
    
        this.validaciones = {
            nombre: this.validarNombre,
            codigo: this.validarCodigo,
            precio: this.validarPrecio,
            descuento: this.validarDescuento,
            categoria: this.validarCategoria,
            cantidad: this.validarCantidad
        }

    }

    borrar(id = ""){
        if(this._registros[id]){
            delete this._registros[id];
        }
    }

    cargarProductosFromArray( productos = [] ){
        productos.forEach( producto => {
            this._registros[producto.id] = producto;
        });
    }

    editarProducto( id, producto ){
        //lo ideal seria no colocar la id que nos a pasado el usuario pero por los,
        //momentos lo dejare asi 
        this._registros[id] = { id, ...producto };

        return this._registros[id];
    }

    guardarProducto( producto ){
        const registro = new Registro( producto );

        this._registros[registro.id] = registro;
        //ahora enviamos el registro para que lo puedan usar en el index
        return registro;
    }


//-----------------------------------------------------------
/* validaciones */
/*true indica que todo esta bien*/
/*false indica que hay un error*/

    validarNombre({ value }){
        const regExpressions = /^[a-zA-Z ]{4,30}$/;
        return regExpressions.test(value);
    }

    validarCodigo({value}){
        //hay que validar el codigo
        const regExpressions = /^[a-zA-Z0-9]{10,16}$/;
        if(!regExpressions.test(value)){
        // si esto es falso, retorna que hay un error
            return false
        }
        //const even = ( elemento ) => elemento.codigo === value;
        //console.log(this._registros);
       /*if( .some( even ) ){
            return false
        }*/

        return true;
    }

    validarPrecio({value}){

        if( value ==='' ){
            console.log('Este campo no puede estar vacio');
            return false 
        }
        //const regExpressions = /^[0-9]$/;
        //if(!regExpressions.test(value)) { return false }
        if(value <= 0 || 1000 < value){
            return false
            console.log('El precio no puede ser menor o igual a 0, ni mayor a 1000');
        }

        return true
    }

    validarDescuento({value}) {

        if(value ===''){
            console.log('Este campo no puede estar vacio');
            return false 
        }

        const parsedValue = parseInt(value);
        //const regExpressions = /^[0-9]$/;
        //if(!regExpressions.test(value)) { return false }
        if( 56 <= parsedValue ) { 
            return false
            console.log('El descuento no puede mayor a 50');
        }
        if( parsedValue < 0 ) { 
            console.log('El descuento no puede ser menor o igual a 0');
            return false
        }
        return true
    }

    validarCategoria({ value }){

        if( value === categoria1 || categoria2 || categoria3 || categoria4 ){
             return true 
        }
        return false;    
    }

    validarCantidad({ value }){
        if( 1 <= value ){
            return true
        }

        return false
    }

}

