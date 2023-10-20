export default function validarCrearProducto(valores) {
    let errores = {}
    // Validar el nombre del usuario
    if (!valores.nombre) {
        errores.nombre = 'El nombre es Obligatorio'
    }
    if (!valores.empresa) {
        errores.empresa = 'El empresa es Obligatorio'
    }
    if (!valores.url) {
        errores.url = 'El url es Obligatorio'
    } else if (!/^(ftp|http|https):\/\/[^ "]+$/.test(valores.url)) {
        errores.url = "URL mal formateada"
    }
    if (!valores.descripcion) {
        errores.descripcion = 'Agrega una descripción de tu producto'
    }

    return errores
}