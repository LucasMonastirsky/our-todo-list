import React, { useState } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import Drawer from 'react-native-drawer'
import { AppText, DrawerIcon, FadeContent } from './'
import { colors, style } from '../Styling'
import { Navigation } from '../App'

const CustomDrawer = (props: {header_content?: any, children?: any}) => {
  const [drawer_active, setDrawerActive] = useState(false)

  const DrawerContent = () => (
    <View style={css.drawer}>
      <Item onPress={()=>Navigation.goTo('Profile')}>
        <View style={css.picture_container}>
          <Image style={css.picture} source={require('../Images/Icons/profile_default.png')} />
        </View>
        <Spacer />
        <ItemText>Profile</ItemText>
      </Item>
      <Item onPress={()=>Navigation.goTo('Lists')}>
        <ItemText>Lists</ItemText>
      </Item>
      <Item onPress={()=>Navigation.goTo('Options')}>
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
        {props.header_content}
      </View>
      <View style={css.content}>{props.children}</View>
      <FadeContent active={drawer_active} />
    </Drawer>
  )
}

const css = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: colors.main_dark,
    padding: style.padding,
  },
  header: {
    height: 45,
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
})

export default CustomDrawer