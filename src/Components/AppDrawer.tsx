import React, { ComponentType, useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity, TouchableNativeFeedback, Dimensions, Animated, ImageSourcePropType } from 'react-native'
import Drawer from 'react-native-drawer'
import { AppText } from '.'
import { colors, style } from '../Styling'
import { Navigation } from '../App'
import { ContactsLayout, ListLayout, OptionsLayout, ProfileLayout } from '../Layouts'
import { createAnimation } from '../Utils'

const AppDrawer = (props: {children?: any, signOut: ()=>any}) => {
  const [drawer_active, setDrawerActive] = useState(false)
  const [header, setHeader] = useState<ComponentType>(Navigation.header)
  const [next_header, setNextHeader] = useState<ComponentType>(Navigation.header)
  const [header_fading, setHeaderFading] = useState(false)

  Navigation.onChangeHeader = value => {
    setNextHeader(value)
    setHeaderFading(true)
  }

  const goTo = (layout: (args?: any)=>JSX.Element) => {
    if (!(Navigation.current_layout === layout))
      Navigation.goTo(layout)
    setDrawerActive(false)
  }

  const header_fade_in_anim = createAnimation({
    from: +header_fading, to: 1-+header_fading, duration: style.anim_duration / 2, condition: header_fading,
    onDone: () => {
      if (header_fading) {
        setHeader(next_header)
        setHeaderFading(false)
      }
    }
  })

  const signOut = async () => {
    setDrawerActive(false)
    await props.signOut()
  }

  const DrawerContent = () => (
    <View style={css.drawer}>
      <Item onPress={()=>goTo(ProfileLayout)}
        icon_source={require('../Media/Icons/profile.png')}
        label='Profile'
      />
      <Item onPress={()=>goTo(ListLayout)}
        icon_source={require('../Media/Icons/lists.png')}
        label='Lists'
      />
      <Item onPress={()=>goTo(ContactsLayout)}
        icon_source={require('../Media/Icons/contacts.png')}
        label='Contacts'
      />
      <Item onPress={()=>goTo(OptionsLayout)}
        icon_source={require('../Media/Icons/options.png')}
        label='Options'
      />
      <Item onPress={signOut}
        icon_source={require('../Media/Icons/sign_out.png')}
        label='Sign Out'
      />
      <AppText style={css.credit_text}>Developed by Lucas Monastirsky</AppText>
    </View>
  )

  const Item = (props: {onPress?: ()=>void, icon_source: ImageSourcePropType, label: string}) => (
    <TouchableOpacity onPress={props.onPress}>
      <View style={css.item}>
        <View style={css.picture_container}>
          <Image style={css.picture} source={props.icon_source} resizeMode='contain' />
        </View>
        <View style={css.spacer} />
        <AppText style={css.text}>{props.label}</AppText>
      </View>
    </TouchableOpacity>
  )

  const FadeContent = (props: {active: boolean}) => {
    const anim = createAnimation({
      from: 1 - +props.active,
      to: +props.active,
      condition: props.active
    })
  
    return <Animated.View pointerEvents='none' style={[css.fade_content, {opacity: anim}]}  />
  }

  return (
    <Drawer
      type="overlay"
      openDrawerOffset={0.33}
      open={drawer_active}
      onCloseStart={()=>setDrawerActive(false)}
      content={<DrawerContent />}
    >
      <View style={css.header}>
        <DrawerIcon onPress={()=>setDrawerActive(true)} />
        <Animated.View style={{flex: 1, opacity: header_fade_in_anim}}>{header}</Animated.View>
      </View>
      <View style={css.content}>{props.children}</View>
      <FadeContent active={drawer_active} />
    </Drawer>
  )
}

const DrawerIcon = (props: {onPress: ()=>void}) => {
  return (
    <TouchableNativeFeedback {...props}>
      <View style={css.burger_container}>
        <View style={css.burger_bar} />
        <View style={css.burger_bar} />
        <View style={css.burger_bar} />
      </View>
    </TouchableNativeFeedback>
  )
}

const css = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: colors.main,
    padding: style.padding,
  },
  header: {
    height: 45,
    width: Dimensions.get('window').width,
    backgroundColor: colors.main,
    padding: style.padding,
    flexDirection: 'row',
  },
  content: {
    backgroundColor: colors.background,
    flex: 1,
  },
  item: {
    paddingVertical: style.padding,
    flexDirection: 'row',
  },
  spacer: {
    width: style.margin,
  },
  text: {
  },
  picture_container: {

  },
  picture: {
    flex: 1,
    aspectRatio: 1,
  },
  credit_text: {
    fontSize: style.font_size_small * 0.75,
    marginTop: 'auto',
  },
  burger_container: {
    height: '100%',
    aspectRatio: 1.25,
    padding: style.padding,
  },
  burger_bar: {
    width: '100%',
    flex: 1,
    backgroundColor: colors.light,
    marginVertical: style.border_width,
  },
  fade_content: {
    backgroundColor: '#000000aa',
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
})

export default AppDrawer