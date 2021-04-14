import React, { ComponentType, useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity, TouchableNativeFeedback, Dimensions, Animated } from 'react-native'
import Drawer from 'react-native-drawer'
import { AppText, FadeContent } from './'
import { colors, style } from '../Styling'
import { Navigation } from '../App'
import { ListLayout, OptionsLayout, ProfileLayout } from '../Layouts'
import { createAnimation } from '../Utils'

const CustomDrawer = (props: {children?: any}) => {
  const [drawer_active, setDrawerActive] = useState(false)
  const [header, setHeader] = useState<ComponentType>(Navigation.header)
  const [next_header, setNextHeader] = useState<ComponentType>(Navigation.header)
  const [header_fading, setHeaderFading] = useState(false)

  Navigation.onChangeHeader = value => {
    setNextHeader(value)
    setHeaderFading(true)
  }

  const goTo = (layout: (args?: any)=>JSX.Element) => {
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

  const DrawerContent = () => (
    <View style={css.drawer}>
      <Item onPress={()=>goTo(ProfileLayout)}>
        <View style={css.picture_container}>
          <Image style={css.picture} source={require('../Images/Icons/profile_default.png')} />
        </View>
        <Spacer />
        <ItemText>Profile</ItemText>
      </Item>
      <Item onPress={()=>goTo(ListLayout)}>
        <ItemText>Lists</ItemText>
      </Item>
      <Item onPress={()=>goTo(OptionsLayout)}>
        <ItemText>Options</ItemText>
      </Item>
      <AppText style={css.credit_text}>Developed by Lucas Monastirsky</AppText>
    </View>
  )

  const Item = ({children, onPress}: {children: any, onPress?: ()=>void}) => <TouchableOpacity {...{onPress}}><View style={css.item}>{children}</View></TouchableOpacity>
  const ItemText = ({children}: {children: any}) => <AppText style={css.text}>{children}</AppText>
  const Spacer = () => <View style={css.spacer} />

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
    backgroundColor: colors.main_dark,
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
    borderRadius: 100,
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
})

export default CustomDrawer