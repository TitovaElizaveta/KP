import { authRoutes, publicRoutes } from '../routes'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Context } from '../index'
import React, { useContext } from 'react'
import { observer } from "mobx-react-lite"

const AppRouter = observer(() => {
  const { user } = useContext(Context)

  return (
    <Routes>
      {user.isAuth ? (
        <>
          {authRoutes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={
            <Navigate to={
              user.user.role === 'admin' ? '/admin' :
                user.user.role === 'teacher' ? '/teacher' : '/student'
            } replace />
          } />
        </>
      ) : (
        <>
          {publicRoutes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  )
})

export default AppRouter