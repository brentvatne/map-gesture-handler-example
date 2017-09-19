import React from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';

const USE_NATIVE_DRIVER = false;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const IMAGE_WIDTH = 2560;
const IMAGE_HEIGHT = 1801;

export default class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      panX: new Animated.Value(0),
      panY: new Animated.Value(0),
      pinchScale: new Animated.Value(1),
      baseScale: new Animated.Value(1),
    };

    // I want to update the pan values differently depending on the current zoom
    // level, this is difficult to express with Animated.event currently
    // (although I believe it would be possible w/ an additional Animated.Value)
    this._handlePanGestureEvent = e => {
      const { translationX, translationY } = e.nativeEvent;
      this.state.panX.setValue(translationX * (1 / this._lastScale));
      this.state.panY.setValue(translationY * (1 / this._lastScale));
    };

    this._handlePinchGestureEvent = Animated.event(
      [{ nativeEvent: { scale: this.state.pinchScale } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
    this._lastScale = 1;
  }

  render() {
    const { panX, panY, baseScale, pinchScale } = this.state;
    const scale = Animated.multiply(baseScale, pinchScale);

    return (
      <PanGestureHandler
        id="pan"
        simultaneousHandlers="pinch"
        onHandlerStateChange={this._handlePanGestureStateChange}
        onGestureEvent={this._handlePanGestureEvent}>
        <PinchGestureHandler
          id="pinch"
          simultaneousHandlers="pan"
          onHandlerStateChange={this._handlePinchGestureStateChange}
          onGestureEvent={this._handlePinchGestureEvent}>
          <View style={StyleSheet.absoluteFill}>
            <Animated.Image
              style={{
                transform: [
                  { translateX: panX },
                  { translateY: panY },
                  {
                    translateX: Animated.add(
                      // Reset transform origin (react-native doesn't support transform-origin property)
                      // https://snack.expo.io/rkXrdf1j-
                      Animated.add(
                        Animated.multiply(IMAGE_WIDTH / 2, scale),
                        -IMAGE_WIDTH / 2
                      ),
                      // Center relative to middle of the screen
                      Animated.multiply(
                        Animated.add(panX, Animated.divide(SCREEN_WIDTH, -2)),
                        Animated.add(scale, -1)
                      )
                    ),
                  },
                  {
                    translateY: Animated.add(
                      // Reset transform origin (react-native doesn't support transform-origin property)
                      Animated.add(
                        Animated.multiply(IMAGE_HEIGHT / 2, scale),
                        -IMAGE_HEIGHT / 2
                      ),
                      // Center relative to middle of the screen
                      Animated.multiply(
                        Animated.add(panY, Animated.divide(SCREEN_HEIGHT, -2)),
                        Animated.add(scale, -1)
                      )
                    ),
                  },
                  { scale },
                ],
              }}
              source={require('../assets/tokyo-train-map.jpg')}
            />
          </View>
        </PinchGestureHandler>
      </PanGestureHandler>
    );
  }

  _handlePanGestureStateChange = e => {
    const { oldState } = e.nativeEvent;

    if (oldState === State.ACTIVE) {
      this.state.panX.extractOffset();
      this.state.panY.extractOffset();
    }
  };

  _handlePinchGestureStateChange = e => {
    const { oldState, scale } = e.nativeEvent;

    if (oldState === State.ACTIVE) {
      this._lastScale *= scale;
      this.state.baseScale.setValue(this._lastScale);
      this.state.pinchScale.setValue(1);
    }
  };
}
