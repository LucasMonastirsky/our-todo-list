import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { API } from '../../App'
import { AppButton, AppInputMin, ProfilePicture } from '../../Components'
import { User } from '../../Models'
import { style } from '../../Styling'
import { launchImageLibrary } from 'react-native-image-picker'
import DEBUG from '../../Utils/DEBUG'

const EditProfile = () => {
  const [changes, setChanges] = useState<Partial<User>>({})
  const user = API.user

  const onPressImage = () => {
    launchImageLibrary({ mediaType: 'photo' },
      response => { DEBUG.log(`Got image picker response: `, response)
        if (response.uri)
          setChanges({...changes, image: response.uri})
      }
    )
  }

  return (
    <View style={css.container}>
      <View style={css.image_container}>
        <TouchableOpacity style={{aspectRatio: 1,}} onPress={onPressImage}>
          <ProfilePicture source={changes.image ?? user.image} />
        </TouchableOpacity>
      </View>
      <AppInputMin
        title='Nickname'
        defaultValue={user.nickname} 
        onChangeText={text=>setChanges({...changes, nickname: text})}
      />
      <AppButton label='Save Changes' onPress={()=>{}} />
    </View>
  )
}

const css = StyleSheet.create({
  container: {
    flex: 1,
    padding: style.padding * 2,
  },
  image_container: {
    height: 150,
    justifyContent: 'center',
    flexDirection: 'row',
  },
})

export default EditProfile