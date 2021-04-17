import { Auth } from 'aws-amplify'
import React from 'react'
import { Animated } from 'react-native'
import LoginLayout from './LoginLayout'
import RegisterLayout from './RegisterLayout'
import { style } from '../../Styling'
import { useAsyncState, createAnimation, screen } from '../../Utils'

const AuthenticationLayout = (props: {onLoggedIn: ()=>any}) => {
  const [login_state, getLoginState, setLoginState] = useAsyncState<'login'|'register'|'confirm'|null>('login')

  const transition = createAnimation({
    from: 0, to: login_state === 'register' ? -screen.height : 0, duration: style.anim_duration,
    condition: login_state,
  })

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