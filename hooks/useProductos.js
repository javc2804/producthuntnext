import React, { useState, useEffect, useContext } from 'react'
import { FirebaseContext } from '../firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'


const useProductos = orden => {
    const [productos, guardarProductos] = useState([])
    const { firebase } = useContext(FirebaseContext)

    useEffect(() => {
        const obtenerProductos = async () => {
            const querySnapshot = await getDocs(collection(firebase.db, "productos"), orderBy(orden, "desc"));
            const productos = querySnapshot.docs.map(doc => {
                return {
                    id: doc.id,
                    ...doc.data()
                }
            });
            guardarProductos(productos)
        }

        obtenerProductos()
    }, [])

    return {
        productos
    }
}

export default useProductos