import React, { useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { FirebaseContext } from '../../firebase';
import { collection, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import Error404 from '../../components/layout/404'
import Layout from '../../components/layout/Layout'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { es } from 'date-fns/locale'
import { InputSubmit, Campo, inputSubmit } from '../../components/ui/formulario'
import Boton from '../../components/ui/Boton'

const ContenedorProducto = styled.div`
@media (min-width: 768px){
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 2rem;
}
`

const CreadorProducto = styled.p`
    padding: .5rem 2rem;
    background-color: #DA552F;
    color: #fff;
    text-transform: uppercase;
    font-weight: bold;
    display: inline-block;
    text-align: center;
`

const Producto = () => {

    // state del componente
    const [producto, setProducto] = useState({});
    const [error, guardarError] = useState(false)
    const [comentarios, guardarComentario] = useState({})
    const [consultarDB, guardarConsultarDB] = useState(true)

    // Routing Para obtener el id actual
    const router = useRouter()
    const { query: { id } } = router

    //context de firebase

    const { firebase, usuario } = useContext(FirebaseContext)

    useEffect(() => {
        if (id && consultarDB) {
            const obtenerProducto = async () => {
                const productoQuery = await doc(collection(firebase.db, 'productos'), id);
                const productoID = await getDoc(productoQuery);
                if (productoID.exists && productoID.data() != undefined) {
                    setProducto(productoID.data());
                    guardarConsultarDB(false)
                } else {
                    guardarError(true);
                    guardarConsultarDB(false)
                }
            }

            obtenerProducto()
        }
    }, [id])

    if (Object.keys(producto).length === 0 && !error) return 'Cargando ...'

    const { comentario, creado, descripcion, empresa, nombre, url, URLImage, votos, creador, haVotado } = producto

    // Administrar y validar votos

    const votarProducto = () => {
        if (!usuario) {
            return router.push('/login')
        }

        // Obtener y sumar un nuevo voto

        const nuevoTotal = votos + 1

        if (haVotado.includes(usuario.uid)) return;

        // Guardar el id del user que ha votado

        const nuevoHaVotado = [...haVotado, usuario.uid]

        // Actualizar BD

        updateDoc(doc(collection(firebase.db, 'productos'), id), {
            votos: nuevoTotal,
            haVotado: nuevoHaVotado
        })

        // Actualizar state

        setProducto({
            ...producto,
            votos: nuevoTotal
        })

        guardarConsultarDB(true) // hay un voto, por lo tanto consultar a la BD

    }

    const comentarioChange = e => {
        guardarComentario({
            ...comentarios,
            [e.target.name]: e.target.value
        })
    }

    // Identifica si el comentario es el creador del producto

    const esCreador = id => {
        if (creador.id === id) {
            return true
        }
    }

    const agregarComentario = e => {
        e.preventDefault()

        if (!usuario) {
            return router.push('/login')
        }

        // comentario.usuarioId = usuario.uid
        // comentario.usuarioNombre = usuario.displayName
        // Informacion extra al comentario
        // Tomar copia de comentarios y agregarlos al arreglo

        const nuevoComentario = {
            usuarioId: usuario.uid,
            usuarioNombre: usuario.displayName,
            mensaje: comentarios.mensaje
        };


        const nuevosComentarios = [...comentario, nuevoComentario]
        // Actualizar la BD

        updateDoc(doc(collection(firebase.db, 'productos'), id), {
            comentario: nuevosComentarios
        })

        // Actualizar el state

        setProducto({
            ...producto,
            comentario: nuevosComentarios
        })

        guardarConsultarDB(true) // hay un comentario, por lo tanto consultar a la BD

    }

    // Funcion que revisa que el creador del producto sea el mismo que esta autenticado

    const puedeBorrrar = () => {
        if (!usuario) return false
        if (creador.id === usuario.uid) return true
    }

    const eliminarProducto = async () => {
        if (!usuario) {
            return router.push('/login')
        }
        if (creador.id !== usuario.uid) {
            return router.push('/')
        }
        try {
            await deleteDoc(doc(collection(firebase.db, 'productos'), id), {
            })
            return router.push('/')
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Layout>
            {error ? <Error404 /> : (
                <>
                    <div className='contenedor'>
                        <h1
                            css={css`
                        text-align: center;
                        margin-top: 5rem;
                    `}
                        >
                            {nombre}
                        </h1>
                        <ContenedorProducto>
                            <div>
                                {/* <p>Publicado hace {creado}: {formatDistanceToNow( new Date(creado), { locale: es })}</p>  */}
                                <p>Por: {creador?.nombre} de {empresa} </p>
                                <img src={URLImage} />
                                <p>{descripcion}</p>
                                {usuario && (
                                    <>
                                        <h2>Agrega tu comentario</h2>
                                        <form
                                            onSubmit={agregarComentario}
                                        >
                                            <Campo>
                                                <input
                                                    type="text"
                                                    name="mensaje"
                                                    onChange={comentarioChange}
                                                />
                                            </Campo>
                                            <InputSubmit
                                                type="submit"
                                                value="Agregar comentario"
                                            />
                                        </form>
                                    </>
                                )}
                                <h2 css={css`
                            margin: 2rem 0;
                        `}>Comentarios</h2>
                                {comentario?.length === 0 ? 'Aún no hay comentarios' : (
                                    <ul>
                                        {comentario?.map((comentario, i) => (
                                            <li
                                                key={`${comentario.usuarioId}-${i}`}
                                                css={css`
                                            border: 1px solid #e1e1e1;
                                            padding: 2rem;
                                        `}
                                            >
                                                <p>{comentario.mensaje}</p>
                                                <p>Escrito por: {''}
                                                    <span css={css`
                                                font-weight: bold;
                                            `}>
                                                        {comentario.usuarioNombre}
                                                    </span></p>
                                                {esCreador(comentario.usuarioId) && <CreadorProducto>Es Creador</CreadorProducto>}
                                            </li>
                                        ))}
                                    </ul>

                                )}
                            </div>
                            <aside>
                                <Boton
                                    target='_blank'
                                    bgColor="true"
                                    href={url}
                                >
                                    Visitar URL
                                </Boton>

                                {usuario && (
                                    <>
                                        <div css={css`
                            margin-top: 5rem;
                        `}>
                                            <Boton
                                                onClick={votarProducto}
                                            >
                                                Votar
                                            </Boton>
                                        </div>
                                    </>
                                )}
                                <p css={css`
                            text-align: center;
                        `}>{votos} Votos
                                </p>

                            </aside>
                        </ContenedorProducto>
                        {puedeBorrrar() && <Boton
                            onClick={eliminarProducto}
                        >Eliminar producto</Boton>}
                    </div>
                </>
            )}

        </Layout>
    )
}

export default Producto