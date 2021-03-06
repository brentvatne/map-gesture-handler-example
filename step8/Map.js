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
const INITIAL_SCALE = 0.5;

export default class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      panX: new Animated.Value(-IMAGE_WIDTH / 2 + SCREEN_WIDTH / 2),
      panY: new Animated.Value(-IMAGE_HEIGHT / 2 + SCREEN_HEIGHT / 2),
      pinchScale: new Animated.Value(1),
      baseScale: new Animated.Value(INITIAL_SCALE),
    };

    // Move the value into the offset
    this.state.panX.extractOffset();
    this.state.panY.extractOffset();

    this._handlePanGestureEvent = e => {
      const { translationX, translationY } = e.nativeEvent;
      this.state.panX.setValue(translationX * (1 / this._lastScale));
      this.state.panY.setValue(translationY * (1 / this._lastScale));
    };

    this._handlePinchGestureEvent = Animated.event(
      [{ nativeEvent: { scale: this.state.pinchScale } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );

    // We use this later when the gesture is completed
    this._lastScale = INITIAL_SCALE;
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
                      Animated.add(
                        Animated.multiply(IMAGE_WIDTH / 2, scale),
                        -IMAGE_WIDTH / 2
                      ),
                      Animated.multiply(
                        Animated.add(panX, Animated.divide(SCREEN_WIDTH, -2)),
                        Animated.add(scale, -1)
                      )
                    ),
                  },
                  {
                    translateY: Animated.add(
                      Animated.add(
                        Animated.multiply(IMAGE_HEIGHT / 2, scale),
                        -IMAGE_HEIGHT / 2
                      ),
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
