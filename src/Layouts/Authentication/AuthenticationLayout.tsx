import React, { useEffect, useState } from 'react'
import { Animated, View } from 'react-native'
import LoginLayout from './LoginLayout'
import RegisterLayout from './RegisterLayout'
import { style } from '../../Styling'
import { useAsyncState, createAnimation, screen } from '../../Utils'
import { Loading } from '../../Components'
import { API, Navigation } from '../../App'
import DEBUG from '../../Utils/DEBUG'
import { ListsLayout } from '..'
import { Layout } from '../../App/Navigation'

const view = () => {
  const [login_state, getLoginState, setLoginState] = useAsyncState<'login'|'register'|'confirm'|null>('login')
  const [loading, setLoading] = useState(true)

  const transition = createAnimation({
    from: 0, to: login_state === 'register' ? -screen.height : 0, duration: style.anim_duration,
    condition: login_state,
  })

  useEffect(() => {
    API.continuePreviousSession()
      .then(onLoggedIn)
      .catch(error => {
        DEBUG.log(`Error while trying to continue session: '${error.message ?? error}', proceeding to login layout`)
        setLoading(false)
      })
  }, [])

  const onLoggedIn = () => {
    Navigation.goTo(ListsLayout)
  }

  if (loading)
    return <View style={{flex: 1, justifyContent: 'center'}}>
      <Loading />
    </View>

  return (
    <Animated.View style={{top: transition}}>
      <LoginLayout
        onRegister={()=>setLoginState('register')}
        onLogin={onLoggedIn}
      />
      <RegisterLayout
        onCancel={()=>{
          if (getLoginState() === 'register') { 
            setLoginState('login')
            return true
          }
          else return false
        }}
        onRegister={onLoggedIn}
      />
    </Animated.View>
  )
}

export default {
  name: 'Authentication',
  view,
} as Layout