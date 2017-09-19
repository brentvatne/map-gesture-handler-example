import React from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
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
      rotation: new Animated.Value(0),
    };

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
    this._lastScale = INITIAL_SCALE;

    // Rotation is provided in radians
    //
    // Object {
    //   "handlerTag": 3,
    //   "rotation": 0.2534833877295888,
    //   "state": 4,
    //   "target": 7,
    //   "velocity": 2.445438826782535,
    // }
    this._handleRotationGestureEvent = Animated.event(
      [{ nativeEvent: { rotation: this.state.rotation } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }

  render() {
    const { panX, panY, baseScale, pinchScale, rotation } = this.state;
    const scale = Animated.multiply(baseScale, pinchScale);

    // 1.5 radian is approximately 90deg
    const rotate = rotation.interpolate({
      inputRange: [-1.5, 1.5],
      outputRange: ['-1.5rad', '1.5rad'],
      extrapolate: 'clamp',
    });

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
          <RotationGestureHandler
            id="rotate"
            simultaneousHandlers={['pan', 'pinch']}
            onHandlerStateChange={this._handleRotationGestureStateChange}
            onGestureEvent={this._handleRotationGestureEvent}>
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
                          Animated.add(
                            panY,
                            Animated.divide(SCREEN_HEIGHT, -2)
                          ),
                          Animated.add(scale, -1)
                        )
                      ),
                    },
                    { scale },
                    { rotate },
                  ],
                }}
                source={require('../assets/tokyo-train-map.jpg')}
              />
            </View>
          </RotationGestureHandler>
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

  // Extract the value out into the offset on the last rotation
  _handleRotationGestureStateChange = e => {
    const { oldState } = e.nativeEvent;

    if (oldState === State.ACTIVE) {
      this.state.rotation.extractOffset();
    }
  };
}
