import uuid from '../helpers/uui.js';

export default class Registro{
    id        = '';
    nombre    = '';
    codigo    = '';
    precio    = '';
    descuento = 0;
    select = '';
    cantidad = ''

    constructor({ nombre, codigo, precio, descuento, select, cantidad}){
        this.id = uuid();
        this.nombre = nombre;
        this.codigo = codigo;
        this.precio = precio;
        this.descuento = descuento;
        this.select = select;
        this.cantidad = cantidad;
    }
}