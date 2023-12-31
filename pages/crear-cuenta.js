import React, { useState } from 'react'
import Layout from '../components/layout/Layout'
import { css } from '@emotion/react'
import Router from 'next/router'
import { Formulario, Campo, InputSubmit, Error } from '../components/ui/formulario'

import firebase from '../firebase'

// Validaciones 
import validarCrearCuenta from '../validacion/validarCrearCuenta'
import useValidacion from '../hooks/useValidacion'

const STATE_INICIAL = {
  nombre: '',
  email: '',
  password: ''
}

export default function CrearCuenta() {
  
  const [error, guardarError] = useState(false)

  const {
    valores,
    errores,
    submitForm,
    handleSubmit,
    handleChange,
    handleBlur
  } = useValidacion(STATE_INICIAL, validarCrearCuenta, crearCuenta)

  const { nombre, email, password } = valores

  async function crearCuenta() {
    try {
      await firebase.registrar(nombre, email, password)
      Router.push('/')
    } catch (error) {
      console.error('hubo un error al crear el usuario', error.message);
      guardarError(error.message)
    }
  }

  return (
    <div>
      <Layout>
        <>
          <h1
            css={css`
              text-align: center;
              margin-top: 5rem;
            `}
          >Crear Cuenta</h1>
          <Formulario
            noValidate
            onSubmit={handleSubmit}
          >
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
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder='Tu email'
                name="email"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Campo>

            {errores.email && <Error>{errores.email}</Error>}

            <Campo>
              <label htmlFor="password">password</label>
              <input
                type="password"
                id="password"
                placeholder='Tu Clave'
                name="password"
                value={password}
                onChange={handleChange}
                onBlur={handleBlur}
              />

            </Campo>
            {errores.password && <Error>{errores.password}</Error>}
            { error && <Error>{error}</Error> }
            <InputSubmit
              type="submit"
              value="Crear Cuenta"
            />
          </Formulario>
        </>
      </Layout>
    </div>
  )
}