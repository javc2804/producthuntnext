import React, { useState, useContext } from 'react'
import Layout from '../components/layout/Layout'
import { css } from '@emotion/react'
import Router, { useRouter } from 'next/router'
import { Formulario, Campo, InputSubmit, Error } from '../components/ui/formulario'

import { FirebaseContext } from '../firebase'
import { ref, getDownloadURL, uploadBytesResumable } from '@firebase/storage';
import { collection, addDoc } from "firebase/firestore";

import Error404 from '../components/layout/404'

// Validaciones 
import validarCrearProducto from '../validacion/validarCrearProducto'
import useValidacion from '../hooks/useValidacion'


const STATE_INICIAL = {
  nombre: '',
  empresa: '',
  // imagen: '',
  url: '',
  descripcion: ''
}

export default function NuevoProducto() {

  const [error, guardarError] = useState(false)
  // States para la subida de la imagen
  const [uploading, setUploading] = useState(false);
  const [URLImage, setURLImage] = useState('');

  const {
    valores,
    errores,
    submitForm,
    handleSubmit,
    handleChange,
    handleBlur
  } = useValidacion(STATE_INICIAL, validarCrearProducto, crearProducto)

  const { nombre, empresa, imagen, url, descripcion } = valores

  // Hook de routing para redireccionar

  const router = useRouter()

  // Context con las operaciones CRUD de firebase

  const { usuario, firebase } = useContext(FirebaseContext)

  async function crearProducto() {
    // Si el usuario no esta autenticado llevar al login

    if (!usuario) {
      return router.push('/login')
    }

    // Crear el objeto de nuevo producto

    const producto = {
      nombre,
      empresa,
      url,
      URLImage,
      descripcion,
      votos: 0,
      comentario: [],
      creado: Date.now(),
      creador: {
        id: usuario.uid,
        nombre: usuario.displayName
      },
      haVotado: []
    }

    // Insertarlo en la BD
    try {
      await addDoc(collection(firebase.db, "productos"), producto);
      router.push('/')
    } catch (error) {
      console.error(error)
    }
  }

  const handleImageUpload = e => {
    // Se obtiene referencia de la ubicación donde se guardará la imagen
    const file = e.target.files[0];
    const imageRef = ref(firebase.storage, 'products/' + file.name);

    // Se inicia la subida
    setUploading(true);
    const uploadTask = uploadBytesResumable(imageRef, file);

    // Registra eventos para cuando detecte un cambio en el estado de la subida
    uploadTask.on('state_changed',
      // Muestra progreso de la subida
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Subiendo imagen: ${progress}% terminado`);
      },
      // En caso de error
      error => {
        setUploading(false);
        console.error(error);
      },
      // Subida finalizada correctamente
      () => {
        setUploading(false);
        getDownloadURL(uploadTask.snapshot.ref).then(url => {
          console.log('Imagen disponible en:', url);
          setURLImage(url);
        });
      }
    );
  };

  return (
    <div>
      <Layout>
        {!usuario ? <Error404 /> : (
          <>
            <h1
              css={css`
                text-align: center;
                margin-top: 5rem;
              `}
            >Nuevo Producto</h1>
            <Formulario
              noValidate
              onSubmit={handleSubmit}
            >
              <fieldset>
                <legend>Información General</legend>
                <Campo>
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    placeholder='Tu Nombre'
                    name="nombre"
                    value={nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Campo>

                {errores.nombre && <Error>{errores.nombre}</Error>}
                <Campo>
                  <label htmlFor="empresa">Empresa</label>
                  <input
                    type="text"
                    id="empresa"
                    placeholder='Nombre empresa o compañia'
                    name="empresa"
                    value={empresa}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Campo>

                {errores.empresa && <Error>{errores.empresa}</Error>}
                <Campo>
                  <label htmlFor="imagen">Imagen</label>
                  <input
                    accept="image/*"
                    type="file"
                    id="imagen"
                    name="imagen"
                    value={imagen}
                    onChange={handleImageUpload}
                  />
                </Campo>

                {errores.imagen && <Error>{errores.imagen}</Error>}
                <Campo>
                  <label htmlFor="url">URL</label>
                  <input
                    type="text"
                    id="url"
                    name="url"
                    value={url}
                    placeholder='Url de tu producto'
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Campo>

                {errores.url && <Error>{errores.url}</Error>}
              </fieldset>
              <fieldset>
                <legend>Sobre tu producto</legend>
                <Campo>
                  <label htmlFor="descripcion">descripcion</label>
                  <textarea
                    id="descripcion"
                    placeholder=''
                    name="descripcion"
                    value={descripcion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Campo>

                {errores.descripcion && <Error>{errores.descripcion}</Error>}
              </fieldset>
              {error && <Error>{error}</Error>}
              <InputSubmit
                type="submit"
                value="Crear Producto"
              />
            </Formulario>
          </>
        )}
      </Layout>
    </div>
  )
}