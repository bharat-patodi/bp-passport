import React, {createContext, useState, useEffect, useContext} from 'react'
import {AuthParams} from '../api'
import {getPatient} from '../api/patient'
import AsyncStorage from '@react-native-community/async-storage'
import {UserContext} from '../providers/user.provider'

export enum LoginState {
  LoggedOut,
  LoggingIn,
  LoggedIn,
}

export const AuthContext = createContext({
  loginState: LoginState.LoggedOut,
  setAuthParams: (params: AuthParams | undefined) => {},
  setLoginState: (state: LoginState) => {},
  signOut: async () => {},
})

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  PATIENT_ID: 'patientId',
}

const AuthProvider = ({children}) => {
  const [authParams, setAuthParams] = useState<AuthParams | undefined>(
    undefined,
  )
  const [loginState, setLoginState] = useState(LoginState.LoggedOut)

  const {updatePatientData} = useContext(UserContext)

  const signOut = async () => {
    setAuthParams(undefined)
    setLoginState(LoginState.LoggedOut)
    try {
      await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.PATIENT_ID])
    } catch (err) {
      console.log('signOut error >> ', err)
    }
  }

  useEffect(() => {
    if (authParams && loginState === LoginState.LoggedOut) {
      setLoginState(LoginState.LoggingIn)
      getPatient()
        .then((patientData) => {
          // worked out! token and patient are valid
          setLoginState(LoginState.LoggedIn)
          console.log('NK 1...')
          updatePatientData(patientData)
          AsyncStorage.multiSet([
            [KEYS.ACCESS_TOKEN, authParams.access_token],
            [KEYS.PATIENT_ID, authParams.patient_id],
          ])
        })
        .catch((err) => {
          console.log('error getting patient... signing out.', err)
          signOut()
        })
    }
  }, [authParams])

  useEffect(() => {
    const checkCachedTokens = async () => {
      try {
        const values = await AsyncStorage.multiGet([
          KEYS.ACCESS_TOKEN,
          KEYS.PATIENT_ID,
        ])
        const accessToken = values[0][1]
        const patientId = values[1][1]

        if (accessToken && patientId) {
          setAuthParams({
            access_token: accessToken,
            patient_id: patientId,
          })
        }
      } catch (err) {}
    }

    checkCachedTokens()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        setLoginState,
        loginState,
        setAuthParams,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
