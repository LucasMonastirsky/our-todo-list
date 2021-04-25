import React, { useEffect, useState } from 'react'
import { Animated, View } from 'react-native'
import LoginLayout from './LoginLayout'
import RegisterLayout from './RegisterLayout'
import { style } from '../../Styling'
import { useAsyncState, createAnimation, screen } from '../../Utils'
import { Loading } from '../../Components'
import { API } from '../../App'
import DEBUG from '../../Utils/DEBUG'

const AuthenticationLayout = (props: {onLoggedIn: ()=>any}) => {
  const [login_state, getLoginState, setLoginState] = useAsyncState<'login'|'register'|'confirm'|null>('login')
  const [loading, setLoading] = useState(true)

  const transition = createAnimation({
    from: 0, to: login_state === 'register' ? -screen.height : 0, duration: style.anim_duration,
    condition: login_state,
  })

  useEffect(() => {
    API.continuePreviousSession()
      .then(() => props.onLoggedIn())
      .catch(error => {
        DEBUG.log(`${error}, proceeding to login layout`)
        setLoading(false)
      })
  }, [])

  if (loading)
    return <View style={{}}><Loading /></View>

  return (
    <Animated.View style={{top: transition}}>
      <LoginLayout
        onRegister={()=>setLoginState('register')}
        onLogin={props.onLoggedIn}
      />
      <RegisterLayout
        onCancel={()=>{
          if (getLoginState() === 'register') { 
            setLoginState('login')
            return true
          }
          else return false
        }}
        onRegister={props.onLoggedIn}
      />
    </Animated.View>
  )
}

export default AuthenticationLayout