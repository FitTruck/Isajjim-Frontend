import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

// TouchableOpacity 컴포넌트를 수정하여 쓸거임. activeOpacity를 1로 고정
const MyTouch = (props: TouchableOpacityProps) => {
  return (
    <TouchableOpacity 
      activeOpacity={1} 
      {...props} // 다른 속성(style, onPress 등)은 그대로 전달
    >
      {props.children}
    </TouchableOpacity>
  );
};

export default MyTouch;
