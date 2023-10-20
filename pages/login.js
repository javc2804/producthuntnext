import React, { useState } from 'react'
import Layout from '../components/layout/Layout'
import { css } from '@emotion/react'
import Router from 'next/router'
import { Formulario, Campo, InputSubmit, Error } from '../components/ui/formulario'

import firebase from '../firebase'

// Validaciones 
import validarIniciarSesion from '../validacion/validarIniciarSesion'
import useValidacion from '../hooks/useValidacion'

const STATE_INICIAL = {
  email: '',
  password: ''
}

export default function Login() {

  const [error, guardarError] = useState(false)
  const {
    valores,
    errores,
    submitForm,
    handleSubmit,
    handleChange,
    handleBlur
  } = useValidacion(STATE_INICIAL, validarIniciarSesion, iniciarSesion)

  const { email, password } = valores

  async function iniciarSesion() {
    try {
      await firebase.login(email, password)
      Router.push('/')
    } catch (error) {
      console.error('hubo un error al autenticar el usuario', error.message);
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
          >Iniciar sesión</h1>
          <Formulario
            noValidate
            onSubmit={handleSubmit}
          >

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
            {error && <Error>{error}</Error>}
            <InputSubmit
              type="submit"
              value="Iniciar sesión"
            />
          </Formulario>
        </>
      </Layout>
    </div>
  )
}