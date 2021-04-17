import { Auth } from 'aws-amplify'
import React, { useEffect, useState } from 'react'
import { Animated, View } from 'react-native'
import LoginLayout from './LoginLayout'
import RegisterLayout from './RegisterLayout'
import { style } from '../../Styling'
import { useAsyncState, createAnimation, screen } from '../../Utils'
import { Loading } from '../../Components'

const AuthenticationLayout = (props: {onLoggedIn: ()=>any}) => {
  const [login_state, getLoginState, setLoginState] = useAsyncState<'login'|'register'|'confirm'|null>('login')
  const [loading, setLoading] = useState(true)

  const transition = createAnimation({
    from: 0, to: login_state === 'register' ? -screen.height : 0, duration: style.anim_duration,
    condition: login_state,
  })

  useEffect(() => {(async () => {
    try {
      // if there's a session, we just skip this component
      console.log(await Auth.currentSession())
      props.onLoggedIn()
    }
    catch (error) {
      // if there's no session, we just render the sign in screen
      console.log(`${error}, proceeding to login layout`)
      setLoading(false)
    }
  })()}, [])

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