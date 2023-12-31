import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import { useRouter } from 'next/router'
import DetallesProductos from '../components/layout/DetallesProductos'
import useProductos from '../hooks/useProductos'

export default function Buscar() {

    const router = useRouter()
    const { query: { q } } = router

    // Ttodos los productos

    const { productos } = useProductos('creado')
    const [resultado, guadarResultado] = useState('')
    console.log(productos);

    useEffect(() => {
        const busqueda = q.toLowerCase()
        const filtro = productos.filter(producto => {
            return (
                producto.nombre.toLowerCase().includes(busqueda) || producto.descripcion.toLowerCase().includes(busqueda)
            )
        })

        guadarResultado(filtro)

    }, [q, productos])

    return (
        <div>
            <Layout>
                <div className='listado-productos'>
                    <div className='contenedor' >
                        <ul className='bg-white'>
                            {Array.isArray(resultado) ? (
                                resultado.map(producto => (
                                    <DetallesProductos key={producto.id} producto={producto} />
                                ))
                            ) : (
                                <p>No se encontraron resultados</p>
                            )}
                        </ul>
                    </div>
                </div>
            </Layout>
        </div>
    )
}