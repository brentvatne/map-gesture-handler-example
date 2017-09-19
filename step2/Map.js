import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const USE_NATIVE_DRIVER = false;

export default class Map extends React.Component {
  state = {
    panX: new Animated.Value(0),
    panY: new Animated.Value(0),
  };

  render() {
    const { panX, panY } = this.state;

    return (
      <PanGestureHandler onGestureEvent={this._handlePanGestureEvent}>
        <View style={StyleSheet.absoluteFill}>
          <Animated.Image
            style={{
              transform: [{ translateX: panX }, { translateY: panY }],
            }}
            source={require('../assets/tokyo-train-map.jpg')}
          />
        </View>
      </PanGestureHandler>
    );
  }

  _handlePanGestureEvent = e => {
    console.log(e.nativeEvent);
    const { translationX, translationY } = e.nativeEvent;

    this.state.panX.setValue(translationX);
    this.state.panY.setValue(translationY);
  };
}
