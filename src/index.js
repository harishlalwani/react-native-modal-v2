import React, { Component } from 'react';
import { Dimensions, Modal, DeviceEventEmitter, TouchableWithoutFeedback, Image } from 'react-native';
import PropTypes from 'prop-types';
import { View, initializeRegistryWithDefinitions } from 'react-native-animatable';
//import * as ANIMATION_DEFINITIONS from './animations';
import {    
    Header,    
    Title,
    Left,
    Right,
    Body,    
    Button,    
} from 'native-base';
var { height, width } = Dimensions.get('window');
//import styles from './index.style.js';

// Override default animations
//initializeRegistryWithDefinitions(ANIMATION_DEFINITIONS);

export class ReactNativeModal extends Component {
  static propTypes = {
    animationIn: PropTypes.string,
    animationInTiming: PropTypes.number,
    animationOut: PropTypes.string,
    animationOutTiming: PropTypes.number,
    backdropColor: PropTypes.string,
    backdropOpacity: PropTypes.number,
    backdropTransitionInTiming: PropTypes.number,
    backdropTransitionOutTiming: PropTypes.number,
    children: PropTypes.node.isRequired,
    isVisible: PropTypes.bool.isRequired,
    onModalShow: PropTypes.func,
    onModalHide: PropTypes.func,
    onBackButtonPress: PropTypes.func,
    onBackdropPress: PropTypes.func,
    style: PropTypes.any,
  };

  static defaultProps = {
    animationIn: 'slideInUp',
    animationInTiming: 300,
    animationOut: 'slideOutDown',
    animationOutTiming: 300,
    backdropColor: 'black',
    backdropOpacity: 0.70,
    backdropTransitionInTiming: 300,
    backdropTransitionOutTiming: 300,
    onModalShow: () => null,
    onModalHide: () => null,
    isVisible: false,
    onBackdropPress: () => null,
    onBackButtonPress: () => null,
  };

  // We use an internal state for keeping track of the modal visibility: this allows us to keep
  // the modal visibile during the exit animation, even if the user has already change the
  // isVisible prop to false.
  // We also store in the state the device width and height so that we can update the modal on
  // device rotation.
  state = {
    isVisible: false,
    deviceWidth: Dimensions.get('window').width,
    deviceHeight: Dimensions.get('window').height,
  };

  componentWillReceiveProps(nextProps) {
    if (!this.state.isVisible && nextProps.isVisible) {
      this.setState({ isVisible: true });
    }
  }

  componentWillMount() {
    if (this.props.isVisible) {
      this.setState({ isVisible: true });
    }
  }

  componentDidMount() {
    if (this.state.isVisible) {
      this._open();
    }
    DeviceEventEmitter.addListener('didUpdateDimensions', this._handleDimensionsUpdate);
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('didUpdateDimensions', this._handleDimensionsUpdate);
  }

  componentDidUpdate(prevProps, prevState) {
    // On modal open request, we slide the view up and fade in the backdrop
    if (this.state.isVisible && !prevState.isVisible) {
      this._open();
      // On modal close request, we slide the view down and fade out the backdrop
    } else if (!this.props.isVisible && prevProps.isVisible) {
      this._close();
    }
  }

  _handleDimensionsUpdate = dimensionsUpdate => {
    // Here we update the device dimensions in the state if the layout changed (triggering a render)
    const deviceWidth = Dimensions.get('window').width;
    const deviceHeight = Dimensions.get('window').height;
    if (deviceWidth !== this.state.deviceWidth || deviceHeight !== this.state.deviceHeight) {
      this.setState({ deviceWidth, deviceHeight });
    }
  };

  _open = () => {
    this.backdropRef.transitionTo(
      { opacity: this.props.backdropOpacity },
      this.props.backdropTransitionInTiming,
    );
    this.contentRef[this.props.animationIn](this.props.animationInTiming).then(() => {
      this.props.onModalShow();
    });
  };

  _close = async () => {
    this.backdropRef.transitionTo({ opacity: 0 }, this.props.backdropTransitionOutTiming);
    this.contentRef[this.props.animationOut](this.props.animationOutTiming).then(() => {
      this.setState({ isVisible: false });
      this.props.onModalHide();
    });
  };

  render() {
    const {
      animationIn,
      animationInTiming,
      animationOut,
      animationOutTiming,
      backdropColor,
      backdropOpacity,
      backdropTransitionInTiming,
      backdropTransitionOutTiming,
      children,
      isVisible,
      onModalShow,
      onBackdropPress,
      onBackButtonPress,
      style,
      ...otherProps
    } = this.props;
    const { deviceWidth, deviceHeight } = this.state;
    return (
      <Modal
        transparent={true}
        animationType={'none'}
        visible={this.state.isVisible}
        onRequestClose={onBackButtonPress}
        {...otherProps}
      >
        <Header style={{backgroundColor:'#00cdbe', elevation: 1.2, width:"100%"}}>
            <Left style={{flex:2, marginLeft:"1%",width:'100%'}}>
              <View style={{flexDirection: 'row'}}>
                <Button transparent onPress={onBackdropPress}>
                  <Image source={require('../../../assets/home/back_icon.png')}
                    style={{width: 0.07 * width, height: 0.03 * height, tintColor: '#FFFFFF'}}/>
                </Button>
                <Title></Title>
              </View>
            </Left>
        </Header>
        <TouchableWithoutFeedback>
          <View
            ref={ref => (this.backdropRef = ref)}
            style={{
                position: 'absolute',
                top: 50,
                bottom: 0,
                left: 0,
                right: 0,
                opacity: 0,
                backgroundColor: 'black',
                backgroundColor: backdropColor,
                width: deviceWidth,
                height: deviceHeight,
              }}
          />
        </TouchableWithoutFeedback>
        <View
          ref={ref => (this.contentRef = ref)}
          style={[
            { margin: deviceWidth * 0.05, transform: [{ translateY: 0 }] },
            {flex: 1, justifyContent: 'center'},
            style,
          ]}
          pointerEvents="box-none"
          {...otherProps}
        >
          {children}
        </View>
      </Modal>
    );
  }
}

export default ReactNativeModal;
