import { Dimensions } from "react-native"

const screen = {
  get width() { return Dimensions.get('window').width },
  get height() { return Dimensions.get('window').height }
}

export default screen