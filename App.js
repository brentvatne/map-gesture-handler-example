import React, { Component } from 'react';
import { Dimensions, StyleSheet, StatusBar, View } from 'react-native';
import { Asset, AppLoading, KeepAwake } from 'expo';
// import Map from './step1/Map';
// import Map from './step2/Map';
// import Map from './step3/Map';
// import Map from './step4/Map';
// import Map from './step5/Map';
// import Map from './step6/Map';
import Map from './step7/Map';

export default class App extends Component {
  state = {
    loaded: false,
  };

  render() {
    if (this.state.loaded) {
      return (
        <View style={styles.container}>
          <Map />
          <StatusBar hidden />
          <KeepAwake />
        </View>
      );
    } else {
      return (
        <AppLoading
          startAsync={this._loadMapAsync}
          onFinish={() => this.setState({ loaded: true })}
        />
      );
    }
  }

  _loadMapAsync = async () => {
    await Asset.fromModule(require('./assets/tokyo-train-map.jpg')).downloadAsync();
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
