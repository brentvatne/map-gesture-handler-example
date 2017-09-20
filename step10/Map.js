import React from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';

const USE_NATIVE_DRIVER = false;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const IMAGE_WIDTH = 2560;
const IMAGE_HEIGHT = 1801;
const INITIAL_SCALE = 0.5;
const INITIAL_PAN_X = -IMAGE_WIDTH / 2 + SCREEN_WIDTH / 2;
const INITIAL_PAN_Y = -IMAGE_HEIGHT / 2 + SCREEN_HEIGHT / 2;
const INITIAL_ROTATION = 0;

export default class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      panX: new Animated.Value(INITIAL_PAN_X),
      panY: new Animated.Value(INITIAL_PAN_Y),
      pinchScale: new Animated.Value(1),
      baseScale: new Animated.Value(INITIAL_SCALE),
      rotation: new Animated.Value(INITIAL_ROTATION),
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

    this._handleRotationGestureEvent = Animated.event(
      [{ nativeEvent: { rotation: this.state.rotation } }],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }

  render() {
    const { panX, panY, baseScale, pinchScale, rotation } = this.state;
    const scale = Animated.multiply(baseScale, pinchScale);

    const rotate = rotation.interpolate({
      inputRange: [-1.5, 1.5],
      outputRange: ['-90deg', '90deg'],
      extrapolate: 'clamp',
    });

    return (
      <PanGestureHandler
        id="pan"
        minDeltaX={10}
        minDeltaY={10}
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
            <TapGestureHandler
              numberOfTaps={2}
              onHandlerStateChange={this._handleDoubleTapGestureStateChange}>
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
                            Animated.add(
                              panX,
                              Animated.divide(SCREEN_WIDTH, -2)
                            ),
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
            </TapGestureHandler>
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

  _handleRotationGestureStateChange = e => {
    const { oldState } = e.nativeEvent;

    if (oldState === State.ACTIVE) {
      this.state.rotation.extractOffset();
    }
  };

  _handleDoubleTapGestureStateChange = e => {
    const { state } = e.nativeEvent;

    if (state === State.ACTIVE) {
      this._resetState();
    }
  };

  _resetState = () => {
    const { panX, panY, rotation, baseScale } = this.state;

    // Remove offsets
    panX.flattenOffset();
    panY.flattenOffset();
    rotation.flattenOffset();

    // Animate things back
    const duration = 150;
    Animated.timing(panX, {
      toValue: INITIAL_PAN_X,
      duration,
    }).start(({ finished }) => {
      if (finished) {
        panX.extractOffset();
      }
    });

    Animated.timing(panY, {
      toValue: INITIAL_PAN_Y,
      duration,
    }).start(({ finished }) => {
      if (finished) {
        panY.extractOffset();
      }
    });

    Animated.timing(rotation, {
      toValue: INITIAL_ROTATION,
      duration,
    }).start(({ finished }) => {
      if (finished) {
        rotation.extractOffset();
      }
    });

    Animated.timing(baseScale, { toValue: INITIAL_SCALE, duration }).start();
    this._lastScale = INITIAL_SCALE;
  };
}
